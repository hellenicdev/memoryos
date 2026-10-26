import { Router } from 'express'
import { getMemories, getMemoryById, uploadMemory, deleteMemory, toggleFavorite, updateMemoryTags, createTextMemory } from '../controllers/memoryController'
import authMiddleware from '../middleware/authMiddleware'
import { uploadLimiter } from '../middleware/rateLimiter'
import { handleUpload } from '../middleware/uploadMiddleware'

const router = Router()

router.get('/', authMiddleware, getMemories)
router.get('/:id', authMiddleware, getMemoryById)
router.post('/upload', authMiddleware, uploadLimiter, handleUpload, uploadMemory)
router.post('/note', authMiddleware, createTextMemory)
router.put('/:id/favorite', authMiddleware, toggleFavorite)
router.put('/:id/tags', authMiddleware, updateMemoryTags)
router.delete('/:id', authMiddleware, deleteMemory)

export default router
