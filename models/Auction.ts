import mongoose, { Document, Schema } from 'mongoose'

export interface IAuction extends Document {
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

const AuctionSchema = new Schema<IAuction>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  groupName: {
    type: String,
    required: true,
    trim: true,
  },
  groupUrl: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active',
  },
  currentBid: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'AUD',
  },
  bidIncrement: {
    type: Number,
    required: true,
    min: 1,
  },
  reservePrice: {
    type: Number,
    min: 0,
  },
  buyItNowPrice: {
    type: Number,
    min: 0,
  },
  highestBidder: {
    type: String,
    trim: true,
  },
  totalBids: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
})

// Index for better query performance
AuctionSchema.index({ status: 1, endTime: 1 })
AuctionSchema.index({ groupName: 1 })
AuctionSchema.index({ createdAt: -1 })

export default mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema)

