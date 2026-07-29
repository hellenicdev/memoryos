import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Subscription from '../models/Subscription'
import { verifyTurnstileToken } from '../services/turnstileService'
import { AppError } from '../middleware/errorHandler'

const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, turnstileToken } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
      return
    }

    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken)
      if (!isValid) {
        res.status(403).json({ success: false, message: 'Security verification failed. Please try again.' })
        return
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    })

    await Subscription.create({
      userId: user._id,
      plan: 'free',
      status: 'active',
    })

    const token = generateToken(user._id.toString(), user.email)

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, turnstileToken } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' })
      return
    }

    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken)
      if (!isValid) {
        res.status(403).json({ success: false, message: 'Security verification failed. Please try again.' })
        return
      }
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id.toString(), user.email)

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any
    const user = await User.findById(authReq.user.id).select('-passwordHash')
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile' })
  }
}

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(authReq.user.id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' })
      return
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password' })
  }
}
