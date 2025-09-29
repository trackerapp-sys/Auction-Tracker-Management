import mongoose, { Document, Schema } from 'mongoose'

export interface ISettings extends Document {
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

const SettingsSchema = new Schema<ISettings>({
  timezone: {
    type: String,
    required: true,
    default: 'Australia/Sydney',
  },
  language: {
    type: String,
    required: true,
    default: 'en-AU',
  },
  currency: {
    type: String,
    required: true,
    default: 'AUD',
  },
  dateFormat: {
    type: String,
    required: true,
    default: 'DD/MM/YYYY',
  },
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '24h',
  },
  notifications: {
    newBid: {
      type: Boolean,
      default: true,
    },
    auctionEnding: {
      type: Boolean,
      default: true,
    },
    auctionEnded: {
      type: Boolean,
      default: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: false,
    },
  },
  defaultBidIncrement: {
    type: Number,
    required: true,
    default: 50,
    min: 1,
  },
  autoArchiveDays: {
    type: Number,
    required: true,
    default: 30,
    min: 1,
  },
}, {
  timestamps: true,
})

// Ensure only one settings document exists
SettingsSchema.index({}, { unique: true })

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

