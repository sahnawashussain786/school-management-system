import { Router } from 'express'
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(authorize('admin', 'teacher'), getTeachers)
  .post(authorize('admin'), createTeacher)

router
  .route('/:id')
  .get(authorize('admin', 'teacher'), getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher)

export default router
