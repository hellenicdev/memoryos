import { Router } from 'express'
import { chatWithAI, searchMemory, getInsights, getConversations, createConversation, deleteConversation } from '../controllers/aiController'
import authMiddleware from '../middleware/authMiddleware'
import { aiLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/chat', authMiddleware, aiLimiter, chatWithAI)
router.post('/search', authMiddleware, searchMemory)
router.get('/insights', authMiddleware, getInsights)
router.get('/conversations', authMiddleware, getConversations)
router.post('/conversations', authMiddleware, createConversation)
router.delete('/conversations/:id', authMiddleware, deleteConversation)

export default router
