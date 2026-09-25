import FeeInvoice from '../models/FeeInvoice.js'
import Student from '../models/Student.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

const recalcStatus = (invoice) => {
  const paid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  if (paid >= invoice.amount) invoice.status = 'paid'
  else if (paid > 0) invoice.status = 'partial'
  else if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) invoice.status = 'overdue'
  else invoice.status = 'unpaid'
  return paid
}

// @desc   List invoices (admin all / parent+student own)
// @route  GET /api/fees
export const getInvoices = async (req, res) => {
  const filter = buildFilter(req.query, ['title', 'invoiceNumber'])
  const { page, limit, skip, sort } = getPagination(req.query)

  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id })
    filter.student = student?._id || null
  } else if (req.user.role === 'parent') {
    const student = await Student.findOne({ parent: req.user._id })
    filter.student = student?._id || null
  }

  const [items, total] = await Promise.all([
    FeeInvoice.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort || '-dueDate')
      .populate('student')
      .populate('student.user', 'name'),
    FeeInvoice.countDocuments(filter),
  ])

  const docItems = items.map((inv) => {
    const obj = inv.toObject()
    if (obj.student?.user?.name) obj.studentName = obj.student.user.name
    else if (obj.student?.guardianName) obj.studentName = obj.student.guardianName
    else obj.studentName = 'Student'
    return obj
  })

  res.json({ items: docItems, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Create invoices for a whole class for a month
// @route  POST /api/fees/generate
export const generateInvoices = async (req, res) => {
  const { classId, title, amount, dueDate, month } = req.body
  if (!classId || !title || !amount || !dueDate) {
    return res.status(400).json({ message: 'classId, title, amount and dueDate are required' })
  }

  const students = await Student.find({ class: classId, status: 'active' })
  const created = []
  const count = await FeeInvoice.countDocuments()
  let seq = count + 1

  for (const student of students) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`
    seq++
    const invoice = await FeeInvoice.create({
      invoiceNumber,
      student: student._id,
      title,
      amount,
      dueDate,
      month: month || '',
    })
    created.push(invoice)
  }

  res.status(201).json({ created: created.length, invoices: created })
}

// @desc   Record a payment on an invoice
// @route  POST /api/fees/:id/pay
export const payInvoice = async (req, res) => {
  const { amount, method, reference } = req.body
  const invoice = await FeeInvoice.findById(req.params.id)
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' })

  invoice.payments.push({
    amount,
    method: method || 'cash',
    reference: reference || '',
    recordedBy: req.user._id,
  })
  recalcStatus(invoice)
  await invoice.save()
  res.json(invoice)
}

// @desc   Update invoice details
// @route  PUT /api/fees/:id
export const updateInvoice = async (req, res) => {
  const invoice = await FeeInvoice.findById(req.params.id)
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

  const fields = ['title', 'description', 'amount', 'dueDate', 'month']
  for (const key of fields) {
    if (req.body[key] !== undefined) invoice[key] = req.body[key]
  }
  recalcStatus(invoice)
  await invoice.save()
  res.json(invoice)
}

// @desc   Delete invoice
// @route  DELETE /api/fees/:id
export const deleteInvoice = async (req, res) => {
  const invoice = await FeeInvoice.findByIdAndDelete(req.params.id)
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
  res.json({ message: 'Invoice deleted' })
}

// @desc   Fee summary stats
// @route  GET /api/fees/stats/summary
export const getFeeStats = async (req, res) => {
  const invoices = await FeeInvoice.find().populate('student', 'class')
  let totalBilled = 0
  let totalCollected = 0
  let overdue = 0
  let unpaidCount = 0

  for (const inv of invoices) {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
    totalBilled += inv.amount
    totalCollected += paid
    if (inv.status === 'overdue') overdue++
    if (inv.status !== 'paid') unpaidCount++
  }

  res.json({
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    overdue,
    unpaidCount,
    collectionRate: totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0,
  })
}
