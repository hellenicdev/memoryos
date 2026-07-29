import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'ai'
  read: boolean
  createdAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'ai'], default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export default mongoose.model<INotification>('Notification', notificationSchema)
