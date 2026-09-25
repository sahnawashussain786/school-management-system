import { Router } from 'express'
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  registerForTrip,
  cancelRegistration,
  updateRegistration,
  removeRegistration,
  getTripStats,
} from '../controllers/tripController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/stats/summary', authorize('admin'), getTripStats)
router.get('/', getTrips)
router.post('/', authorize('admin'), createTrip)
router.get('/:id', getTrip)
router.put('/:id', authorize('admin'), updateTrip)
router.delete('/:id', authorize('admin'), deleteTrip)

// student/parent self-service registration
router.post('/:id/register', authorize('student', 'parent'), registerForTrip)
router.delete('/:id/register', authorize('student', 'parent'), cancelRegistration)

// admin manages registrations
router.put('/:id/registrations/:studentId', authorize('admin'), updateRegistration)
router.delete('/:id/registrations/:studentId', authorize('admin'), removeRegistration)

export default router
