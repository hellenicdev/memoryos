import { Router } from 'express'
import { getTimeline } from '../controllers/timelineController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getTimeline)

export default router
