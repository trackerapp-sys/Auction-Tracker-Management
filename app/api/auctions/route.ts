import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Auction from '@/models/Auction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { groupName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const auctions = await Auction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
    
    return NextResponse.json(auctions)
  } catch (error) {
    console.error('Error fetching auctions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.groupName || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const auction = new Auction({
      ...body,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      currentBid: body.currentBid || 0,
      totalBids: 0,
      status: 'active'
    })
    
    await auction.save()
    
    return NextResponse.json(auction, { status: 201 })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    )
  }
}

