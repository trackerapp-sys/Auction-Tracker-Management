import { FacebookComment } from './facebook-parser'

const FACEBOOK_API_VERSION = 'v18.0'
const FACEBOOK_API_BASE = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`

export interface FacebookApiConfig {
  accessToken: string
  appId: string
  appSecret: string
}

interface GraphApiResponse {
  data: Array<{
    id: string
    message?: string
    from: {
      name: string
      id: string
    }
    created_time: string
    permalink_url?: string
  }>
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

/**
 * Fetch comments from a Facebook post using the Graph API
 * Note: This requires Facebook App Review for access to public posts
 * For groups, you need Group Admin access and the appropriate permissions
 */
export async function fetchFacebookComments(postId: string, accessToken: string): Promise<FacebookComment[]> {
  try {
    const url = `${FACEBOOK_API_BASE}/${postId}/comments?fields=id,message,from,created_time,permalink_url&limit=100&access_token=${accessToken}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Facebook API Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data: GraphApiResponse = await response.json()
    
    // Convert API response to our interface
    const comments: FacebookComment[] = data.data.map(comment => ({
      id: comment.id,
      message: comment.message || '',
      from: {
        name: comment.from.name,
        id: comment.from.id,
      },
      created_time: comment.created_time,
      permalink_url: comment.permalink_url,
    }))

    return comments
  } catch (error) {
    console.error('Error fetching Facebook comments:', error)
    throw error
  }
}

/**
 * Alternative method using web scraping for public posts (fallback)
 * This method scrapes the Facebook post page directly
 * Note: This is fragile and may break with Facebook UI changes
 */
export async function scrapeFacebookComments(postUrl: string): Promise<FacebookComment[]> {
  try {
    // This would use a scraping service or headless browser
    // For now, return mock data with a note about implementation
    console.warn('Scraping method not implemented yet - returning mock data')
    
    return [
      {
        id: "scrape_comment_1",
        message: "I bid $150 for this watch",
        from: { name: "John Smith", id: "scrape_user_123" },
        created_time: new Date().toISOString(),
        permalink_url: `${postUrl}#comment1`
      },
      {
        id: "scrape_comment_2", 
        message: "$200 AUD",
        from: { name: "Sarah Johnson", id: "scrape_user_456" },
        created_time: new Date().toISOString(),
        permalink_url: `${postUrl}#comment2`
      },
    ]
  } catch (error) {
    console.error('Error scraping Facebook comments:', error)
    throw error
  }
}

/**
 * Get Facebook page access token for a business account
 * This requires proper Facebook App setup and user authentication
 */
export async function getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
  try {
    const url = `${FACEBOOK_API_BASE}/${pageId}?fields=access_token&access_token=${userAccessToken}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Facebook API Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting page access token:', error)
    throw error
  }
}

/**
 * Validate a Facebook access token
 */
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const url = `${FACEBOOK_API_BASE}/me?access_token=${accessToken}`
    
    const response = await fetch(url)
    return response.ok
  } catch (error) {
    console.error('Error validating access token:', error)
    return false
  }
}

