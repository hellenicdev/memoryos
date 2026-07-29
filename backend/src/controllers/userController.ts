import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import User from '../models/User'
import Memory from '../models/Memory'
import Project from '../models/Project'
import Task from '../models/Task'
import TimelineEvent from '../models/TimelineEvent'
import File from '../models/File'
import Notification from '../models/Notification'
import { deleteFromStorage } from '../services/fileService'
import bcrypt from 'bcrypt'

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { name },
      { new: true }
    ).select('-passwordHash')

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' })
  }
}

export const getUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('plan storageUsed storageLimit aiQueriesUsed aiQueryLimit aiQueriesResetDate')

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const memoryCount = await Memory.countDocuments({ userId: req.user!.id })
    const projectCount = await Project.countDocuments({ userId: req.user!.id })

    res.json({
      success: true,
      usage: {
        plan: user.plan,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        aiQueriesUsed: user.aiQueriesUsed,
        aiQueryLimit: user.aiQueryLimit,
        aiQueriesResetDate: user.aiQueriesResetDate,
        memoryCount,
        projectCount,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch usage' })
  }
}

export const exportData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [user, memories, projects, tasks, timelineEvents] = await Promise.all([
      User.findById(req.user!.id).select('-passwordHash').lean(),
      Memory.find({ userId: req.user!.id }).lean(),
      Project.find({ userId: req.user!.id }).lean(),
      Task.find({ userId: req.user!.id }).lean(),
      TimelineEvent.find({ userId: req.user!.id }).lean(),
    ])

    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        user,
        memories,
        projects,
        tasks,
        timelineEvents,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export data' })
  }
}

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user!.id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const isMatch = await bcrypt.compare(password || '', user.passwordHash)
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Password is incorrect' })
      return
    }

    const memories = await Memory.find({ userId: req.user!.id })
    for (const memory of memories) {
      if (memory.fileId) {
        await deleteFromStorage(memory.fileId.toString())
      }
    }

    await Promise.all([
      Memory.deleteMany({ userId: req.user!.id }),
      Project.deleteMany({ userId: req.user!.id }),
      Task.deleteMany({ userId: req.user!.id }),
      TimelineEvent.deleteMany({ userId: req.user!.id }),
      File.deleteMany({ userId: req.user!.id }),
      Notification.deleteMany({ userId: req.user!.id }),
    ])

    await User.findByIdAndDelete(req.user!.id)

    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete account' })
  }
}
