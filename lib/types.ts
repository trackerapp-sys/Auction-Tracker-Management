export interface Auction {
  id: string
  title: string
  description: string
  groupName: string
  groupUrl: string
  startTime: Date
  endTime: Date
  status: 'active' | 'ended' | 'cancelled'
  currentBid: number
  currency: string
  bidIncrement: number
  reservePrice?: number
  buyItNowPrice?: number
  highestBidder?: string
  totalBids: number
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  auctionId: string
  bidderName: string
  bidderId?: string
  amount: number
  timestamp: Date
  isWinning: boolean
  commentUrl?: string
  notes?: string
  confidence?: number // Bid detection confidence score (0-1)
  isIncrement?: boolean // Whether this was detected as an increment bid
}

export interface Group {
  id: string
  name: string
  url: string
  isActive: boolean
  lastChecked: Date
  settings: {
    autoTrack: boolean
    keywords: string[]
    minBidAmount: number
  }
}

export interface Settings {
  timezone: string
  language: string
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  notifications: {
    newBid: boolean
    auctionEnding: boolean
    auctionEnded: boolean
    email: boolean
    push: boolean
  }
  defaultBidIncrement: number
  autoArchiveDays: number
}

export interface DashboardStats {
  activeAuctions: number
  totalBids: number
  totalValue: number
  auctionsEndedToday: number
  topBidder: string
  averageBidAmount: number
}

