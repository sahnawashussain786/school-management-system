import { Router } from 'express'
import {
  getInvoices,
  generateInvoices,
  payInvoice,
  updateInvoice,
  deleteInvoice,
  getFeeStats,
} from '../controllers/feeController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/stats/summary', authorize('admin'), getFeeStats)
router.post('/generate', authorize('admin'), generateInvoices)
router.get('/', getInvoices)
router.post('/:id/pay', authorize('admin'), payInvoice)
router.put('/:id', authorize('admin'), updateInvoice)
router.delete('/:id', authorize('admin'), deleteInvoice)

export default router
