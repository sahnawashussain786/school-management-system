import User from '../models/User.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   Get all users (admin)
// @route  GET /api/users
export const getUsers = async (req, res) => {
  const filter = buildFilter(req.query, ['name', 'email'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort(sort).select('-__v'),
    User.countDocuments(filter),
  ])

  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Create a user (admin) — can also create linked Student/Teacher profile
// @route  POST /api/users
export const createUser = async (req, res) => {
  const { name, email, password, role, phone, profile } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ message: 'Email already in use' })

  const user = await User.create({ name, email, password, role: role || 'student', phone })

  // Optionally create the linked profile
  if (profile && role === 'student' && profile.admissionNumber) {
    await Student.create({ user: user._id, ...profile })
  } else if (profile && role === 'teacher' && profile.employeeId) {
    await Teacher.create({ user: user._id, ...profile })
  }

  res.status(201).json({ ...user.toObject(), password: undefined })
}

// @desc   Update any user (admin)
// @route  PUT /api/users/:id
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const allowed = ['name', 'email', 'role', 'phone', 'avatar', 'isActive']
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key]
  }
  // Password change via this route requires explicit new password
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    user.password = req.body.password
  }

  await user.save()
  res.json({ ...user.toObject(), password: undefined })
}

// @desc   Delete a user (admin)
// @route  DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin account' })
    }
  }

  await Student.deleteOne({ user: user._id })
  await Teacher.deleteOne({ user: user._id })
  await user.deleteOne()
  res.json({ message: 'User deleted' })
}
