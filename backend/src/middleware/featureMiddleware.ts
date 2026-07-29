import { Response, NextFunction } from 'express'
import { AuthRequest } from './authMiddleware'
import User from '../models/User'

export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user || (user.plan !== 'premium' && user.plan !== 'team')) {
      res.status(403).json({ success: false, message: 'Premium feature. Please upgrade your plan.' })
      return
    }
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking permissions' })
  }
}

export const requireTeam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user || user.plan !== 'team') {
      res.status(403).json({ success: false, message: 'Team feature. Please upgrade your plan.' })
      return
    }
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking permissions' })
  }
}
