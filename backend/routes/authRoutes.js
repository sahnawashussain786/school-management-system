import { Router } from 'express'
import { register, login, getMe, updateProfile, logout } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)

export default router
