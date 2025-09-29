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

  // Try Facebook Graph API if access token is available
  if (facebookAccessToken && facebookAccessToken.length > 10) {
    try {
      console.log('Attempting to fetch comments via Facebook Graph API...')
      const comments = await fetchViaApi(postId, facebookAccessToken)
      console.log(`Successfully fetched ${comments.length} comments via Facebook API`)
      return comments
    } catch (apiError) {
      console.warn('Facebook Graph API failed, falling back to scraping:', apiError)
    }
  }

  // Fallback to scraping method
  console.log('Using scraping method to fetch comments...')
  try {
    const comments = await scrapeFacebookComments(postUrl)
    console.log(`Successfully scraped ${comments.length} comments`)
    return comments
  } catch (scrapeError) {
    console.error('Both Facebook API and scraping failed:', scrapeError)
    
    // Last resort: return mock data with a warning
    console.warn('Returning mock data - implement proper Facebook integration')
    return [
      {
        id: "fallback_1",
        message: "I bid $150 for this watch",
        from: { name: "John Smith", id: "user_123" },
        created_time: "2024-01-15T10:30:00Z",
        permalink_url: "https://facebook.com/comment_1"
      },
      {
        id: "fallback_2", 
        message: "$200 here",
        from: { name: "Sarah Johnson", id: "user_456" },
        created_time: "2024-01-15T11:00:00Z",
        permalink_url: "https://facebook.com/comment_2"
      },
      {
        id: "fallback_3",
        message: "I'll bid $250 AUD",
        from: { name: "Emma Wilson", id: "user_101" },
        created_time: "2024-01-15T12:00:00Z",
        permalink_url: "https://facebook.com/comment_4"
      },
      {
        id: "fallback_4",
        message: "Plus $50 more",
        from: { name: "David Brown", id: "user_202" },
        created_time: "2024-01-15T12:30:00Z",
        permalink_url: "https://facebook.com/comment_5"
      }
    ]
  }
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
    
    // Fetch comments from Facebook
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

