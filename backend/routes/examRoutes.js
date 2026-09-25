import { Router } from 'express'
import {
  getExams,
  getExam,
  createExam,
  updateResults,
  publishExam,
  getMyResults,
} from '../controllers/examController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/my/results', authorize('student', 'parent'), getMyResults)
router.get('/', getExams)
router.get('/:id', getExam)
router.post('/', authorize('admin', 'teacher'), createExam)
router.put('/:id/results', authorize('admin', 'teacher'), updateResults)
router.put('/:id/publish', authorize('admin', 'teacher'), publishExam)

export default router
