import mongoose, { Schema, Document } from 'mongoose'

interface IMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New conversation' },
    messages: [messageSchema],
  },
  { timestamps: true }
)

conversationSchema.index({ userId: 1, updatedAt: -1 })

export default mongoose.model<IConversation>('Conversation', conversationSchema)
