import mongoose, { Schema, Document } from 'mongoose'

export interface IWorkspace extends Document {
  ownerId: mongoose.Types.ObjectId
  name: string
  members: { userId: mongoose.Types.ObjectId; role: string }[]
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
      },
    ],
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export default mongoose.model<IWorkspace>('Workspace', workspaceSchema)
