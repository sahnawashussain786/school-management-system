import { Router } from 'express'
import {
  getClassTimetable,
  createEntry,
  deleteEntry,
  getMyTimetable,
  getMySchedule,
} from '../controllers/timetableController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/my/week', authorize('student', 'parent'), getMyTimetable)
router.get('/my/schedule', authorize('teacher'), getMySchedule)
router.get('/:classId', getClassTimetable)
router.post('/', authorize('admin'), createEntry)
router.delete('/:id', authorize('admin'), deleteEntry)

export default router
