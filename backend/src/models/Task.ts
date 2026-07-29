import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId
  projectId: mongoose.Types.ObjectId
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    deadline: { type: Date },
  },
  { timestamps: true }
)

taskSchema.index({ projectId: 1 })
taskSchema.index({ userId: 1 })

export default mongoose.model<ITask>('Task', taskSchema)
