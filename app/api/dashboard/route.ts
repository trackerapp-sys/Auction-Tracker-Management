import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Auction from '@/models/Auction'
import Bid from '@/models/Bid'

export async function GET() {
  try {
    await connectDB()
    
    // Get active auctions count
    const activeAuctions = await Auction.countDocuments({ status: 'active' })
    
    // Get total bids count
    const totalBids = await Bid.countDocuments()
    
    // Get total value of all bids
    const totalValueResult = await Bid.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$amount' }
        }
      }
    ])
    const totalValue = totalValueResult[0]?.totalValue || 0
    
    // Get auctions ended today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const auctionsEndedToday = await Auction.countDocuments({
      status: 'ended',
      endTime: { $gte: today, $lt: tomorrow }
    })
    
    // Get top bidder
    const topBidderResult = await Bid.aggregate([
      {
        $group: {
          _id: '$bidderName',
          totalBids: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 1 }
    ])
    const topBidder = topBidderResult[0]?._id || 'No bids yet'
    
    // Get average bid amount
    const averageBidResult = await Bid.aggregate([
      {
        $group: {
          _id: null,
          averageAmount: { $avg: '$amount' }
        }
      }
    ])
    const averageBidAmount = averageBidResult[0]?.averageAmount || 0
    
    const stats = {
      activeAuctions,
      totalBids,
      totalValue,
      auctionsEndedToday,
      topBidder,
      averageBidAmount: Math.round(averageBidAmount * 100) / 100
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

