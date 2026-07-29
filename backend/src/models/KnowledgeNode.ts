import mongoose, { Schema, Document } from 'mongoose'

export interface IKnowledgeNode extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  name: string
  description?: string
  relatedNodes: mongoose.Types.ObjectId[]
  importance: number
  createdAt: Date
}

const knowledgeNodeSchema = new Schema<IKnowledgeNode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    relatedNodes: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeNode' }],
    importance: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

knowledgeNodeSchema.index({ userId: 1, type: 1 })
knowledgeNodeSchema.index({ userId: 1, name: 'text' })

export default mongoose.model<IKnowledgeNode>('KnowledgeNode', knowledgeNodeSchema)
