import { Request, Response } from 'express'
import Memory from '../models/Memory'
import File from '../models/File'
import TimelineEvent from '../models/TimelineEvent'
import { uploadToStorage, deleteFromStorage } from '../services/fileService'
import { summarizeText, extractEntities, extractDates, generateTags, generateRelations, analyzeImage } from '../services/aiService'
import { calculateImportance } from '../services/importanceService'
import { getPlanLimits } from '../services/planService'
import { AppError } from '../middleware/errorHandler'
import User from '../models/User'
import { AuthRequest } from '../middleware/authMiddleware'

const pdfParse = require('pdf-parse')

const extractFallback = (text: string) => {
  const amounts = (text.match(/[£€$]\s*\d+(?:[.,]\d+)?/g) || []).map((a: string) => a.trim())
  const dates = (text.match(/\d{4}-\d{2}-\d{2}/g) || []).map((d: string) => ({ date: d, event: 'Referenced date' }))
  const tags = text.toLowerCase().match(/\b(?:project|invoice|receipt|contract|report|budget|meeting|email|proposal|estimate|order|payment|summary|plan|design|spec)\b/g) || []
  return { amounts, dates, tags: [...new Set(tags)] as string[] }
}

export const getMemories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, date, projectId, favorites, page = '1', limit = '20' } = req.query

    const filter: any = { userId: req.user!.id }

    if (type) filter.type = type
    if (favorites === 'true') filter.isFavorite = true
    if (projectId) filter.projectId = projectId

    if (date) {
      const now = new Date()
      let startDate: Date
      switch (date) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0)); break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7)); break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1)); break
        default:
          startDate = new Date(0)
      }
      filter.createdAt = { $gte: startDate }
    }

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    const [memories, total] = await Promise.all([
      Memory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Memory.countDocuments(filter),
    ])

    res.json({
      success: true,
      memories,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    })
  } catch (error) {
    console.error('Get memories error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch memories' })
  }
}

export const getMemoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user!.id }).lean()
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' })
      return
    }

    let file = null
    if (memory.fileId) {
      file = await File.findById(memory.fileId).lean()
    }

    const relatedMemories = await Memory.find({
      userId: req.user!.id,
      _id: { $ne: memory._id },
      $or: [
        { tags: { $in: memory.tags } },
        { projectId: memory.projectId },
        { type: memory.type },
      ],
    })
      .limit(5)
      .select('title aiSummary type')
      .lean()

    const timelineEvents = await TimelineEvent.find({ memoryId: memory._id }).sort({ date: -1 }).lean()

    res.json({ success: true, memory: { ...memory, file }, relatedMemories, timelineEvents })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch memory' })
  }
}

export const uploadMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ success: false, message: 'No file provided' })
      return
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const limits = getPlanLimits(user.plan)
    if (user.storageUsed + file.size > limits.storageLimit) {
      res.status(403).json({ success: false, message: 'Storage limit reached. Please upgrade your plan.' })
      return
    }

    const { fileRecord } = await uploadToStorage(req.user!.id, file)

    const title = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

    let content = ''
    let aiSummary = ''
    let tags: string[] = []
    let entityResult = { people: [], companies: [], locations: [], products: [], amounts: [], category: 'other' } as any
    let datesResult: any[] = []

    if (file.mimetype.startsWith('image/')) {
      const imageResult = await analyzeImage(file.buffer, file.mimetype)
      aiSummary = imageResult.summary
      content = imageResult.description
      tags = imageResult.tags
      entityResult = imageResult.entities
    } else if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer)
        content = pdfData.text
      } catch {
        content = ''
      }
      if (content) {
        const [summaryResult, entityResultData, datesResultData, tagsResult] = await Promise.all([
          summarizeText(content),
          extractEntities(content),
          extractDates(content),
          generateTags(content),
        ])
        aiSummary = summaryResult.summary
        tags = tagsResult
        entityResult = entityResultData
        datesResult = datesResultData
      } else {
        const [summaryResult, tagsResult] = await Promise.all([
          summarizeText(title),
          generateTags(title),
        ])
        aiSummary = summaryResult.summary
        tags = tagsResult
      }
    } else if (file.mimetype === 'text/plain') {
      content = file.buffer.toString('utf-8')
      const [summaryResult, entityResultData, datesResultData, tagsResult] = await Promise.all([
        summarizeText(content),
        extractEntities(content),
        extractDates(content),
        generateTags(content),
      ])
      aiSummary = summaryResult.summary
      tags = tagsResult
      entityResult = entityResultData
      datesResult = datesResultData
    } else {
      const [summaryResult, entityResultData, tagsResult] = await Promise.all([
        summarizeText(title),
        extractEntities(title),
        generateTags(title),
      ])
      aiSummary = summaryResult.summary
      tags = tagsResult
      entityResult = entityResultData
    }

    if (content && (aiSummary === 'AI analysis unavailable' || tags.length === 0)) {
      const fallback = extractFallback(content)
      if (tags.length === 0) tags = fallback.tags
      if (datesResult.length === 0 && fallback.dates.length > 0) datesResult = fallback.dates
      if (entityResult.amounts?.length === 0 && fallback.amounts.length > 0) entityResult.amounts = fallback.amounts
      if (!aiSummary || aiSummary === 'AI analysis unavailable') aiSummary = title
    }

    const importanceScore = calculateImportance({
      hasFinancialInfo: entityResult.amounts.length > 0,
      hasImportantDates: datesResult.length > 0,
      hasProjectConnection: false,
      userMarkedFavorite: false,
      aiDetectedImportance: aiSummary ? 0.5 : 0,
    })

    const memoryType = file.mimetype.startsWith('image/') ? 'image' : entityResult.category || 'document'

    const memory = await Memory.create({
      userId: req.user!.id,
      title,
      type: memoryType,
      content: content || undefined,
      aiSummary: aiSummary || undefined,
      tags,
      entities: entityResult,
      importanceScore,
      fileId: fileRecord._id,
    })

    for (const dateInfo of datesResult) {
      await TimelineEvent.create({
        userId: req.user!.id,
        memoryId: memory._id,
        title: dateInfo.event,
        date: new Date(dateInfo.date),
      })
    }

    const existingMemories = await Memory.find({ userId: req.user!.id, _id: { $ne: memory._id } })
      .limit(20)
      .select('aiSummary title')
      .lean()

    if (existingMemories.length > 0 && content) {
      const summaries = existingMemories.map((m: any) => `${m.title}: ${m.aiSummary || ''}`)
      generateRelations(content, summaries)
    }

    user.storageUsed += file.size
    await user.save()

    res.status(201).json({ success: true, memory })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
}

export const deleteMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user!.id })
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' })
      return
    }

    if (memory.fileId) {
      await deleteFromStorage(memory.fileId.toString())
    }

    await TimelineEvent.deleteMany({ memoryId: memory._id })
    await Memory.findByIdAndDelete(memory._id)

    const user = await User.findById(req.user!.id)
    if (user && memory.fileId) {
      const File = require('../models/File').default
      const fileRecord = await File.findById(memory.fileId)
      if (fileRecord) {
        user.storageUsed = Math.max(0, user.storageUsed - fileRecord.size)
        await user.save()
      }
    }

    res.json({ success: true, message: 'Memory deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete memory' })
  }
}

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user!.id })
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' })
      return
    }

    memory.isFavorite = !memory.isFavorite
    await memory.save()

    res.json({ success: true, isFavorite: memory.isFavorite })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update favorite' })
  }
}

export const updateMemoryTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tags } = req.body
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { tags },
      { new: true }
    )
    if (!memory) {
      res.status(404).json({ success: false, message: 'Memory not found' })
      return
    }

    res.json({ success: true, memory })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update tags' })
  }
}

export const createTextMemory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, type } = req.body

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' })
      return
    }

    const [summaryResult, entityResult, datesResult, tags] = await Promise.all([
      summarizeText(content),
      extractEntities(content),
      extractDates(content),
      generateTags(content),
    ])

    if (summaryResult.summary === 'AI analysis unavailable' || tags.length === 0) {
      const fallback = extractFallback(content)
      if (tags.length === 0) {
        (tags as string[]).push(...fallback.tags)
      }
      if (datesResult.length === 0 && fallback.dates.length > 0) {
        datesResult.push(...fallback.dates)
      }
      if (entityResult.amounts?.length === 0 && fallback.amounts.length > 0) {
        entityResult.amounts = fallback.amounts
      }
    }

    const importanceScore = calculateImportance({
      hasFinancialInfo: entityResult.amounts.length > 0,
      hasImportantDates: datesResult.length > 0,
      hasProjectConnection: false,
      userMarkedFavorite: false,
      aiDetectedImportance: summaryResult.confidence,
    })

    const memory = await Memory.create({
      userId: req.user!.id,
      title,
      type: type || summaryResult.category || 'note',
      content,
      aiSummary: summaryResult.summary || undefined,
      tags,
      entities: entityResult,
      importanceScore,
    })

    for (const dateInfo of datesResult) {
      await TimelineEvent.create({
        userId: req.user!.id,
        memoryId: memory._id,
        title: dateInfo.event,
        date: new Date(dateInfo.date),
      })
    }

    res.status(201).json({ success: true, memory })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create memory' })
  }
}
