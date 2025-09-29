import { Auction, Bid, Group, Settings, DashboardStats } from './types'

// Mock data for development
export const mockAuctions: Auction[] = [
  {
    id: '1',
    title: 'Vintage Rolex Submariner',
    description: 'Beautiful vintage Rolex Submariner from 1970s, excellent condition',
    groupName: 'Luxury Watches Australia',
    groupUrl: 'https://facebook.com/groups/luxurywatches',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-20T18:00:00'),
    status: 'active',
    currentBid: 8500,
    currency: 'AUD',
    bidIncrement: 100,
    reservePrice: 8000,
    highestBidder: 'John Smith',
    totalBids: 12,
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-18T14:30:00'),
  },
  {
    id: '2',
    title: 'Antique Mahogany Dining Table',
    description: 'Stunning 8-seater mahogany dining table, circa 1920s',
    groupName: 'Antique Furniture Melbourne',
    groupUrl: 'https://facebook.com/groups/antiquefurniture',
    startTime: new Date('2024-01-10T09:00:00'),
    endTime: new Date('2024-01-17T17:00:00'),
    status: 'ended',
    currentBid: 2200,
    currency: 'AUD',
    bidIncrement: 50,
    highestBidder: 'Sarah Johnson',
    totalBids: 8,
    createdAt: new Date('2024-01-10T08:00:00'),
    updatedAt: new Date('2024-01-17T17:00:00'),
  },
  {
    id: '3',
    title: 'Limited Edition Sneakers Collection',
    description: 'Rare Nike Air Jordan 1 Retro High OG',
    groupName: 'Sneakerheads Sydney',
    groupUrl: 'https://facebook.com/groups/sneakerheads',
    startTime: new Date('2024-01-18T12:00:00'),
    endTime: new Date('2024-01-25T20:00:00'),
    status: 'active',
    currentBid: 450,
    currency: 'AUD',
    bidIncrement: 25,
    buyItNowPrice: 600,
    highestBidder: 'Mike Chen',
    totalBids: 15,
    createdAt: new Date('2024-01-18T11:00:00'),
    updatedAt: new Date('2024-01-19T16:45:00'),
  },
]

export const mockBids: Bid[] = [
  {
    id: '1',
    auctionId: '1',
    bidderName: 'John Smith',
    amount: 8500,
    timestamp: new Date('2024-01-18T14:30:00'),
    isWinning: true,
    commentUrl: 'https://facebook.com/groups/luxurywatches/posts/123',
  },
  {
    id: '2',
    auctionId: '1',
    bidderName: 'Emma Wilson',
    amount: 8400,
    timestamp: new Date('2024-01-18T14:25:00'),
    isWinning: false,
  },
  {
    id: '3',
    auctionId: '2',
    bidderName: 'Sarah Johnson',
    amount: 2200,
    timestamp: new Date('2024-01-17T16:55:00'),
    isWinning: true,
  },
  {
    id: '4',
    auctionId: '3',
    bidderName: 'Mike Chen',
    amount: 450,
    timestamp: new Date('2024-01-19T16:45:00'),
    isWinning: true,
  },
]

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Luxury Watches Australia',
    url: 'https://facebook.com/groups/luxurywatches',
    isActive: true,
    lastChecked: new Date('2024-01-19T10:00:00'),
    settings: {
      autoTrack: true,
      keywords: ['auction', 'bid', 'sale'],
      minBidAmount: 100,
    },
  },
  {
    id: '2',
    name: 'Antique Furniture Melbourne',
    url: 'https://facebook.com/groups/antiquefurniture',
    isActive: true,
    lastChecked: new Date('2024-01-19T09:30:00'),
    settings: {
      autoTrack: false,
      keywords: ['auction', 'vintage', 'antique'],
      minBidAmount: 50,
    },
  },
  {
    id: '3',
    name: 'Sneakerheads Sydney',
    url: 'https://facebook.com/groups/sneakerheads',
    isActive: true,
    lastChecked: new Date('2024-01-19T11:15:00'),
    settings: {
      autoTrack: true,
      keywords: ['auction', 'bid', 'sneakers'],
      minBidAmount: 25,
    },
  },
]

export const defaultSettings: Settings = {
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
}

export const mockDashboardStats: DashboardStats = {
  activeAuctions: 2,
  totalBids: 35,
  totalValue: 11150,
  auctionsEndedToday: 1,
  topBidder: 'John Smith',
  averageBidAmount: 318.57,
}

