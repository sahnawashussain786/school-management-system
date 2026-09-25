import Trip from '../models/Trip.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

const populateAll = [
  { path: 'coordinators', populate: { path: 'user', select: 'name email phone' } },
]

// @desc   List trips (admin/teacher: all; student/parent: public + registered)
// @route  GET /api/trips
export const getTrips = async (req, res) => {
  const filter = buildFilter(req.query, ['title', 'destination'])
  const { page, limit, skip, sort } = getPagination(req.query)

  if (req.user.role === 'student' || req.user.role === 'parent') {
    filter.isPublic = true
  }

  const [items, total] = await Promise.all([
    Trip.find(filter).skip(skip).limit(limit).sort(sort || '-startDate').populate(populateAll),
    Trip.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Get one trip with registrations
// @route  GET /api/trips/:id
export const getTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate(populateAll)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })

  const doc = trip.toObject()
  // enrich registrations with student info
  const ids = doc.registrations.map((r) => r.student).filter(Boolean)
  const students = await Student.find({ _id: { $in: ids } }).populate('user', 'name email')
  const classDocs = await Promise.all(students.map((s) => s.class))
  const nameMap = new Map()
  students.forEach((s, i) => {
    nameMap.set(String(s._id), {
      name: s.user?.name || 'Unknown',
      admissionNumber: s.admissionNumber,
      class: classDocs[i]?.name || '',
    })
  })

  doc.registrations = doc.registrations.map((r) => ({
    ...r,
    student: undefined,
    studentInfo: nameMap.get(String(r.student)) || null,
  }))

  // For students/parents include own registration state
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id })
    doc.myRegistration = student
      ? trip.registrations.find((r) => String(r.student) === String(student._id)) || null
      : null
    doc.myStudentId = student?._id || null
  } else if (req.user.role === 'parent') {
    const child = await Student.findOne({ parent: req.user._id })
    doc.myRegistration = child
      ? trip.registrations.find((r) => String(r.student) === String(child._id)) || null
      : null
    doc.myStudentId = child?._id || null
  }

  res.json(doc)
}

// @desc   Create trip (admin)
// @route  POST /api/trips
export const createTrip = async (req, res) => {
  const {
    title,
    destination,
    description,
    itinerary,
    category,
    startDate,
    endDate,
    departureTime,
    meetingPoint,
    costPerStudent,
    includes,
    capacity,
    gradesAllowed,
    coordinators,
    isPublic,
  } = req.body

  if (!title || !destination || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'Title, destination, start date and end date are required' })
  }

  const trip = await Trip.create({
    title,
    destination,
    description,
    itinerary: Array.isArray(itinerary) ? itinerary : [],
    category,
    startDate,
    endDate,
    departureTime,
    meetingPoint,
    costPerStudent,
    includes: Array.isArray(includes) ? includes : [],
    capacity,
    gradesAllowed: Array.isArray(gradesAllowed) ? gradesAllowed : [],
    coordinators: Array.isArray(coordinators) ? coordinators : [],
    isPublic: isPublic !== false,
    status: 'open',
  })

  res.status(201).json(await Trip.findById(trip._id).populate(populateAll))
}

// @desc   Update trip (admin)
// @route  PUT /api/trips/:id
export const updateTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })

  const fields = [
    'title',
    'destination',
    'description',
    'itinerary',
    'category',
    'startDate',
    'endDate',
    'departureTime',
    'meetingPoint',
    'costPerStudent',
    'includes',
    'capacity',
    'gradesAllowed',
    'coordinators',
    'status',
    'isPublic',
  ]
  for (const key of fields) {
    if (req.body[key] !== undefined) trip[key] = req.body[key]
  }
  await trip.save()
  res.json(await Trip.findById(trip._id).populate(populateAll))
}

// @desc   Delete trip (admin)
// @route  DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
  const trip = await Trip.findByIdAndDelete(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })
  res.json({ message: 'Trip deleted' })
}

// @desc   Register the logged-in student (or parent's child) for a trip
// @route  POST /api/trips/:id/register
export const registerForTrip = async (req, res) => {
  const { notes, consentSigned } = req.body
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })
  if (trip.status !== 'open') {
    return res.status(400).json({ message: 'This trip is not open for registration' })
  }

  let student
  if (req.user.role === 'student') {
    student = await Student.findOne({ user: req.user._id })
  } else if (req.user.role === 'parent') {
    student = await Student.findOne({ parent: req.user._id })
  } else {
    return res.status(403).json({ message: 'Only students and parents can register' })
  }
  if (!student) return res.status(404).json({ message: 'Student profile not found' })

  // Grade level check
  if (trip.gradesAllowed?.length && student.class) {
    const Class = (await import('../models/Class.js')).default
    const cls = await Class.findById(student.class)
    if (cls && !trip.gradesAllowed.includes(cls.gradeLevel)) {
      return res.status(400).json({ message: `This trip is only for grades: ${trip.gradesAllowed.join(', ')}` })
    }
  }

  if (trip.registrations.length >= trip.capacity) {
    return res.status(400).json({ message: 'This trip is fully booked' })
  }

  const already = trip.registrations.find((r) => String(r.student) === String(student._id))
  if (already) return res.status(409).json({ message: 'Already registered for this trip' })

  trip.registrations.push({
    student: student._id,
    notes: notes || '',
    consentSigned: !!consentSigned,
  })
  await trip.save()
  res.status(201).json({ message: 'Registered successfully', registeredCount: trip.registrations.length })
}

// @desc   Cancel own registration
// @route  DELETE /api/trips/:id/register
export const cancelRegistration = async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })

  let student
  if (req.user.role === 'student') student = await Student.findOne({ user: req.user._id })
  else if (req.user.role === 'parent') student = await Student.findOne({ parent: req.user._id })
  else return res.status(403).json({ message: 'Not allowed' })
  if (!student) return res.status(404).json({ message: 'Student profile not found' })

  trip.registrations = trip.registrations.filter((r) => String(r.student) !== String(student._id))
  await trip.save()
  res.json({ message: 'Registration cancelled' })
}

// @desc   Admin updates a registration (payment/consent)
// @route  PUT /api/trips/:id/registrations/:studentId
export const updateRegistration = async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })

  const reg = trip.registrations.find((r) => String(r.student) === String(req.params.studentId))
  if (!reg) return res.status(404).json({ message: 'Registration not found' })

  if (req.body.paymentStatus) reg.paymentStatus = req.body.paymentStatus
  if (req.body.consentSigned !== undefined) reg.consentSigned = !!req.body.consentSigned
  if (req.body.notes !== undefined) reg.notes = req.body.notes
  await trip.save()
  res.json({ message: 'Registration updated' })
}

// @desc   Admin removes a student from a trip
// @route  DELETE /api/trips/:id/registrations/:studentId
export const removeRegistration = async (req, res) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip) return res.status(404).json({ message: 'Trip not found' })

  trip.registrations = trip.registrations.filter(
    (r) => String(r.student) !== String(req.params.studentId),
  )
  await trip.save()
  res.json({ message: 'Registration removed' })
}

// @desc   Trip statistics for admin dashboard
// @route  GET /api/trips/stats/summary
export const getTripStats = async (req, res) => {
  const trips = await Trip.find()
  const now = new Date()
  const upcoming = trips.filter((t) => new Date(t.startDate) >= now && t.status !== 'cancelled')
  const totalRegistrations = trips.reduce((s, t) => s + t.registrations.length, 0)
  const revenuePotential = trips.reduce(
    (s, t) => s + t.registrations.filter((r) => r.paymentStatus === 'paid').length * t.costPerStudent,
    0,
  )

  res.json({
    totalTrips: trips.length,
    upcoming: upcoming.length,
    totalRegistrations,
    revenuePotential,
  })
}
