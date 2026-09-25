import mongoose from 'mongoose'

/**
 * Teacher profile. Always linked to a User account with role "teacher".
 */
const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, trim: true },
    qualification: { type: String, trim: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    joinDate: { type: Date, default: Date.now },
    salary: { type: Number, default: 0 },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    status: { type: String, enum: ['active', 'on-leave', 'inactive'], default: 'active' },
  },
  { timestamps: true },
)

export default mongoose.model('Teacher', teacherSchema)
