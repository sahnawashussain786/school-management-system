import { Router } from 'express'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.route('/').get(getEvents).post(authorize('admin', 'teacher'), createEvent)
router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateEvent)
  .delete(authorize('admin', 'teacher'), deleteEvent)

export default router
