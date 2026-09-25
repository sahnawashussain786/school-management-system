import mongoose from 'mongoose'

/**
 * A single timetable period for a class: which subject, which teacher,
 * which day and time slot.
 */
const timetableSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    period: { type: Number, required: true, min: 1, max: 10 },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "09:45"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    room: { type: String, trim: true },
  },
  { timestamps: true },
)

timetableSchema.index({ class: 1, day: 1, period: 1 }, { unique: true })

export default mongoose.model('Timetable', timetableSchema)
