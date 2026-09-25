import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'devsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
}

// @desc   Register a new user (first registered user becomes admin)
// @route  POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    return res.status(409).json({ message: 'An account with this email already exists' })
  }

  const userCount = await User.countDocuments()
  // First ever user is the owner/admin; afterwards new registrations default to teacher
  const effectiveRole = userCount === 0 ? 'admin' : role || 'teacher'

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: effectiveRole,
    phone,
  })

  sendTokenResponse(user, 201, res)
}

// @desc   Login user
// @route  POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  sendTokenResponse(user, 200, res)
}

// @desc   Get current logged-in user
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({ user })
}

// @desc   Update own profile (name/phone/password)
// @route  PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password')
  if (!user) return res.status(404).json({ message: 'User not found' })

  const { name, phone, avatar, currentPassword, newPassword } = req.body

  if (name) user.name = name
  if (phone !== undefined) user.phone = phone
  if (avatar !== undefined) user.avatar = avatar

  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    user.password = newPassword
  }

  await user.save()
  sendTokenResponse(user, 200, res)
}

// @desc   Logout (clear cookie)
// @route  POST /api/auth/logout
export const logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.json({ message: 'Logged out' })
}
