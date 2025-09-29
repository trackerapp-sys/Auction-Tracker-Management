import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Auction from '@/models/Auction'
import Bid from '@/models/Bid'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const auction = await Auction.findById(params.id)
    
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    // Get bids for this auction
    const bids = await Bid.find({ auctionId: params.id })
      .sort({ timestamp: -1 })
    
    return NextResponse.json({ auction, bids })
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const auction = await Auction.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(auction)
  } catch (error) {
    console.error('Error updating auction:', error)
    return NextResponse.json(
      { error: 'Failed to update auction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Delete associated bids first
    await Bid.deleteMany({ auctionId: params.id })
    
    const auction = await Auction.findByIdAndDelete(params.id)
    
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Auction deleted successfully' })
  } catch (error) {
    console.error('Error deleting auction:', error)
    return NextResponse.json(
      { error: 'Failed to delete auction' },
      { status: 500 }
    )
  }
}

