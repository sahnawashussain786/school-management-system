import mongoose from 'mongoose'

/**
 * An exam session (e.g. "Mid-Term 2026") holding results for many students.
 */
const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Exam name is required'], trim: true },
    examType: {
      type: String,
      enum: ['quiz', 'unit-test', 'mid-term', 'final', 'practical', 'other'],
      default: 'mid-term',
    },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 1, default: 100 },
    passingMarks: { type: Number, default: 40, min: 0 },
    results: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        marks: { type: Number, min: 0, default: 0 },
        grade: { type: String, default: '' },
        remark: { type: String, default: '' },
        _id: false,
      },
    ],
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('Exam', examSchema)
