// Facebook comment parsing utilities for bid detection
export interface FacebookComment {
  id: string
  message: string
  from: {
    name: string
    id: string
  }
  created_time: string
  permalink_url?: string
}

export interface ParsedBid {
  bidderName: string
  bidderId: string
  amount: number
  commentUrl: string
  timestamp: Date
  confidence: number // 0-1 confidence score
  isIncrement?: boolean // true if this is an increment bid
  notes?: string // Optional notes field for processing
}

// Common bid patterns to detect
const BID_PATTERNS = [
  // More specific currency patterns
  /(?:\$|€|£|¥)(\d+(?:[.,]\d{1,2})?)/gi,
  /(\d+(?:[.,]\d{1,2})?)\s*(?:dollars?|eur|gbp|jpy|aud)/gi,
  /bid\s*(?:\$|€|£|¥)?(\d+(?:[.,]\d{1,2})?)/gi,
  
  // More specific increment patterns
  /\+\s*(?:\$|€|£|¥)?(\d+(?:[.,]\d{1,2})?)/gi,
  /plus\s*(?:\$|€|£|¥)?(\d+(?:[.,]\d{1,2})?)/gi,
  /add\s*(?:\$|€|£|¥)?(\d+(?:[.,]\d{1,2})?)/gi,
  
  // General number patterns (lower confidence)
  /(\d+(?:[.,]\d{1,2})?)/gi,
]

// Keywords that indicate a bid
const BID_KEYWORDS = [
  'bid', 'bidding', 'offer', 'auction', 'dollar', 'dollars', 'aud', 'au',
  'plus', 'add', 'increase', 'raise', 'higher', 'more', 'up', 'mine', 'in'
]

// Keywords that indicate NOT a bid
const NON_BID_KEYWORDS = [
  'question', 'ask', 'wondering', 'curious', 'interested', 'available',
  'sold', 'gone', 'taken', 'withdrawn', 'cancel', 'retract', 'not a bid',
  'for sale', 'iso', 'in search of'
]

export function parseBidFromComment(comment: FacebookComment): ParsedBid | null {
  const message = comment.message.toLowerCase().replace(/,/g, '') // Remove commas from numbers
  
  // Skip if message is too short or contains non-bid keywords
  if (message.length < 1 || NON_BID_KEYWORDS.some(keyword => message.includes(keyword))) {
    return null
  }
  
  let bestMatch: { amount: number; confidence: number; isIncrement: boolean } | null = null
  
  // Try each pattern
  for (const pattern of BID_PATTERNS) {
    const matches = [...message.matchAll(pattern)]
    
    for (const match of matches) {
      const amount = parseFloat(match[1].replace(',', '.')) // Standardize decimal point
      
      if (amount > 0 && amount < 1000000) { // Reasonable bid range
        let confidence = 0.4 // Base confidence
        let isIncrement = false
        
        // Check if this is an increment pattern
        if (pattern.source.includes('\\+') || pattern.source.includes('plus') || pattern.source.includes('add')) {
          isIncrement = true
          confidence += 0.2 // Higher confidence for increment patterns
        }
        
        // Increase confidence based on context
        const context = message.substring(Math.max(0, match.index! - 30), match.index! + match[0].length + 30)
        
        // Check for bid keywords in context
        const bidKeywordCount = BID_KEYWORDS.filter(keyword => context.includes(keyword)).length
        confidence += bidKeywordCount * 0.15
        
        // Increase confidence for direct patterns
        if (pattern.source.includes('bid') || pattern.source.includes('\\$') || pattern.source.includes('€') || pattern.source.includes('£') || pattern.source.includes('¥')) {
          confidence += 0.3
        }
        
        // Decrease confidence for very common numbers or numbers in weird places
        if (amount < 10 || amount % 100 === 0) {
          confidence -= 0.05
        }
        if (match.index! > 50) { // Number appears late in the comment
          confidence -= 0.1
        }
        
        // Check if this is the best match so far
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { amount, confidence, isIncrement }
        }
      }
    }
  }
  
  // Only return if confidence is high enough
  if (bestMatch && bestMatch.confidence >= 0.5) {
    return {
      bidderName: comment.from.name,
      bidderId: comment.from.id,
      amount: bestMatch.amount,
      commentUrl: comment.permalink_url || `https://facebook.com/${comment.id}`,
      timestamp: new Date(comment.created_time),
      confidence: bestMatch.confidence,
      isIncrement: bestMatch.isIncrement
    }
  }
  
  return null
}

export function extractPostIdFromUrl(url: string): string | null {
  // Extract post ID from various Facebook URL formats
  const patterns = [
    // Standard permalink formats
    /\/permalink\/(\d+)/,
    /\/posts\/(\d+)/,
    /\/story\.php\?story_fbid=(\d+)/,
    
    // Group permalink formats
    /\/groups\/[^\/]+\/permalink\/(\d+)/,
    /\/groups\/[^\/]+\/posts\/(\d+)/,
    
    // Profile/page post formats  
    /facebook\.com\/[^\/]+\/posts\/(\d+)/,
    /facebook\.com\/[^\/]+\/story\.php\?story_fbid=(\d+)/,
    
    // Group post formats
    /facebook\.com\/groups\/[^\/]+\/permalink\/(\d+)/,
    /facebook\.com\/groups\/[^\/]+\/posts\/(\d+)/,
    
    // m.facebook.com formats
    /m\.facebook\.com\/[^\/]+\/permalink\/(\d+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

export function validateFacebookUrl(url: string): boolean {
  return /facebook\.com/.test(url) && extractPostIdFromUrl(url) !== null
}

