import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  description?: string
  budget?: number
  currency: string
  status: 'active' | 'completed' | 'archived'
  memoryIds: mongoose.Types.ObjectId[]
  workspaceId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    budget: { type: Number },
    currency: { type: String, default: 'GBP' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    memoryIds: [{ type: Schema.Types.ObjectId, ref: 'Memory' }],
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  },
  { timestamps: true }
)

projectSchema.index({ userId: 1, createdAt: -1 })
projectSchema.index({ userId: 1, status: 1 })

export default mongoose.model<IProject>('Project', projectSchema)
