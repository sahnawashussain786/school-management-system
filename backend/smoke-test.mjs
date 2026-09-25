/**
 * Temporary smoke test: boots an in-memory MongoDB, seeds data,
 * starts the API, and exercises key endpoints including the trips flow.
 * Delete after use.
 */
process.env.NODE_ENV = 'development'
process.env.JWT_SECRET = 'smoketest'
process.env.PORT = '5599'

import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create()
process.env.MONGO_URI = mongod.getUri('schoolms')
console.log('In-memory MongoDB at', process.env.MONGO_URI)

const { default: connectDB } = await import('./config/db.js')
const { default: app } = await import('./app.js')

await connectDB()

// silence server listen
const server = app.listen(5599)

// run seeder against the same connection
await import('./seeder-run.js').catch(() => null)

const BASE = 'http://localhost:5599/api'
let failures = 0

const req = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

const check = (name, cond, extra = '') => {
  if (cond) console.log(`  ✓ ${name}`)
  else {
    failures++
    console.log(`  ✗ ${name} ${extra}`)
  }
}

const login = async (email, password) => {
  const r = await req('POST', '/auth/login', { body: { email, password } })
  return r.data.token
}

console.log('\n— Public —')
{
  const r = await req('GET', '/public/info')
  check('GET /public/info', r.status === 200 && r.data.name)
  const t = await req('GET', '/public/trips')
  check('GET /public/trips returns trips', t.status === 200 && Array.isArray(t.data) && t.data.length >= 2, JSON.stringify(t.data).slice(0, 100))
}

console.log('\n— Auth —')
const adminToken = await login('admin@school.edu', 'admin123')
check('admin login', !!adminToken)
const teacherToken = await login('sarah@school.edu', 'teacher123')
check('teacher login', !!teacherToken)
const studentToken = await login('student1@school.edu', 'student123')
check('student login', !!studentToken)
const parentToken = await login('parent@school.edu', 'parent123')
check('parent login', !!parentToken)

console.log('\n— Dashboards —')
{
  const a = await req('GET', '/dashboard', { token: adminToken })
  check('admin dashboard', a.status === 200 && a.data.stats?.students >= 15, JSON.stringify(a.data.stats || {}))
  const s = await req('GET', '/dashboard', { token: studentToken })
  check('student dashboard', s.status === 200 && s.data.student)
}

console.log('\n— CRUD —')
{
  const c = await req('POST', '/classes', {
    token: adminToken,
    body: { name: 'Grade 12 - A', gradeLevel: 12, section: 'A', roomNumber: '400' },
  })
  check('create class', c.status === 201 && c.data._id, JSON.stringify(c.data))

  const list = await req('GET', '/students?limit=100', { token: adminToken })
  check('list students', list.status === 200 && list.data.total >= 15)

  const st = await req('POST', '/students', {
    token: adminToken,
    body: { name: 'Test Kid', email: 'testkid@school.edu', admissionNumber: 'ADM-TEST-1', class: c.data._id },
  })
  check('create student', st.status === 201 && st.data._id, JSON.stringify(st.data).slice(0, 120))

  // exam flow
  const subs = await req('GET', '/subjects', { token: adminToken })
  const exam = await req('POST', '/exams', {
    token: adminToken,
    body: { classId: c.data._id, subjectId: subs.data.items[0]._id, name: 'Smoke Exam', date: new Date().toISOString() },
  })
  check('create exam (generates mark sheet)', exam.status === 201, JSON.stringify(exam.data).slice(0, 120))

  if (exam.status === 201) {
    const sid = exam.data.results[0]?.student
    const up = await req('PUT', `/exams/${exam.data._id}/results`, {
      token: adminToken,
      body: { results: [{ student: sid, marks: 88 }] },
    })
    check('enter marks + grade computed', up.status === 200 && up.data.results[0].grade === 'A', JSON.stringify(up.data.results?.[0] || {}))

    const pub = await req('PUT', `/exams/${exam.data._id}/publish`, { token: adminToken, body: { published: true } })
    check('publish exam', pub.status === 200 && pub.data.published === true)
  }
}

console.log('\n— Attendance —')
{
  const classes = await req('GET', '/classes?limit=100', { token: adminToken })
  const cls = classes.data.items[0]
  const roster = await req('GET', `/attendance/roster?classId=${cls._id}&date=2026-09-20`, { token: adminToken })
  check('attendance roster', roster.status === 200 && roster.data.records.length > 0, JSON.stringify(roster.data).slice(0, 120))

  const mark = await req('POST', '/attendance', {
    token: teacherToken,
    body: {
      classId: cls._id,
      date: '2026-09-20',
      records: roster.data.records.map((r) => ({ student: r.student, status: 'present' })),
    },
  })
  check('mark attendance', mark.status === 201)

  const mine = await req('GET', '/attendance/my/summary', { token: studentToken })
  check('student attendance summary', mine.status === 200 && mine.data.summary, JSON.stringify(mine.data).slice(0, 120))
}

console.log('\n— Fees —')
{
  const gen = await req('POST', '/fees/generate', {
    token: adminToken,
    body: { classId: (await req('GET', '/classes?limit=1', { token: adminToken })).data.items[0]._id, title: 'Test Fee', amount: 100, dueDate: '2026-10-01' },
  })
  check('generate invoices', gen.status === 201 && gen.data.created > 0, JSON.stringify(gen.data).slice(0, 120))

  const list = await req('GET', '/fees', { token: adminToken })
  check('list invoices', list.status === 200 && list.data.total > 0)
  const unpaid = list.data.items.find((i) => i.status !== 'paid')
  if (unpaid) {
    const pay = await req('POST', `/fees/${unpaid._id}/pay`, {
      token: adminToken,
      body: { amount: unpaid.amount, method: 'card' },
    })
    check('record payment → paid', pay.status === 200 && pay.data.status === 'paid')
  }
  const stats = await req('GET', '/fees/stats/summary', { token: adminToken })
  check('fee stats', stats.status === 200 && stats.data.totalBilled > 0)
}

console.log('\n— Trips (full flow) —')
{
  const created = await req('POST', '/trips', {
    token: adminToken,
    body: {
      title: 'Smoke Trip',
      destination: 'Testville',
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      capacity: 10,
      costPerStudent: 50,
      gradesAllowed: [9, 10, 11],
    },
  })
  check('admin creates trip', created.status === 201 && created.data._id, JSON.stringify(created.data).slice(0, 120))
  const tripId = created.data._id

  // student registers
  const reg = await req('POST', `/trips/${tripId}/register`, {
    token: studentToken,
    body: { consentSigned: true, notes: 'Vegetarian lunch' },
  })
  check('student registers for trip', reg.status === 201, JSON.stringify(reg.data))

  const dup = await req('POST', `/trips/${tripId}/register`, { token: studentToken, body: { consentSigned: true } })
  check('duplicate registration rejected', dup.status === 409)

  const detail = await req('GET', `/trips/${tripId}`, { token: studentToken })
  check('trip detail includes myRegistration', detail.status === 200 && detail.data.myRegistration, JSON.stringify(detail.data.myRegistration || {}))

  const adminView = await req('GET', `/trips/${tripId}`, { token: adminToken })
  check('admin sees enriched registrations', adminView.status === 200 && adminView.data.registrations[0]?.studentInfo?.name)

  const upd = await req('PUT', `/trips/${tripId}/registrations/${detail.data.myStudentId}`, {
    token: adminToken,
    body: { paymentStatus: 'paid' },
  })
  check('admin marks payment', upd.status === 200)

  const cancel = await req('DELETE', `/trips/${tripId}/register`, { token: studentToken })
  check('student cancels registration', cancel.status === 200)

  const tstats = await req('GET', '/trips/stats/summary', { token: adminToken })
  check('trip stats', tstats.status === 200 && tstats.data.totalTrips >= 3)

  // role guard
  const forbidden = await req('POST', `/trips/${tripId}/register`, { token: adminToken, body: {} })
  check('admin cannot self-register (403)', forbidden.status === 403)
}

console.log('\n— Library / Announcements / Timetable —')
{
  const books = await req('GET', '/library', { token: adminToken })
  check('list books', books.status === 200 && books.data.total >= 3)

  const borrow = await req('POST', `/library/${books.data.items[0]._id}/borrow`, {
    token: adminToken,
    body: {},
  })
  check('borrow book for self', borrow.status === 201, JSON.stringify(borrow.data))

  const loans = await req('GET', '/library/my/loans', { token: studentToken })
  check('my loans', loans.status === 200 && Array.isArray(loans.data))

  const ann = await req('POST', '/announcements', {
    token: adminToken,
    body: { title: 'Smoke Ann', body: 'Test body' },
  })
  check('create announcement', ann.status === 201)

  const tt = await req('GET', '/timetable/my/week', { token: studentToken })
  check('student timetable', tt.status === 200)
}

console.log('\n— Access control —')
{
  const noAuth = await req('GET', '/students')
  check('unauthenticated blocked (401)', noAuth.status === 401)
  const wrongRole = await req('POST', '/students', { token: studentToken, body: {} })
  check('student cannot create student (403)', wrongRole.status === 403)
  const userMgmt = await req('GET', '/users', { token: teacherToken })
  check('teacher cannot list users (403)', userMgmt.status === 403)
}

server.close()
const mongoose = (await import('mongoose')).default
await mongoose.disconnect()
await mongod.stop()

console.log(failures === 0 ? '\n✅ ALL SMOKE TESTS PASSED' : `\n❌ ${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
