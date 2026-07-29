import mongoose, { Schema, Document } from 'mongoose'

export interface IFile extends Document {
  userId: mongoose.Types.ObjectId
  filename: string
  originalName: string
  url: string
  storageProvider: string
  mimeType: string
  size: number
  createdAt: Date
}

const fileSchema = new Schema<IFile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    storageProvider: { type: String, default: 'local' },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

fileSchema.index({ userId: 1 })

export default mongoose.model<IFile>('File', fileSchema)
