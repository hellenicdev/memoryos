import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import TimelineEvent from '../models/TimelineEvent'

export const getTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query
    const filter: any = { userId: req.user!.id }

    if (year) {
      const yearNum = parseInt(year as string)
      const startDate = new Date(yearNum, 0, 1)
      const endDate = new Date(yearNum + 1, 0, 1)
      filter.date = { $gte: startDate, $lt: endDate }
    }

    if (month && year) {
      const yearNum = parseInt(year as string)
      const monthNum = parseInt(month as string) - 1
      const startDate = new Date(yearNum, monthNum, 1)
      const endDate = new Date(yearNum, monthNum + 1, 1)
      filter.date = { $gte: startDate, $lt: endDate }
    }

    const events = await TimelineEvent.find(filter)
      .sort({ date: -1 })
      .populate('memoryId', 'title type')
      .populate('projectId', 'name')
      .lean()

    res.json({ success: true, events })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' })
  }
}
