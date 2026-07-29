import mongoose, { Schema, Document } from 'mongoose'

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  type: string
  description?: string
  content?: string
  aiSummary?: string
  tags: string[]
  entities: Record<string, any>
  embedding?: number[]
  importanceScore: number
  projectId?: mongoose.Types.ObjectId
  fileId?: mongoose.Types.ObjectId
  workspaceId?: mongoose.Types.ObjectId
  visibility: 'private' | 'workspace'
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

const memorySchema = new Schema<IMemory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['document', 'image', 'note', 'receipt', 'invoice', 'purchase', 'idea', 'project', 'message', 'bookmark', 'other'],
      default: 'document',
    },
    description: { type: String },
    content: { type: String },
    aiSummary: { type: String },
    tags: [{ type: String }],
    entities: { type: Schema.Types.Mixed, default: {} },
    embedding: [{ type: Number }],
    importanceScore: { type: Number, default: 0, min: 0, max: 100 },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    fileId: { type: Schema.Types.ObjectId, ref: 'File' },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    visibility: { type: String, enum: ['private', 'workspace'], default: 'private' },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
)

memorySchema.index({ userId: 1, createdAt: -1 })
memorySchema.index({ userId: 1, type: 1 })
memorySchema.index({ userId: 1, tags: 1 })
memorySchema.index({ userId: 1, importanceScore: -1 })
memorySchema.index({ userId: 1, projectId: 1 })

export default mongoose.model<IMemory>('Memory', memorySchema)
