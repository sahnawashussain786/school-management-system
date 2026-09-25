import Attendance from '../models/Attendance.js'
import Student from '../models/Student.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   Get class roster for marking attendance on a date
// @route  GET /api/attendance/roster?classId=...&date=YYYY-MM-DD
export const getRoster = async (req, res) => {
  const { classId, date } = req.query
  if (!classId || !date) {
    return res.status(400).json({ message: 'classId and date are required' })
  }

  const students = await Student.find({ class: classId, status: 'active' })
    .populate('user', 'name')
    .sort('rollNumber')

  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  const next = new Date(day)
  next.setDate(next.getDate() + 1)

  const sheet = await Attendance.findOne({ class: classId, date: { $gte: day, $lt: next } })

  const records = students.map((s) => {
    const existing = sheet?.records?.find((r) => String(r.student) === String(s._id))
    return {
      student: s._id,
      name: s.user?.name || 'Unknown',
      rollNumber: s.rollNumber || '',
      admissionNumber: s.admissionNumber,
      status: existing?.status || 'unmarked',
      note: existing?.note || '',
    }
  })

  res.json({ date, class: classId, attendanceId: sheet?._id || null, records })
}

// @desc   Mark attendance for a class on a date (upsert)
// @route  POST /api/attendance
export const markAttendance = async (req, res) => {
  const { classId, date, records } = req.body
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ message: 'classId, date and records array are required' })
  }

  const day = new Date(date)
  day.setHours(0, 0, 0, 0)

  const sheet = await Attendance.findOneAndUpdate(
    { class: classId, date: day },
    {
      $set: {
        records: records.map((r) => ({
          student: r.student,
          status: r.status,
          note: r.note || '',
        })),
        takenBy: req.user._id,
      },
    },
    { new: true, upsert: true, runValidators: true },
  )

  res.status(201).json(sheet)
}

// @desc   Attendance history with filters
// @route  GET /api/attendance?class=...&from=...&to=...
export const getAttendance = async (req, res) => {
  const filter = buildFilter(req.query, [])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    Attendance.find(filter).skip(skip).limit(limit).sort(sort || '-date').populate('class', 'name'),
    Attendance.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Attendance summary for one student
// @route  GET /api/attendance/student/:studentId
export const getStudentAttendance = async (req, res) => {
  const sheets = await Attendance.find({ 'records.student': req.params.studentId }).sort('-date')

  let present = 0
  let absent = 0
  let late = 0
  let excused = 0
  const history = []

  for (const sheet of sheets) {
    const rec = sheet.records.find((r) => String(r.student) === String(req.params.studentId))
    if (!rec) continue
    history.push({ date: sheet.date, status: rec.status, note: rec.note })
    if (rec.status === 'present') present++
    else if (rec.status === 'absent') absent++
    else if (rec.status === 'late') late++
    else if (rec.status === 'excused') excused++
  }

  const totalDays = present + absent + late + excused
  const rate = totalDays ? Math.round(((present + late) / totalDays) * 100) : 0

  res.json({ summary: { present, absent, late, excused, totalDays, rate }, history })
}
