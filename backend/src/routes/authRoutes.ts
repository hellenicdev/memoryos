import { Router } from 'express'
import { registerUser, loginUser, getProfile, updatePassword } from '../controllers/authController'
import authMiddleware from '../middleware/authMiddleware'
import { authLimiter } from '../middleware/rateLimiter'

const router = Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/profile', authMiddleware, getProfile)
router.put('/password', authMiddleware, updatePassword)

export default router
