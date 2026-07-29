import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  metadata?: Record<string, any>
  createdAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

activitySchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model<IActivity>('Activity', activitySchema)
