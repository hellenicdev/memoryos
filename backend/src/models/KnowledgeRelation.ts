import mongoose, { Schema, Document } from 'mongoose'

export interface IKnowledgeRelation extends Document {
  userId: mongoose.Types.ObjectId
  sourceNode: mongoose.Types.ObjectId
  targetNode: mongoose.Types.ObjectId
  relationType: string
  confidence: number
  createdAt: Date
}

const knowledgeRelationSchema = new Schema<IKnowledgeRelation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceNode: { type: Schema.Types.ObjectId, ref: 'KnowledgeNode', required: true },
    targetNode: { type: Schema.Types.ObjectId, ref: 'KnowledgeNode', required: true },
    relationType: { type: String, required: true },
    confidence: { type: Number, default: 0.5, min: 0, max: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

knowledgeRelationSchema.index({ userId: 1 })
knowledgeRelationSchema.index({ sourceNode: 1, targetNode: 1 })

export default mongoose.model<IKnowledgeRelation>('KnowledgeRelation', knowledgeRelationSchema)
