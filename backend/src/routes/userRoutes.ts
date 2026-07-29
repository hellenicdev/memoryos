import { Router } from 'express'
import { updateProfile, getUsage, exportData, deleteAccount } from '../controllers/userController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.put('/profile', authMiddleware, updateProfile)
router.get('/usage', authMiddleware, getUsage)
router.get('/export', authMiddleware, exportData)
router.delete('/account', authMiddleware, deleteAccount)

export default router
