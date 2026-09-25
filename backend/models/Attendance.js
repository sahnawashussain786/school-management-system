import mongoose from 'mongoose'

const recordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
    },
    note: { type: String, trim: true },
  },
  { _id: false },
)

/**
 * One attendance sheet per class per day, taken by a teacher/admin.
 */
const attendanceSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    records: [recordSchema],
  },
  { timestamps: true },
)

attendanceSchema.index({ class: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', attendanceSchema)
