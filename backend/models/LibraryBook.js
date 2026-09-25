import mongoose from 'mongoose'

const loanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    borrowedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
    status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
  },
  { _id: false },
)

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, trim: true },
    isbn: { type: String, trim: true },
    category: { type: String, trim: true, default: 'General' },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
    shelf: { type: String, trim: true },
    loans: [loanSchema],
  },
  { timestamps: true },
)

export default mongoose.model('LibraryBook', bookSchema)
