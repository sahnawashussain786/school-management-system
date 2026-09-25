import LibraryBook from '../models/LibraryBook.js'
import Student from '../models/Student.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List books
// @route  GET /api/library?search=...&category=...
export const getBooks = async (req, res) => {
  const filter = buildFilter(req.query, ['title', 'author', 'category'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    LibraryBook.find(filter).skip(skip).limit(limit).sort(sort || 'title'),
    LibraryBook.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Create book
// @route  POST /api/library
export const createBook = async (req, res) => {
  const { title, author, isbn, category, totalCopies, shelf } = req.body
  if (!title) return res.status(400).json({ message: 'Title is required' })

  const book = await LibraryBook.create({
    title,
    author,
    isbn,
    category,
    totalCopies: totalCopies || 1,
    availableCopies: totalCopies || 1,
    shelf,
  })
  res.status(201).json(book)
}

// @desc   Update book
// @route  PUT /api/library/:id
export const updateBook = async (req, res) => {
  const book = await LibraryBook.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  const fields = ['title', 'author', 'isbn', 'category', 'totalCopies', 'availableCopies', 'shelf']
  for (const key of fields) {
    if (req.body[key] !== undefined) book[key] = req.body[key]
  }
  await book.save()
  res.json(book)
}

// @desc   Delete book
// @route  DELETE /api/library/:id
export const deleteBook = async (req, res) => {
  const book = await LibraryBook.findByIdAndDelete(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  res.json({ message: 'Book deleted' })
}

// @desc   Borrow a book
// @route  POST /api/library/:id/borrow
export const borrowBook = async (req, res) => {
  const { studentId, days = 14 } = req.body
  const book = await LibraryBook.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  if (book.availableCopies < 1) {
    return res.status(400).json({ message: 'No copies currently available' })
  }

  let student
  if (studentId) {
    student = await Student.findById(studentId)
  } else {
    student = await Student.findOne({ user: req.user._id })
  }
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const already = book.loans.find(
    (l) => String(l.student) === String(student._id) && l.status !== 'returned',
  )
  if (already) return res.status(409).json({ message: 'Student already has this book out' })

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + Number(days))

  book.loans.push({ student: student._id, dueDate, status: 'borrowed' })
  book.availableCopies -= 1
  await book.save()
  res.status(201).json({ message: 'Book borrowed', dueDate })
}

// @desc   Return a book
// @route  POST /api/library/:id/return
export const returnBook = async (req, res) => {
  const { studentId } = req.body
  const book = await LibraryBook.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  let target
  if (studentId) target = String(studentId)
  else {
    const student = await Student.findOne({ user: req.user._id })
    target = String(student?._id || '')
  }

  const loan = book.loans.find((l) => String(l.student) === target && l.status !== 'returned')
  if (!loan) return res.status(404).json({ message: 'Active loan not found' })

  loan.returnedAt = new Date()
  loan.status = 'returned'
  book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1)
  await book.save()
  res.json({ message: 'Book returned' })
}

// @desc   Student's borrowed books
// @route  GET /api/library/my/loans
export const getMyLoans = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
  if (!student) return res.json([])

  const books = await LibraryBook.find({ 'loans.student': student._id })
  const loans = []
  for (const book of books) {
    for (const loan of book.loans) {
      if (String(loan.student) === String(student._id) && loan.status !== 'returned') {
        const overdue = new Date(loan.dueDate) < new Date()
        loans.push({
          bookId: book._id,
          title: book.title,
          author: book.author,
          borrowedAt: loan.borrowedAt,
          dueDate: loan.dueDate,
          status: overdue ? 'overdue' : 'borrowed',
        })
      }
    }
  }
  res.json(loans)
}
