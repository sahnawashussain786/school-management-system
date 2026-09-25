import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Subject name is required'], trim: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    gradeLevels: [{ type: Number }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  },
  { timestamps: true },
)

export default mongoose.model('Subject', subjectSchema)
