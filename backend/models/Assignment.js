import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, trim: true, default: '' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'late', 'graded', 'missing'], default: 'submitted' },
    marks: { type: Number, default: null },
    feedback: { type: String, default: '' },
  },
  { _id: false },
)

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100, min: 1 },
    submissions: [submissionSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Assignment', assignmentSchema)
