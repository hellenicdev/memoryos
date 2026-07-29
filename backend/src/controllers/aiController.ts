import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import { answerQuestion } from '../services/aiService'
import { searchMemories } from '../services/searchService'
import { checkAIUsageLimit } from '../services/planService'
import User from '../models/User'
import Memory from '../models/Memory'
import Conversation from '../models/Conversation'

export const chatWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' })
      return
    }

    const canUseAI = await checkAIUsageLimit(req.user!.id)
    if (!canUseAI) {
      res.status(403).json({ success: false, message: 'AI query limit reached. Please upgrade your plan or wait for reset.' })
      return
    }

    const userMemories = await Memory.find({ userId: req.user!.id })
      .select('title aiSummary content tags')
      .sort({ importanceScore: -1 })
      .limit(30)
      .lean()

    const context = userMemories
      .map((m: any) => `Title: ${m.title}\nSummary: ${m.aiSummary || ''}\nTags: ${(m.tags || []).join(', ')}`)
      .join('\n\n---\n\n')

    const result = await answerQuestion(message, context || 'No memories found yet.')

    await User.findByIdAndUpdate(req.user!.id, { $inc: { aiQueriesUsed: 1 } })

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId)
      if (conversation && conversation.userId.toString() === req.user!.id) {
        conversation.messages.push(
          { role: 'user', content: message, createdAt: new Date() },
          { role: 'assistant', content: result.answer, createdAt: new Date() }
        )
        await conversation.save()
      }
    }

    res.json({ success: true, ...result, conversationId })
  } catch (error) {
    console.error('AI chat error:', error)
    res.status(500).json({ success: false, message: 'AI service unavailable' })
  }
}

export const searchMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query, type, date, projectId, favorites } = req.body

    if (!query) {
      res.status(400).json({ success: false, message: 'Search query is required' })
      return
    }

    const results = await searchMemories(req.user!.id, query, { type, date, projectId, favorites })

    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' })
  }
}

export const getInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const [totalMemories, totalProjects, recentMemories, totalTasks, completedTasks] = await Promise.all([
      Memory.countDocuments({ userId }),
      Memory.countDocuments({ userId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Memory.find({ userId }).sort({ createdAt: -1 }).limit(5).select('title createdAt').lean(),
      require('../models/Task').default.countDocuments({ userId }),
      require('../models/Task').default.countDocuments({ userId, completed: true }),
    ])

    const insights = [
      `You have ${totalMemories} memories in your MemoryOS.`,
      recentMemories.length > 0 && `Recently added: ${recentMemories.map((m: any) => m.title).join(', ')}`,
      totalProjects > 0 && `${totalProjects} new memories this week.`,
      totalTasks > 0 && `You have ${totalTasks - completedTasks} pending tasks.`,
    ].filter(Boolean)

    res.json({ success: true, insights })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate insights' })
  }
}

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await Conversation.find({ userId: req.user!.id })
      .select('title messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ success: true, conversations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' })
  }
}

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body
    const conversation = await Conversation.create({
      userId: req.user!.id,
      title: title || 'New conversation',
    })

    res.status(201).json({ success: true, conversation })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create conversation' })
  }
}

export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user!.id })
    res.json({ success: true, message: 'Conversation deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete conversation' })
  }
}
