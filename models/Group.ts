import mongoose, { Document, Schema } from 'mongoose'

export interface IGroup extends Document {
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

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  settings: {
    autoTrack: {
      type: Boolean,
      default: false,
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    minBidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
}, {
  timestamps: true,
})

// Index for better query performance
GroupSchema.index({ isActive: 1 })
GroupSchema.index({ name: 1 })

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema)

