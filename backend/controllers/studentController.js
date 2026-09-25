import User from '../models/User.js'
import Student from '../models/Student.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List students with filters (class, status, search)
// @route  GET /api/students
export const getStudents = async (req, res) => {
  const filter = buildFilter(req.query, ['name', 'admissionNumber'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    Student.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate('user', 'name email phone avatar')
      .populate('class', 'name gradeLevel section'),
    Student.countDocuments(filter),
  ])

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Get a single student with details
// @route  GET /api/students/:id
export const getStudent = async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('class', 'name gradeLevel section')
    .populate('parent', 'name email phone')
  if (!student) return res.status(404).json({ message: 'Student not found' })
  res.json(student)
}

// @desc   Create a student together with their user account
// @route  POST /api/students
export const createStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    admissionNumber,
    rollNumber,
    class: classId,
    dateOfBirth,
    gender,
    address,
    guardianName,
    guardianPhone,
    bloodGroup,
    medicalNotes,
  } = req.body

  if (!name || !email || !admissionNumber) {
    return res.status(400).json({ message: 'Name, email and admission number are required' })
  }

  const existsUser = await User.findOne({ email: email.toLowerCase() })
  if (existsUser) return res.status(409).json({ message: 'Email already in use' })
  const existsAdm = await Student.findOne({ admissionNumber })
  if (existsAdm) return res.status(409).json({ message: 'Admission number already exists' })

  const user = await User.create({
    name,
    email,
    password: password || 'student123',
    role: 'student',
    phone,
  })

  const student = await Student.create({
    user: user._id,
    admissionNumber,
    rollNumber,
    class: classId || null,
    dateOfBirth,
    gender,
    address,
    guardianName,
    guardianPhone,
    bloodGroup,
    medicalNotes,
  })

  const populated = await Student.findById(student._id)
    .populate('user', 'name email')
    .populate('class', 'name')
  res.status(201).json(populated)
}

// @desc   Update a student (and optionally their account name/phone)
// @route  PUT /api/students/:id
export const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', 'name email')
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const studentFields = [
    'rollNumber',
    'class',
    'dateOfBirth',
    'gender',
    'address',
    'guardianName',
    'guardianPhone',
    'bloodGroup',
    'medicalNotes',
    'status',
  ]
  for (const key of studentFields) {
    if (req.body[key] !== undefined) student[key] = req.body[key]
  }
  await student.save()

  const userUpdates = {}
  if (req.body.name) userUpdates.name = req.body.name
  if (req.body.phone !== undefined) userUpdates.phone = req.body.phone
  if (Object.keys(userUpdates).length && student.user && student.user._id) {
    await User.findByIdAndUpdate(student.user._id, userUpdates)
  }

  const updated = await Student.findById(student._id)
    .populate('user', 'name email phone avatar')
    .populate('class', 'name gradeLevel section')
  res.json(updated)
}

// @desc   Delete a student and their account
// @route  DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found' })
  if (student.user) await User.deleteOne({ _id: student.user })
  await student.deleteOne()
  res.json({ message: 'Student deleted' })
}
