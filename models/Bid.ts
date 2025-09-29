import mongoose, { Document, Schema } from 'mongoose'

export interface IBid extends Document {
  auctionId: mongoose.Types.ObjectId
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

const BidSchema = new Schema<IBid>({
  auctionId: {
    type: Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  bidderName: {
    type: String,
    required: true,
    trim: true,
  },
  bidderId: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
  commentUrl: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  isIncrement: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Index for better query performance
BidSchema.index({ auctionId: 1, timestamp: -1 })
BidSchema.index({ bidderName: 1 })
BidSchema.index({ isWinning: 1 })

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema)

