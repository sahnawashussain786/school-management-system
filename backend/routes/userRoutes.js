import { Router } from 'express'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect, authorize('admin'))

router.route('/').get(getUsers).post(createUser)
router.route('/:id').put(updateUser).delete(deleteUser)

export default router
