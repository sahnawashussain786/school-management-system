import mongoose from 'mongoose'

/**
 * Student profile. Always linked to a User account with role "student".
 * The linked parent/guardian user (if any) can view this student's data.
 */
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    address: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    admissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'graduated', 'transferred', 'inactive'], default: 'active' },
    bloodGroup: { type: String, trim: true },
    medicalNotes: { type: String, trim: true },
  },
  { timestamps: true },
)

export default mongoose.model('Student', studentSchema)
