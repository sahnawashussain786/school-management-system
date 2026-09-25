import { Router } from 'express'
import {
  getRoster,
  markAttendance,
  getAttendance,
  getStudentAttendance,
} from '../controllers/attendanceController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/roster', authorize('admin', 'teacher'), getRoster)
router.post('/', authorize('admin', 'teacher'), markAttendance)
router.get('/student/:studentId', getStudentAttendance)
router.get('/', getAttendance)

export default router
