import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import File from '../models/File'
import { AppError } from '../middleware/errorHandler'

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export const uploadToStorage = async (
  userId: string,
  file: Express.Multer.File
): Promise<{ fileRecord: any; url: string }> => {
  ensureUploadDir()

  const filename = `${uuidv4()}-${file.originalname}`
  const filePath = path.join(UPLOAD_DIR, filename)

  fs.writeFileSync(filePath, file.buffer)

  const url = `/uploads/${filename}`

  const fileRecord = await File.create({
    userId,
    filename,
    originalName: file.originalname,
    url,
    storageProvider: process.env.STORAGE_PROVIDER || 'local',
    mimeType: file.mimetype,
    size: file.size,
  })

  return { fileRecord, url }
}

export const deleteFromStorage = async (fileId: string): Promise<void> => {
  const fileRecord = await File.findById(fileId)
  if (!fileRecord) {
    throw new AppError('File not found', 404)
  }

  if (fileRecord.storageProvider === 'local') {
    const filePath = path.join(UPLOAD_DIR, fileRecord.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  await File.findByIdAndDelete(fileId)
}

export const getFileUrl = (fileRecord: any): string => {
  if (fileRecord.storageProvider === 'local') {
    return fileRecord.url
  }
  return fileRecord.url
}
