import { NextRequest, NextResponse } from 'next/server'
import { parseBidFromComment, extractPostIdFromUrl, validateFacebookUrl, FacebookComment } from '@/lib/facebook-parser'
import { fetchFacebookComments, scrapeFacebookComments } from '@/lib/facebook-api'

// Mock Facebook API response for development
// In production, you would use Facebook Graph API or a service like GroupsTracker
const MOCK_COMMENTS: FacebookComment[] = [
  {
    id: "comment_1",
    message: "I bid $150 for this watch",
    from: { name: "John Smith", id: "user_123" },
    created_time: "2024-01-15T10:30:00Z",
    permalink_url: "https://facebook.com/comment_1"
  },
  {
    id: "comment_2", 
    message: "$200 here",
    from: { name: "Sarah Johnson", id: "user_456" },
    created_time: "2024-01-15T11:00:00Z",
    permalink_url: "https://facebook.com/comment_2"
  },
  {
    id: "comment_3",
    message: "Just a question about the condition",
    from: { name: "Mike Chen", id: "user_789" },
    created_time: "2024-01-15T11:15:00Z",
    permalink_url: "https://facebook.com/comment_3"
  },
  {
    id: "comment_4",
    message: "I'll bid $250 AUD",
    from: { name: "Emma Wilson", id: "user_101" },
    created_time: "2024-01-15T12:00:00Z",
    permalink_url: "https://facebook.com/comment_4"
  },
  {
    id: "comment_5",
    message: "Plus $50 more",
    from: { name: "David Brown", id: "user_202" },
    created_time: "2024-01-15T12:30:00Z",
    permalink_url: "https://facebook.com/comment_5"
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postUrl, auctionId } = body
    
    if (!postUrl || !auctionId) {
      return NextResponse.json(
        { error: 'Missing postUrl or auctionId' },
        { status: 400 }
      )
    }
    
    // Validate Facebook URL
    if (!validateFacebookUrl(postUrl)) {
      return NextResponse.json(
        { error: 'Invalid Facebook post URL' },
        { status: 400 }
      )
    }
    
    // Extract post ID
    const postId = extractPostIdFromUrl(postUrl)
    if (!postId) {
      return NextResponse.json(
        { error: 'Could not extract post ID from URL' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching comments for post ID: ${postId}`)
    
    // Try to fetch real comments from Facebook
    let comments: FacebookComment[]
    try {
      const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN
      
      if (facebookAccessToken && facebookAccessToken.length > 10) {
        console.log('Attempting to fetch real comments via Facebook Graph API...')
        comments = await fetchFacebookComments(postId, facebookAccessToken)
      } else {
        comments = await scrapeFacebookComments(postUrl)
      }
    } catch (error) {
      console.warn('Failed to fetch real comments, using mock data:', error)
      comments = MOCK_COMMENTS
    }
    
    // Parse bids from comments
    const detectedBids = []
    for (const comment of comments) {
      const parsedBid = parseBidFromComment(comment)
      if (parsedBid) {
        detectedBids.push({
          ...parsedBid,
          auctionId,
          postId
        })
      }
    }
    
    // Sort by timestamp (oldest first)
    detectedBids.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    
    return NextResponse.json({
      success: true,
      postId,
      totalComments: MOCK_COMMENTS.length,
      detectedBids: detectedBids.length,
      bids: detectedBids
    })
    
  } catch (error) {
    console.error('Error parsing Facebook comments:', error)
    return NextResponse.json(
      { error: 'Failed to parse comments' },
      { status: 500 }
    )
  }
}

// GET endpoint to test the parser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testMessage = searchParams.get('message') || 'I bid $150 for this item'
  
  const mockComment: FacebookComment = {
    id: 'test_comment',
    message: testMessage,
    from: { name: 'Test User', id: 'test_user' },
    created_time: new Date().toISOString(),
    permalink_url: 'https://facebook.com/test_comment'
  }
  
  const parsedBid = parseBidFromComment(mockComment)
  
  return NextResponse.json({
    testMessage,
    parsedBid,
    isValidBid: parsedBid !== null
  })
}

