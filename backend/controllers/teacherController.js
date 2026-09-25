import User from '../models/User.js'
import Teacher from '../models/Teacher.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List teachers with filters
// @route  GET /api/teachers
export const getTeachers = async (req, res) => {
  const filter = buildFilter(req.query, ['name', 'employeeId', 'department'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    Teacher.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate('user', 'name email phone avatar')
      .populate('subjects', 'name code')
      .populate('classes', 'name gradeLevel section'),
    Teacher.countDocuments(filter),
  ])

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Get a single teacher
// @route  GET /api/teachers/:id
export const getTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('subjects', 'name code')
    .populate('classes', 'name gradeLevel section')
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
  res.json(teacher)
}

// @desc   Create a teacher with user account
// @route  POST /api/teachers
export const createTeacher = async (req, res) => {
  const {
    name,
    email,
    password,
    employeeId,
    department,
    qualification,
    subjects,
    classes,
    joinDate,
    salary,
    phone,
    address,
  } = req.body

  if (!name || !email || !employeeId) {
    return res.status(400).json({ message: 'Name, email and employee ID are required' })
  }

  const existsUser = await User.findOne({ email: email.toLowerCase() })
  if (existsUser) return res.status(409).json({ message: 'Email already in use' })
  const existsEmp = await Teacher.findOne({ employeeId })
  if (existsEmp) return res.status(409).json({ message: 'Employee ID already exists' })

  const user = await User.create({
    name,
    email,
    password: password || 'teacher123',
    role: 'teacher',
    phone,
  })

  const teacher = await Teacher.create({
    user: user._id,
    employeeId,
    department,
    qualification,
    subjects,
    classes,
    joinDate,
    salary,
    phone,
    address,
  })

  const populated = await Teacher.findById(teacher._id)
    .populate('user', 'name email')
    .populate('subjects', 'name')
  res.status(201).json(populated)
}

// @desc   Update a teacher
// @route  PUT /api/teachers/:id
export const updateTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

  const fields = [
    'department',
    'qualification',
    'subjects',
    'classes',
    'joinDate',
    'salary',
    'phone',
    'address',
    'status',
  ]
  for (const key of fields) {
    if (req.body[key] !== undefined) teacher[key] = req.body[key]
  }
  await teacher.save()

  const userUpdates = {}
  if (req.body.name) userUpdates.name = req.body.name
  if (req.body.email) userUpdates.email = req.body.email
  if (Object.keys(userUpdates).length && teacher.user) {
    await User.findByIdAndUpdate(teacher.user, userUpdates)
  }

  const updated = await Teacher.findById(teacher._id)
    .populate('user', 'name email phone avatar')
    .populate('subjects', 'name code')
    .populate('classes', 'name')
  res.json(updated)
}

// @desc   Delete a teacher and account
// @route  DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
  if (teacher.user) await User.deleteOne({ _id: teacher.user })
  await teacher.deleteOne()
  res.json({ message: 'Teacher deleted' })
}
