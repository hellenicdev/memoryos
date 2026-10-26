import fs from 'fs'
import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { MAX_UPLOAD_BYTES } from '../config/uploads'
import { UPLOAD_DIR, storedFilename } from '../services/fileService'

export function createUploadHandler(uploadDir: string) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(uploadDir, { recursive: true })
      cb(null, uploadDir)
    },
    filename: (_req, _file, cb) => {
      cb(null, storedFilename())
    },
  })

  const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  })

  return (req: Request, res: Response, next: NextFunction): void => {
    upload.single('file')(req, res, (err: unknown) => {
      if (!err) {
        next()
        return
      }

      if (req.file?.path) {
        fs.unlink(req.file.path, () => {})
      }

      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ success: false, message: 'File exceeds the 10 MB upload limit' })
        return
      }

      const message = err instanceof Error ? err.message : 'Upload rejected'
      res.status(400).json({ success: false, message })
    })
  }
}

export const handleUpload = createUploadHandler(UPLOAD_DIR)
