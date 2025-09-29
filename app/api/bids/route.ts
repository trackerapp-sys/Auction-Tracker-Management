import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Bid from '@/models/Bid'
import Auction from '@/models/Auction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const auctionId = searchParams.get('auctionId')
    
    let query: any = {}
    
    if (auctionId) {
      query.auctionId = auctionId
    }
    
    const bids = await Bid.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
    
    return NextResponse.json(bids)
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.auctionId || !body.bidderName || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if auction exists
    const auction = await Auction.findById(body.auctionId)
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    // Check if bid is higher than current bid
    if (body.amount <= auction.currentBid) {
      return NextResponse.json(
        { error: 'Bid must be higher than current bid' },
        { status: 400 }
      )
    }
    
    // Create new bid
    const bid = new Bid({
      ...body,
      timestamp: new Date(),
      isWinning: true
    })
    
    // Update previous winning bid to false
    await Bid.updateMany(
      { auctionId: body.auctionId, isWinning: true },
      { isWinning: false }
    )
    
    // Save new bid
    await bid.save()
    
    // Update auction with new current bid
    await Auction.findByIdAndUpdate(body.auctionId, {
      currentBid: body.amount,
      highestBidder: body.bidderName,
      totalBids: auction.totalBids + 1,
      updatedAt: new Date()
    })
    
    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    console.error('Error creating bid:', error)
    return NextResponse.json(
      { error: 'Failed to create bid' },
      { status: 500 }
    )
  }
}

