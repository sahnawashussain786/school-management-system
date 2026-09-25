import User from '../models/User.js'

/**
 * Protect routes — requires a valid JWT (from httpOnly cookie or
 * Authorization: Bearer header).
 */
export const protect = async (req, res, next) => {
  let token

  if (req.cookies?.token) {
    token = req.cookies.token
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const jwt = (await import('jsonwebtoken')).default
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    req.user = await User.findById(decoded.id)
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

/**
 * Restrict a route to specific roles.
 * Usage: router.route('/').post(protect, authorize('admin'), handler)
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied: requires role ${roles.join(' or ')}` })
    }
    next()
  }
