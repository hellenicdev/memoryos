import mongoose, { Schema, Document } from 'mongoose'

export interface ITimelineEvent extends Document {
  userId: mongoose.Types.ObjectId
  memoryId?: mongoose.Types.ObjectId
  projectId?: mongoose.Types.ObjectId
  title: string
  description?: string
  date: Date
  createdAt: Date
}

const timelineEventSchema = new Schema<ITimelineEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memoryId: { type: Schema.Types.ObjectId, ref: 'Memory' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

timelineEventSchema.index({ userId: 1, date: -1 })

export default mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema)
