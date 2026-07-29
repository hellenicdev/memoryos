import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import Notification from '../models/Notification'

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const unreadCount = await Notification.countDocuments({ userId: req.user!.id, read: false })

    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { read: true }
    )

    res.json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' })
  }
}

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, read: false },
      { read: true }
    )

    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' })
  }
}
