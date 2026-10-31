import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import { downloadFile } from '../controllers/fileController'

const router = Router()

router.get('/:id', authMiddleware, downloadFile)

export default router
