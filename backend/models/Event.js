import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['academic', 'sports', 'cultural', 'holiday', 'meeting', 'other'],
      default: 'other',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, trim: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.model('Event', eventSchema)
