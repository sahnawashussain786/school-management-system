import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'

import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import publicRoutes from './routes/publicRoutes.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import classRoutes from './routes/classRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import examRoutes from './routes/examRoutes.js'
import assignmentRoutes from './routes/assignmentRoutes.js'
import feeRoutes from './routes/feeRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import libraryRoutes from './routes/libraryRoutes.js'
import announcementRoutes from './routes/announcementRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import timetableRoutes from './routes/timetableRoutes.js'

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(morgan('dev'))

const corsOptions = {
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
}
app.use(cors(corsOptions))

// Basic rate limiting on the whole API
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// Extra strict limit for auth attempts
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/auth', authLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// Mount routes
app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/fees', feeRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
