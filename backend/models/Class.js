import mongoose from 'mongoose'

/**
 * Academic class (grade + section), e.g. "Grade 10 - A".
 * Homeroom teacher is the class teacher responsible for the section.
 */
const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Class name is required'], trim: true, unique: true },
    gradeLevel: { type: Number, required: [true, 'Grade level is required'], min: 1, max: 12 },
    section: { type: String, required: true, trim: true, uppercase: true },
    roomNumber: { type: String, trim: true },
    capacity: { type: Number, default: 40, min: 1 },
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    academicYear: { type: String, default: () => `${new Date().getFullYear()}` },
  },
  { timestamps: true },
)

classSchema.virtual('label').get(function () {
  return `${this.name}`
})

export default mongoose.model('Class', classSchema)
