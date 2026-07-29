import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId
  plan: 'free' | 'premium' | 'team'
  status: 'active' | 'cancelled' | 'expired'
  storageLimit: number
  aiLimit: number
  projectLimit: number
  startedAt: Date
  expiresAt?: Date
  createdAt: Date
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'premium', 'team'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    storageLimit: { type: Number, default: 500 * 1024 * 1024 },
    aiLimit: { type: Number, default: 50 },
    projectLimit: { type: Number, default: 5 },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema)
