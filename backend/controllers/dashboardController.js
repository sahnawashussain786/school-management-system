import User from '../models/User.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import Class from '../models/Class.js'
import FeeInvoice from '../models/FeeInvoice.js'
import Announcement from '../models/Announcement.js'
import Trip from '../models/Trip.js'
import Attendance from '../models/Attendance.js'
import Event from '../models/Event.js'
import Exam from '../models/Exam.js'

// @desc   Dashboard overview stats for the logged-in user's role
// @route  GET /api/dashboard
export const getDashboard = async (req, res) => {
  const role = req.user.role
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (role === 'admin') {
    const [studentCount, teacherCount, classCount, tripAgg] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Class.countDocuments(),
      Trip.aggregate([
        { $project: { regs: { $size: { $ifNull: ['$registrations', []] } } } },
        { $group: { _id: null, total: { $sum: '$regs' } } },
      ]),
    ])

    const invoices = await FeeInvoice.find()
    const billed = invoices.reduce((s, i) => s + i.amount, 0)
    const collected = invoices.reduce((s, i) => s + i.payments.reduce((a, p) => a + p.amount, 0), 0)
    const overdue = invoices.filter((i) => i.status === 'overdue').length

    // attendance today
    const todaySheets = await Attendance.find({ date: { $gte: today, $lt: tomorrow } })
    let present = 0
    let totalMarked = 0
    for (const sheet of todaySheets) {
      for (const r of sheet.records) {
        totalMarked++
        if (r.status === 'present' || r.status === 'late') present++
      }
    }

    const recentAnnouncements = await Announcement.find({ published: true })
      .sort('-publishedAt')
      .limit(5)
      .populate('author', 'name')

    const upcomingTrips = await Trip.find({
      startDate: { $gte: today },
      status: { $nin: ['cancelled', 'completed'] },
    })
      .sort('startDate')
      .limit(5)

    res.json({
      role,
      stats: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        tripRegistrations: tripAgg[0]?.total || 0,
        fees: { billed, collected, outstanding: billed - collected, overdue },
        attendanceToday: {
          present,
          totalMarked,
          rate: totalMarked ? Math.round((present / totalMarked) * 100) : 0,
        },
      },
      announcements: recentAnnouncements,
      trips: upcomingTrips,
    })
    return
  }

  if (role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id }).populate('classes', 'name')
    const classIds = teacher?.classes?.map((c) => c._id) || []

    const upcomingTrips = await Trip.find({
      coordinators: teacher?._id,
      startDate: { $gte: today },
    })
      .sort('startDate')
      .limit(5)

    const announcements = await Announcement.find({ published: true })
      .sort('-publishedAt')
      .limit(5)

    res.json({
      role,
      teacher: teacher
        ? { employeeId: teacher.employeeId, department: teacher.department, classes: teacher.classes }
        : null,
      stats: { classCount: classIds.length },
      announcements,
      trips: upcomingTrips,
    })
    return
  }

  if (role === 'student' || role === 'parent') {
    const student =
      role === 'student'
        ? await Student.findOne({ user: req.user._id })
        : await Student.findOne({ parent: req.user._id })

    if (!student) {
      return res.json({ role, student: null, stats: {}, announcements: [], trips: [] })
    }

    await student.populate('class', 'name')

    // attendance summary
    const sheets = await Attendance.find({ 'records.student': student._id }).sort('-date').limit(60)
    let present = 0
    for (const sheet of sheets) {
      const rec = sheet.records.find((r) => String(r.student) === String(student._id))
      if (rec && (rec.status === 'present' || rec.status === 'late')) present++
    }
    const attendanceRate = sheets.length ? Math.round((present / sheets.length) * 100) : 0

    // fees
    const invoices = await FeeInvoice.find({ student: student._id })
    const due = invoices.reduce(
      (s, i) => s + (i.amount - i.payments.reduce((a, p) => a + p.amount, 0)),
      0,
    )
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length

    // trips registered
    const registeredTrips = await Trip.find({ 'registrations.student': student._id }).sort(
      '-startDate',
    )

    const announcements = await Announcement.find({
      published: true,
      audience: { $in: ['all', role === 'parent' ? 'parents' : 'students'] },
    })
      .sort('-publishedAt')
      .limit(5)

    const upcomingEvents = await Event.find({ startDate: { $gte: today }, isPublic: true })
      .sort('startDate')
      .limit(5)

    res.json({
      role,
      student: { name: req.user.name, class: student.class?.name || 'Unassigned' },
      stats: { attendanceRate, feesDue: due, overdueInvoices, tripsRegistered: registeredTrips.length },
      announcements,
      trips: registeredTrips,
      events: upcomingEvents,
    })
    return
  }

  res.status(400).json({ message: 'Unknown role' })
}
