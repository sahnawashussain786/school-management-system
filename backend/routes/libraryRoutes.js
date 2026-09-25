import { Router } from 'express'
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyLoans,
} from '../controllers/libraryController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/my/loans', authorize('student', 'parent'), getMyLoans)
router.get('/', getBooks)
router.post('/', authorize('admin'), createBook)
router.put('/:id', authorize('admin'), updateBook)
router.delete('/:id', authorize('admin'), deleteBook)
router.post('/:id/borrow', authorize('admin', 'teacher'), borrowBook)
router.post('/:id/return', authorize('admin', 'teacher'), returnBook)

export default router
