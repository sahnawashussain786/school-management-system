import { Router } from 'express'
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMyAssignments,
} from '../controllers/assignmentController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/my', authorize('student', 'parent'), getMyAssignments)
router.get('/', getAssignments)
router.get('/:id', getAssignment)
router.post('/', authorize('admin', 'teacher'), createAssignment)
router.put('/:id', authorize('admin', 'teacher'), updateAssignment)
router.delete('/:id', authorize('admin', 'teacher'), deleteAssignment)
router.post('/:id/submit', authorize('student'), submitAssignment)
router.put('/:id/grade', authorize('admin', 'teacher'), gradeSubmission)

export default router
