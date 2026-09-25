import { Router } from 'express'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'teacher'), createAnnouncement)

router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateAnnouncement)
  .delete(authorize('admin', 'teacher'), deleteAnnouncement)

export default router
