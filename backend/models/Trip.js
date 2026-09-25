import mongoose from 'mongoose'

/**
 * A school trip: day excursion or overnight tour organised by the school.
 * Teachers are assigned as coordinators; parents/students see published trips
 * and can request registration of the linked student.
 */
const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Trip title is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    itinerary: [{ type: String, trim: true }],

    category: {
      type: String,
      enum: ['educational', 'adventure', 'sports', 'cultural', 'community', 'other'],
      default: 'educational',
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    departureTime: { type: String, default: '08:00' },
    meetingPoint: { type: String, trim: true, default: '' },

    costPerStudent: { type: Number, default: 0, min: 0 },
    includes: [{ type: String, trim: true }],
    capacity: { type: Number, default: 40, min: 1 },
    gradesAllowed: [{ type: Number }],

    coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'completed', 'cancelled'],
      default: 'open',
    },
    isPublic: { type: Boolean, default: true },

    registrations: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        registeredAt: { type: Date, default: Date.now },
        paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid', 'refunded'], default: 'unpaid' },
        consentSigned: { type: Boolean, default: false },
        notes: { type: String, default: '' },
        _id: false,
      },
    ],
  },
  { timestamps: true },
)

tripSchema.virtual('registeredCount').get(function () {
  return this.registrations ? this.registrations.length : 0
})

export default mongoose.model('Trip', tripSchema)
