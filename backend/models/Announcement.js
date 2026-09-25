import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    body: { type: String, required: [true, 'Body is required'] },
    category: {
      type: String,
      enum: ['general', 'academic', 'event', 'urgent', 'holiday', 'sports'],
      default: 'general',
    },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
    audience: {
      type: String,
      enum: ['all', 'teachers', 'students', 'parents'],
      default: 'all',
    },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('Announcement', announcementSchema)
