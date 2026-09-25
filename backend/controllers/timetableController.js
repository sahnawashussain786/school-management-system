import Timetable from '../models/Timetable.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// @desc   Full weekly timetable grid for a class
// @route  GET /api/timetable/:classId
export const getClassTimetable = async (req, res) => {
  const entries = await Timetable.find({ class: req.params.classId })
    .populate('subject', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort('period')

  const grid = {}
  for (const day of DAYS) grid[day] = []
  for (const e of entries) {
    if (grid[e.day]) {
      grid[e.day].push({
        _id: e._id,
        period: e.period,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject ? { _id: e.subject._id, name: e.subject.name, code: e.subject.code } : null,
        teacher: e.teacher?.user?.name || '',
        room: e.room || '',
      })
    }
  }
  for (const day of DAYS) grid[day].sort((a, b) => a.period - b.period)

  res.json(grid)
}

// @desc   Create a timetable entry
// @route  POST /api/timetable
export const createEntry = async (req, res) => {
  const { classId, day, period, startTime, endTime, subjectId, teacherId, room } = req.body
  if (!classId || !day || !period || !startTime || !endTime || !subjectId) {
    return res.status(400).json({ message: 'classId, day, period, times and subject are required' })
  }

  const entry = await Timetable.create({
    class: classId,
    day,
    period,
    startTime,
    endTime,
    subject: subjectId,
    teacher: teacherId || null,
    room,
  })
  res.status(201).json(entry)
}

// @desc   Delete a timetable entry
// @route  DELETE /api/timetable/:id
export const deleteEntry = async (req, res) => {
  const entry = await Timetable.findByIdAndDelete(req.params.id)
  if (!entry) return res.status(404).json({ message: 'Entry not found' })
  res.json({ message: 'Entry deleted' })
}

// @desc   Timetable for logged-in student
// @route  GET /api/timetable/my/week
export const getMyTimetable = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
  if (!student?.class) return res.json({})

  const entries = await Timetable.find({ class: student.class })
    .populate('subject', 'name code')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort('period')

  const grid = {}
  for (const day of DAYS) grid[day] = []
  for (const e of entries) {
    if (grid[e.day]) {
      grid[e.day].push({
        period: e.period,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject?.name || '',
        teacher: e.teacher?.user?.name || '',
        room: e.room || '',
      })
    }
  }
  res.json(grid)
}

// @desc   Teaching schedule for logged-in teacher
// @route  GET /api/timetable/my/schedule
export const getMySchedule = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
  if (!teacher) return res.json({})

  const entries = await Timetable.find({ teacher: teacher._id })
    .populate('subject', 'name code')
    .populate('class', 'name')
    .sort('period')

  const grid = {}
  for (const day of DAYS) grid[day] = []
  for (const e of entries) {
    if (grid[e.day]) {
      grid[e.day].push({
        period: e.period,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject?.name || '',
        class: e.class?.name || '',
        room: e.room || '',
      })
    }
  }
  res.json(grid)
}
