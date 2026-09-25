import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'bank', 'online'], default: 'cash' },
    reference: { type: String, trim: true },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
)

/**
 * A fee invoice issued to a student for a given month/term.
 */
const feeInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    month: { type: String }, // e.g. "2026-09"
    payments: [paymentSchema],
    status: { type: String, enum: ['unpaid', 'partial', 'paid', 'overdue'], default: 'unpaid' },
  },
  { timestamps: true },
)

export default mongoose.model('FeeInvoice', feeInvoiceSchema)
