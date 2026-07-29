import { Router } from 'express'
import multer from 'multer'
import { getMemories, getMemoryById, uploadMemory, deleteMemory, toggleFavorite, updateMemoryTags, createTextMemory } from '../controllers/memoryController'
import authMiddleware from '../middleware/authMiddleware'
import { uploadLimiter } from '../middleware/rateLimiter'

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file: Express.Multer.File, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  },
})

const router = Router()

router.get('/', authMiddleware, getMemories)
router.get('/:id', authMiddleware, getMemoryById)
router.post('/upload', authMiddleware, uploadLimiter, upload.single('file'), uploadMemory)
router.post('/note', authMiddleware, createTextMemory)
router.put('/:id/favorite', authMiddleware, toggleFavorite)
router.put('/:id/tags', authMiddleware, updateMemoryTags)
router.delete('/:id', authMiddleware, deleteMemory)

export default router
