import { Router } from 'express'
import { getKnowledgeGraph, getNodeConnections } from '../controllers/knowledgeController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getKnowledgeGraph)
router.get('/:id', authMiddleware, getNodeConnections)

export default router
