import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  avatar?: string
  plan: 'free' | 'premium' | 'team'
  role: 'user' | 'admin'
  storageUsed: number
  storageLimit: number
  aiQueriesUsed: number
  aiQueryLimit: number
  aiQueriesResetDate: Date
  lastLogin?: Date
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    plan: { type: String, enum: ['free', 'premium', 'team'], default: 'free' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 500 * 1024 * 1024 },
    aiQueriesUsed: { type: Number, default: 0 },
    aiQueryLimit: { type: Number, default: 50 },
    aiQueriesResetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    lastLogin: { type: Date },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 }, { unique: true })

export default mongoose.model<IUser>('User', userSchema)
