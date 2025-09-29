import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Settings from '@/models/Settings'

export async function GET() {
  try {
    await connectDB()
    
    let settings = await Settings.findOne()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        timezone: 'Australia/Sydney',
        language: 'en-AU',
        currency: 'AUD',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        notifications: {
          newBid: true,
          auctionEnding: true,
          auctionEnded: true,
          email: true,
          push: false,
        },
        defaultBidIncrement: 50,
        autoArchiveDays: 30,
      })
      
      await settings.save()
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    let settings = await Settings.findOne()
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings(body)
    } else {
      // Update existing settings
      Object.assign(settings, body)
    }
    
    await settings.save()
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

