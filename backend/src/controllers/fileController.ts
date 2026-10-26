import fs from 'fs'
import { pipeline } from 'stream/promises'
import { Response } from 'express'
import mongoose from 'mongoose'
import File from '../models/File'
import { AuthRequest } from '../middleware/authMiddleware'
import { UPLOAD_DIR } from '../services/fileService'
import { contentDispositionHeader, mimeTypeForDownload, resolveStoredPath } from '../services/fileType'

const SNIFF_BYTES = 64 * 1024

export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, message: 'File not found' })
    return
  }

  try {
    const fileRecord = await File.findOne({ _id: id, userId: req.user!.id }).lean()
    if (!fileRecord) {
      res.status(404).json({ success: false, message: 'File not found' })
      return
    }

    const filePath = resolveStoredPath(UPLOAD_DIR, fileRecord.filename)
    if (!filePath) {
      res.status(404).json({ success: false, message: 'File not found' })
      return
    }

    let stat: fs.Stats
    try {
      stat = await fs.promises.stat(filePath)
    } catch {
      res.status(404).json({ success: false, message: 'File not found' })
      return
    }

    const header = Buffer.alloc(Math.min(stat.size, SNIFF_BYTES))
    const handle = await fs.promises.open(filePath, 'r')
    try {
      await handle.read(header, 0, header.length, 0)
    } finally {
      await handle.close()
    }

    const mimeType = mimeTypeForDownload(header, fileRecord.mimeType)

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', stat.size)
    res.setHeader('Content-Disposition', contentDispositionHeader(fileRecord.originalName, mimeType))
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox")
    res.setHeader('Cache-Control', 'private, no-store')

    await pipeline(fs.createReadStream(filePath), res)
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to read file' })
    }
  }
}
