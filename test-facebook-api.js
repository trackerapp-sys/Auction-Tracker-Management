// Test script to verify Facebook API token works
const FACEBOOK_API_VERSION = 'v18.0'
const FACEBOOK_API_BASE = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`
const ACCESS_TOKEN = '73f5b2c473b69a504559bbc510243d02'

async function testFacebookToken() {
  try {
    console.log('Testing Facebook access token...')
    
    // Test basic token validation
    const testUrl = `${FACEBOOK_API_BASE}/me?access_token=${ACCESS_TOKEN}`
    console.log('Testing URL:', testUrl)
    
    const response = await fetch(testUrl)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Token validation failed:', errorData)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Token validation successful!')
    console.log('User data:', data)
    
    return true
  } catch (error) {
    console.error('❌ Error testing token:', error)
    return false
  }
}

async function testPostComments(postId) {
  try {
    console.log(`\nTesting comments fetch for post ID: ${postId}`)
    
    const url = `${FACEBOOK_API_BASE}/${postId}/comments?fields=id,message,from,created_time,permalink_url&limit=10&access_token=${ACCESS_TOKEN}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Comments fetch failed:', errorData)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Comments fetched successfully!')
    console.log(`Found ${data.data.length} comments:`)
    
    data.data.forEach((comment, index) => {
      console.log(`${index + 1}. ${comment.from.name}: "${comment.message}"`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error fetching comments:', error)
    return false
  }
}

// Run tests
testFacebookToken().then(valid => {
  if (valid) {
    // Test with a sample post ID (you can replace this)
    const samplePostId = '123456789' // Replace with actual post ID
    testPostComments(samplePostId)
  }
})

