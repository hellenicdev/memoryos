import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import mongoose from 'mongoose'
import File from '../models/File'
import { AppError } from '../middleware/errorHandler'
import { MAX_UPLOAD_BYTES } from '../config/uploads'
import { detectType, resolveStoredPath } from './fileType'

export const UPLOAD_DIR = path.join(__dirname, '../../uploads')

export const storedFilename = (): string => randomUUID()

export const discardUpload = async (file?: Express.Multer.File): Promise<void> => {
  if (!file?.path) return
  await fs.promises.unlink(file.path).catch(() => {})
}

export const readAndValidateUpload = async (
  file: Express.Multer.File
): Promise<{ filename: string; buffer: Buffer; mimeType: string }> => {
  const filePath = file.path
  if (!filePath) {
    throw new AppError('Upload failed', 400)
  }

  const filename = file.filename
  if (!filename || filename !== path.basename(filename) || path.extname(filename)) {
    await fs.promises.unlink(filePath).catch(() => {})
    throw new AppError('Upload failed', 400)
  }

  const buffer = await fs.promises.readFile(filePath)
  if (buffer.length > MAX_UPLOAD_BYTES) {
    await fs.promises.unlink(filePath).catch(() => {})
    throw new AppError('File exceeds the 10 MB upload limit', 413)
  }

  const detected = detectType(buffer)
  if (!detected) {
    await fs.promises.unlink(filePath).catch(() => {})
    throw new AppError('Unsupported file type', 400)
  }

  return { filename, buffer, mimeType: detected.mimeType }
}

export const uploadToStorage = async (
  userId: string,
  file: Express.Multer.File
): Promise<{ fileRecord: any; url: string; mimeType: string; buffer: Buffer }> => {
  const { filename, buffer, mimeType } = await readAndValidateUpload(file)
  const id = new mongoose.Types.ObjectId()
  try {
    const fileRecord = await File.create({
      _id: id,
      userId,
      filename,
      originalName: path.basename(file.originalname || 'upload'),
      url: `/api/files/${id.toString()}`,
      storageProvider: 'local',
      mimeType,
      size: buffer.length,
    })

    return { fileRecord, url: fileRecord.url, mimeType, buffer }
  } catch (error) {
    if (file.path) await fs.promises.unlink(file.path).catch(() => {})
    throw error
  }
}

export const deleteFromStorage = async (fileId: string): Promise<number> => {
  const fileRecord = await File.findById(fileId)
  if (!fileRecord) {
    throw new AppError('File not found', 404)
  }

  const size = fileRecord.size
  const filePath = resolveStoredPath(UPLOAD_DIR, fileRecord.filename)
  if (filePath) {
    await fs.promises.unlink(filePath).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== 'ENOENT') throw err
    })
  }

  await File.findByIdAndDelete(fileId)
  return size
}

export const getFileUrl = (fileRecord: { _id?: unknown; url?: string }): string => {
  if (fileRecord._id) return `/api/files/${fileRecord._id.toString()}`
  return fileRecord.url || ''
}
