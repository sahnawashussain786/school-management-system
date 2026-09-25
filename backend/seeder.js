import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import connectDB from './config/db.js'
import {
  User,
  Student,
  Teacher,
  Class,
  Subject,
  Attendance,
  Exam,
  Assignment,
  Timetable,
  FeeInvoice,
  Announcement,
  Trip,
  LibraryBook,
  Event,
} from './models/index.js'

// Allow running directly (node seeder.js) or being imported (smoke tests)
const isDirectRun = process.argv[1] && process.argv[1].endsWith('seeder.js')

const DAY_START = new Date(new Date().setHours(0, 0, 0, 0))
const daysFromNow = (n) => {
  const d = new Date(DAY_START)
  d.setDate(d.getDate() + n)
  return d
}
const pick = (arr, i) => arr[i % arr.length]

export const seed = async () => {
  console.log('🧹 Clearing existing data...')
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Attendance.deleteMany({}),
    Exam.deleteMany({}),
    Assignment.deleteMany({}),
    Timetable.deleteMany({}),
    FeeInvoice.deleteMany({}),
    Announcement.deleteMany({}),
    Trip.deleteMany({}),
    LibraryBook.deleteMany({}),
    Event.deleteMany({}),
  ])

  console.log('👤 Creating users...')
  const admin = await User.create({
    name: 'Principal Hartman',
    email: 'admin@school.edu',
    password: 'admin123',
    role: 'admin',
    phone: '+1 555 0100',
  })

  const teacherSeed = [
    { name: 'Sarah Mitchell', email: 'sarah@school.edu', dept: 'Mathematics', qual: 'M.Sc. Mathematics' },
    { name: 'James Okafor', email: 'james@school.edu', dept: 'Science', qual: 'M.Sc. Physics' },
    { name: 'Emily Chen', email: 'emily@school.edu', dept: 'Languages', qual: 'M.A. English Lit.' },
    { name: 'David Rodriguez', email: 'david@school.edu', dept: 'Humanities', qual: 'M.A. History' },
    { name: 'Aisha Khan', email: 'aisha@school.edu', dept: 'Computer Science', qual: 'B.Tech CS' },
  ]
  const teacherUsers = await User.create(
    teacherSeed.map((t) => ({ name: t.name, email: t.email, password: 'teacher123', role: 'teacher' })),
  )
  const teachers = await Teacher.create(
    teacherUsers.map((u, i) => ({
      user: u._id,
      employeeId: `EMP-${String(i + 1).padStart(3, '0')}`,
      department: teacherSeed[i].dept,
      qualification: teacherSeed[i].qual,
      salary: 48000 + i * 2500,
      joinDate: daysFromNow(-800 - i * 60),
    })),
  )

  const studentSeed = [
    'Alex Turner', 'Maya Patel', 'Liam O’Brien', 'Sofia Rossi', 'Noah Kim',
    'Zara Ahmed', 'Ethan Brown', 'Chloe Dubois', 'Daniel Silva', 'Grace Adeyemi',
    'Lucas Meyer', 'Amara Nwosu', 'Ben Carter', 'Isla Fraser', 'Omar Haddad',
  ]
  const studentUsers = await User.create(
    studentSeed.map((name, i) => ({
      name,
      email: `student${i + 1}@school.edu`,
      password: 'student123',
      role: 'student',
    })),
  )
  // one parent linked to the first student
  const parentUser = await User.create({
    name: 'Robert Turner',
    email: 'parent@school.edu',
    password: 'parent123',
    role: 'parent',
    phone: '+1 555 0777',
  })

  console.log('📚 Subjects & classes...')
  const subjectDefs = [
    ['Mathematics', 'MATH'], ['Physics', 'PHY'], ['Chemistry', 'CHEM'],
    ['English', 'ENG'], ['History', 'HIST'], ['Computer Science', 'CS'],
    ['Biology', 'BIO'], ['Geography', 'GEO'],
  ]
  const subjects = await Subject.create(
    subjectDefs.map(([name, code], i) => ({
      name,
      code,
      teacher: teachers[i % teachers.length]._id,
      gradeLevels: [9, 10, 11, 12],
    })),
  )
  for (let i = 0; i < teachers.length; i++) {
    teachers[i].subjects = [subjects[i % subjects.length]._id]
    await teachers[i].save()
  }

  const classDefs = [
    { name: 'Grade 9 - A', gradeLevel: 9, section: 'A', room: '101' },
    { name: 'Grade 10 - A', gradeLevel: 10, section: 'A', room: '204' },
    { name: 'Grade 11 - Science', gradeLevel: 11, section: 'S', room: '310' },
  ]
  const classes = await Class.create(
    classDefs.map((c, i) => ({
      ...c,
      homeroomTeacher: teachers[i % teachers.length]._id,
      subjects: subjects.map((s) => s._id),
      capacity: 35,
    })),
  )
  for (let i = 0; i < teachers.length; i++) {
    teachers[i].classes = [classes[i % classes.length]._id]
    await teachers[i].save()
  }

  console.log('🎒 Students into classes...')
  const students = []
  for (let i = 0; i < studentUsers.length; i++) {
    const cls = classes[i % classes.length]
    const s = await Student.create({
      user: studentUsers[i]._id,
      admissionNumber: `ADM-2026-${String(i + 1).padStart(3, '0')}`,
      rollNumber: String((i % 5) + 1),
      class: cls._id,
      dateOfBirth: daysFromNow(-365 * (14 + (i % 3))),
      gender: i % 2 === 0 ? 'female' : 'male',
      guardianName: `Guardian of ${studentSeed[i]}`,
      guardianPhone: `+1 555 02${String(i).padStart(2, '0')}`,
      parent: i === 0 ? parentUser._id : null,
      bloodGroup: pick(['A+', 'O+', 'B+', 'AB+'], i),
      address: 'Springfield, CA',
    })
    students.push(s)
  }

  console.log('🗓 Timetable...')
  const times = [
    ['08:00', '08:45'], ['08:50', '09:35'], ['09:40', '10:25'],
    ['10:45', '11:30'], ['11:35', '12:20'], ['13:00', '13:45'],
  ]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timetableDocs = []
  for (const cls of classes) {
    for (let d = 0; d < days.length; d++) {
      for (let p = 0; p < 6; p++) {
        const subj = subjects[(d + p) % subjects.length]
        timetableDocs.push({
          class: cls._id,
          day: days[d],
          period: p + 1,
          startTime: times[p][0],
          endTime: times[p][1],
          subject: subj._id,
          teacher: subj.teacher,
          room: cls.roomNumber || 'TBD',
        })
      }
    }
  }
  await Timetable.insertMany(timetableDocs)

  console.log('✅ Attendance (last 10 school days)...')
  let attendanceCount = 0
  for (let d = 1; d <= 14 && attendanceCount < 10; d++) {
    const date = daysFromNow(-d)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    for (const cls of classes) {
      const clsStudents = students.filter((s) => String(s.class) === String(cls._id))
      if (!clsStudents.length) continue
      const records = clsStudents.map((s, i) => {
        const roll = (i + d) % 10
        const status = roll === 0 ? 'absent' : roll === 5 ? 'late' : 'present'
        return { student: s._id, status }
      })
      await Attendance.create({ class: cls._id, date, takenBy: teacherUsers[0]._id, records })
      attendanceCount++
    }
  }

  console.log('📝 Exams with results...')
  const examDefs = [
    ['Mid-Term Mathematics', 'mid-term', 'MATH'],
    ['Mid-Term Physics', 'mid-term', 'PHY'],
    ['Unit Test — English', 'unit-test', 'ENG'],
    ['Final Computer Science', 'final', 'CS'],
  ]
  for (const [name, type, code] of examDefs) {
    const subject = subjects.find((s) => s.code === code)
    const cls = pick(classes, subject.code.length)
    const clsStudents = students.filter((s) => String(s.class) === String(cls._id))
    await Exam.create({
      name,
      examType: type,
      class: cls._id,
      subject: subject._id,
      date: daysFromNow(-7),
      totalMarks: 100,
      passingMarks: 40,
      published: true,
      results: clsStudents.map((s, i) => {
        const marks = 45 + ((i * 13) % 50)
        const pct = marks
        const grade =
          pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
        return { student: s._id, marks, grade }
      }),
    })
  }

  console.log('📋 Assignments...')
  await Assignment.create({
    title: 'Quadratic Equations Worksheet',
    description: 'Solve problems 1–20 from chapter 4. Show all working.',
    class: classes[0]._id,
    subject: subjects[0]._id,
    teacher: teachers[0]._id,
    dueDate: daysFromNow(3),
    totalMarks: 50,
    submissions: [
      { student: students[0]._id, status: 'submitted', content: 'Completed worksheet attached.' },
    ],
  })
  await Assignment.create({
    title: 'Physics Lab Report — Circuits',
    description: 'Write a full report on the series/parallel circuit experiment.',
    class: classes[2]._id,
    subject: subjects[1]._id,
    teacher: teachers[1]._id,
    dueDate: daysFromNow(6),
    totalMarks: 100,
  })
  await Assignment.create({
    title: 'Essay: Themes in "Macbeth"',
    description: '800-word analytical essay on ambition and fate.',
    class: classes[1]._id,
    subject: subjects[3]._id,
    teacher: teachers[2]._id,
    dueDate: daysFromNow(-2),
    totalMarks: 100,
    submissions: [],
  })

  console.log('💰 Fees...')
  let seq = 1
  for (const s of students) {
    const status = seq % 4 === 0 ? 'unpaid' : seq % 4 === 1 ? 'partial' : 'paid'
    const amount = 450
    const payments =
      status === 'paid'
        ? [{ amount, method: 'card', paidAt: daysFromNow(-5) }]
        : status === 'partial'
          ? [{ amount: 200, method: 'cash', paidAt: daysFromNow(-3) }]
          : []
    await FeeInvoice.create({
      invoiceNumber: `INV-2026-${String(seq).padStart(5, '0')}`,
      student: s._id,
      title: 'Tuition — September 2026',
      amount,
      dueDate: daysFromNow(5),
      month: '2026-09',
      payments,
      status,
    })
    seq++
  }

  console.log('📣 Announcements, events, library...')
  await Announcement.create([
    {
      title: 'Parent–Teacher Conference',
      body: 'The fall parent–teacher conference will be held on Friday, October 9th from 2 PM to 6 PM in the main hall. Please book slots with your class teacher.',
      category: 'academic',
      priority: 'high',
      audience: 'all',
      author: admin._id,
    },
    {
      title: 'Science Fair Registration Open',
      body: 'Students from grades 9–12 can now register for the annual Science Fair. Projects due two weeks before the event.',
      category: 'event',
      audience: 'students',
      author: admin._id,
    },
    {
      title: 'Staff Meeting — Curriculum Planning',
      body: 'All teaching staff are reminded of the curriculum planning meeting on Monday at 3:40 PM in the staff room.',
      category: 'general',
      audience: 'teachers',
      author: admin._id,
    },
  ])

  await Event.create([
    {
      title: 'Annual Sports Day',
      description: 'Track & field events, house competitions and the parents’ relay.',
      category: 'sports',
      startDate: daysFromNow(12),
      location: 'Main Field',
    },
    {
      title: 'Autumn Music Concert',
      description: 'Performances by the school orchestra, choir and jazz band.',
      category: 'cultural',
      startDate: daysFromNow(20),
      location: 'Auditorium',
    },
    {
      title: 'Mid-Term Break',
      description: 'School closed for the mid-term holiday.',
      category: 'holiday',
      startDate: daysFromNow(30),
      endDate: daysFromNow(34),
    },
  ])

  await LibraryBook.create([
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      category: 'Fiction',
      totalCopies: 6,
      availableCopies: 4,
      shelf: 'FIC-01',
      loans: [{ student: students[1]._id, dueDate: daysFromNow(9), status: 'borrowed' }],
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '9780553380163',
      category: 'Science',
      totalCopies: 4,
      availableCopies: 4,
      shelf: 'SCI-03',
    },
    {
      title: 'Introduction to Algorithms',
      author: 'Cormen, Leiserson, Rivest & Stein',
      isbn: '9780262046305',
      category: 'Computer Science',
      totalCopies: 3,
      availableCopies: 2,
      shelf: 'CS-01',
      loans: [{ student: students[4]._id, dueDate: daysFromNow(-2), status: 'borrowed' }],
    },
    {
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      isbn: '9780553296983',
      category: 'History',
      totalCopies: 5,
      availableCopies: 5,
      shelf: 'HIS-02',
    },
  ])

  console.log('🚌 School trips...')
  await Trip.create([
    {
      title: 'Natural History Museum Visit',
      destination: 'Natural History Museum, Los Angeles',
      description:
        'A guided tour of the dinosaur hall, gem vault and the new ecosystems exhibit. Includes a hands-on workshop on plate tectonics.',
      itinerary: [
        '07:45 — Assemble at school gate',
        '08:00 — Depart by chartered coach',
        '09:30 — Guided tour: Dinosaur Hall',
        '11:00 — Workshop: Earth Sciences Lab',
        '12:30 — Packed lunch at Exposition Park',
        '14:00 — Gems & Minerals gallery',
        '15:30 — Depart for school',
        '17:00 — Arrive back at school',
      ],
      category: 'educational',
      startDate: daysFromNow(14),
      endDate: daysFromNow(14),
      departureTime: '08:00',
      meetingPoint: 'Main Gate, Greenwood International School',
      costPerStudent: 25,
      includes: ['Coach travel', 'Entry tickets', 'Workshop fee', 'Lunch supervision'],
      capacity: 60,
      gradesAllowed: [9, 10, 11],
      coordinators: [teachers[1]._id, teachers[2]._id],
      status: 'open',
      registrations: [
        { student: students[2]._id, paymentStatus: 'paid', consentSigned: true },
        { student: students[3]._id, paymentStatus: 'paid', consentSigned: true },
        { student: students[5]._id, paymentStatus: 'unpaid', consentSigned: true },
        { student: students[7]._id, paymentStatus: 'unpaid', consentSigned: false },
      ],
    },
    {
      title: 'Yosemite National Park — 3-Day Expedition',
      destination: 'Yosemite Valley, CA',
      description:
        'An overnight residential trip with ranger-led hikes, star-gazing, and a conservation workshop. Students stay in park lodges with accompanying staff.',
      itinerary: [
        'Day 1 — Travel, valley orientation walk, evening astronomy session',
        'Day 2 — Ranger-led hike to Vernal Fall, geology workshop, campfire',
        'Day 3 — Conservation service activity, return by evening',
      ],
      category: 'adventure',
      startDate: daysFromNow(40),
      endDate: daysFromNow(42),
      departureTime: '06:30',
      meetingPoint: 'School Bus Bay',
      costPerStudent: 180,
      includes: ['Transport', 'Lodging', 'All meals', 'Park entry', 'Ranger fees', 'Insurance'],
      capacity: 36,
      gradesAllowed: [10, 11, 12],
      coordinators: [teachers[0]._id, teachers[4]._id],
      status: 'open',
      registrations: [
        { student: students[1]._id, paymentStatus: 'paid', consentSigned: true },
        { student: students[4]._id, paymentStatus: 'paid', consentSigned: true },
        { student: students[6]._id, paymentStatus: 'partial', consentSigned: true, notes: 'Balance due by Oct 20' },
      ],
    },
    {
      title: 'City Art Gallery & Studio Day',
      destination: 'Springfield Museum of Art',
      description:
        'A cultural day trip exploring the modern collection, followed by a printmaking studio session with a local artist.',
      itinerary: [
        '09:00 — Depart school',
        '10:00 — Guided gallery tour',
        '12:00 — Lunch',
        '13:00 — Printmaking workshop',
        '15:30 — Return',
      ],
      category: 'cultural',
      startDate: daysFromNow(25),
      endDate: daysFromNow(25),
      departureTime: '09:00',
      meetingPoint: 'Main Gate',
      costPerStudent: 15,
      includes: ['Entry', 'Workshop materials'],
      capacity: 30,
      gradesAllowed: [9, 10, 11, 12],
      coordinators: [teachers[3]._id],
      status: 'draft',
      registrations: [],
    },
  ])

  console.log('')
  console.log('✅ Seed complete! Demo accounts:')
  console.log('   Admin:   admin@school.edu    / admin123')
  console.log('   Teacher: sarah@school.edu    / teacher123')
  console.log('   Student: student1@school.edu / student123')
  console.log('   Parent:  parent@school.edu   / parent123')
  console.log('')

  console.log('')
  console.log('✅ Seed complete!')
}

const run = async () => {
  await connectDB()
  await seed()
  await mongoose.disconnect()
  process.exit(0)
}

if (isDirectRun) {
  run().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
}
