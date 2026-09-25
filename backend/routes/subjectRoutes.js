import { Router } from 'express'
import { createCrud } from '../controllers/crudController.js'
import Subject from '../models/Subject.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

const subjectCrud = createCrud(Subject, { textFields: ['name', 'code'], sortBy: 'name' })

router.route('/').get(subjectCrud.list).post(authorize('admin'), subjectCrud.create)
router
  .route('/:id')
  .get(subjectCrud.getOne)
  .put(authorize('admin'), subjectCrud.update)
  .delete(authorize('admin'), subjectCrud.remove)

export default router
