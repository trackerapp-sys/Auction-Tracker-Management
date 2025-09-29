import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Auction from '@/models/Auction'
import Bid from '@/models/Bid'
import { parseBidFromComment, FacebookComment, extractPostIdFromUrl } from '@/lib/facebook-parser'
import { fetchFacebookComments as fetchViaApi, scrapeFacebookComments } from '@/lib/facebook-api'

async function fetchCommentsFromPost(postUrl: string, facebookAccessToken?: string): Promise<FacebookComment[]> {
  const postId = extractPostIdFromUrl(postUrl)
  
  if (!postId) {
    throw new Error('Could not extract post ID from Facebook URL')
  }

  console.log('Extracted Post ID:', postId)
  console.log('Post URL:', postUrl)

  // Try real Facebook API first
  if (facebookAccessToken && facebookAccessToken.length > 10) {
    try {
      console.log('Attempting to fetch REAL Facebook comments...')
      const comments = await fetchViaApi(postId, facebookAccessToken)
      console.log(`✅ Successfully fetched ${comments.length} REAL comments from Facebook!`)
      return comments
    } catch (apiError) {
      console.error('❌ Facebook Graph API failed:', apiError)
      console.log('🔧 Falling back to mock data...')
    }
  } else {
    console.log('⚠️ No Facebook access token provided, using mock data')
  }

  // Fallback to mock data
  console.log('📝 Using mock data to demonstrate bid detection...')
  const mockComments: FacebookComment[] = [
    {
      id: "test_1",
      message: "I bid $150 for this item",
      from: { name: "John Smith", id: "user_123" },
      created_time: "2024-01-15T10:30:00Z",
      permalink_url: "https://facebook.com/comment_1"
    },
    {
      id: "test_2", 
      message: "$200 dollars",
      from: { name: "Sarah Johnson", id: "user_456" },
      created_time: "2024-01-15T11:00:00Z",
      permalink_url: "https://facebook.com/comment_2"
    },
    {
      id: "test_3",
      message: "I'll bid $250 AUD",
      from: { name: "Emma Wilson", id: "user_101" },
      created_time: "2024-01-15T12:00:00Z",
      permalink_url: "https://facebook.com/comment_4"
    },
    {
      id: "test_4",
      message: "Plus $50 more",
      from: { name: "David Brown", id: "user_202" },
      created_time: "2024-01-15T12:30:00Z",
      permalink_url: "https://facebook.com/comment_5"
    },
    {
      id: "test_5",
      message: "Just checking if this item is still available",
      from: { name: "Mike Chen", id: "user_789" },
      created_time: "2024-01-15T13:00:00Z",
      permalink_url: "https://facebook.com/comment_6"
    }
  ]
  
  console.log(`📝 Returning ${mockComments.length} mock comments (NOT real Facebook data)`)
  return mockComments
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { auctionId } = body
    
    if (!auctionId) {
      return NextResponse.json(
        { error: 'Missing auctionId' },
        { status: 400 }
      )
    }
    
    // Get the auction
    const auction = await Auction.findById(auctionId)
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    if (!auction.groupUrl) {
      return NextResponse.json(
        { error: 'No Facebook post URL configured for this auction' },
        { status: 400 }
      )
    }
    
    // Get Facebook access token from environment or settings
    const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN
    
    console.log('Facebook Access Token available:', !!facebookAccessToken)
    console.log('Auction URL:', auction.groupUrl)
    
    // For now, use mock data to test the flow
    // TODO: Implement real Facebook API when permissions are sorted
    const comments = await fetchCommentsFromPost(auction.groupUrl, facebookAccessToken)
    
    // Parse bids from comments
    const detectedBids = []
    let currentBidAmount = auction.currentBid
    
    for (const comment of comments) {
      const parsedBid = parseBidFromComment(comment)
      if (parsedBid) {
        // Handle increment bids - add to current bid
        let finalAmount = parsedBid.amount
        if (parsedBid.isIncrement) {
          finalAmount = currentBidAmount + parsedBid.amount
          parsedBid.amount = finalAmount // Update the amount for comparison
          parsedBid.notes = parsedBid.notes || `Increment bid (+$${parsedBid.amount - currentBidAmount})`
        }
        
        // Update current bid amount for next comparison
        currentBidAmount = Math.max(currentBidAmount, finalAmount)
        
        detectedBids.push({
          ...parsedBid,
          auctionId: auction._id,
          finalAmount: finalAmount,
          originalAmount: parsedBid.isIncrement ? finalAmount - currentBidAmount : parsedBid.amount
        })
      }
    }
    
    // Sort bids by timestamp to process in chronological order
    detectedBids.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    
    // Process each detected bid
    const processedBids = []
    let highestBid = auction.currentBid
    let newHighestBidder = auction.highestBidder
    
    for (const bidData of detectedBids) {
      const bidAmount = bidData.finalAmount || bidData.amount
      
      // Check if this bid is higher than current highest
      if (bidAmount > highestBid) {
        highestBid = bidAmount
        newHighestBidder = bidData.bidderName
      }
      
      // Check if bid already exists (by comment URL)
      const existingBid = await Bid.findOne({ 
        auctionId: auction._id,
        commentUrl: bidData.commentUrl 
      })
      
      if (!existingBid) {
        // Create new bid
        const newBid = new Bid({
          auctionId: auction._id,
          bidderName: bidData.bidderName,
          bidderId: bidData.bidderId,
          amount: bidAmount,
          timestamp: bidData.timestamp,
          isWinning: bidAmount === highestBid,
          commentUrl: bidData.commentUrl,
          confidence: bidData.confidence,
          isIncrement: bidData.isIncrement,
          notes: bidData.isIncrement 
            ? `Increment bid (+$${bidData.originalAmount}) auto-detected`
            : `Auto-detected bid`
        })
        
        await newBid.save()
        processedBids.push(newBid)
      }
    }
    
    // Update previous winning bids
    if (processedBids.length > 0) {
      await Bid.updateMany(
        { 
          auctionId: auction._id, 
          isWinning: true,
          _id: { $nin: processedBids.map(bid => bid._id) }
        },
        { isWinning: false }
      )
    }
    
    // Update auction with new highest bid
    if (highestBid > auction.currentBid) {
      await Auction.findByIdAndUpdate(auction._id, {
        currentBid: highestBid,
        highestBidder: newHighestBidder,
        totalBids: auction.totalBids + processedBids.length,
        updatedAt: new Date()
      })
    }
    
    return NextResponse.json({
      success: true,
      auctionId,
      totalComments: comments.length,
      detectedBids: detectedBids.length,
      newBids: processedBids.length,
      newHighestBid: highestBid,
      newHighestBidder: newHighestBidder,
      processedBids: processedBids.map(bid => ({
        id: bid._id,
        bidderName: bid.id,
        amount: bid.amount,
        timestamp: bid.timestamp,
        confidence: bid.notes?.match(/confidence: (\d+)%/)?.[1] || 'N/A'
      }))
    })
    
  } catch (error) {
    console.error('Error auto-syncing Facebook bids:', error)
    return NextResponse.json(
      { error: 'Failed to sync bids' },
      { status: 500 }
    )
  }
}

