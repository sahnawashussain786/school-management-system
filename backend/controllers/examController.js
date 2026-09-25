import Exam from '../models/Exam.js'
import Student from '../models/Student.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

const computeGrade = (marks, total, passing) => {
  const pct = total ? (marks / total) * 100 : 0
  if (marks < passing) return 'F'
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

// @desc   List exams
// @route  GET /api/exams?class=...&subject=...
export const getExams = async (req, res) => {
  const filter = buildFilter(req.query, ['name'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    Exam.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort || '-date')
      .populate('class', 'name')
      .populate('subject', 'name code'),
    Exam.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Get exam with results
// @route  GET /api/exams/:id
export const getExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('class', 'name')
    .populate('subject', 'name code')
    .populate('results.student', 'admissionNumber rollNumber')
  if (!exam) return res.status(404).json({ message: 'Exam not found' })

  // attach student names
  const doc = exam.toObject()
  const roster = await Student.find({
    _id: { $in: doc.results.map((r) => r.student).filter(Boolean) },
  }).populate('user', 'name')
  const nameMap = new Map(roster.map((s) => [String(s._id), s.user?.name || '']))

  doc.results = doc.results.map((r) => ({
    ...r,
    studentName: nameMap.get(String(r.student?._id || r.student)) || 'Deleted student',
  }))
  res.json(doc)
}

// @desc   Create exam
// @route  POST /api/exams
export const createExam = async (req, res) => {
  const { classId, subjectId, name, examType, date, totalMarks, passingMarks } = req.body
  if (!classId || !subjectId || !name || !date) {
    return res.status(400).json({ message: 'classId, subjectId, name and date are required' })
  }

  const students = await Student.find({ class: classId, status: 'active' })
  const exam = await Exam.create({
    name,
    examType,
    class: classId,
    subject: subjectId,
    date,
    totalMarks: totalMarks || 100,
    passingMarks: passingMarks ?? 40,
    results: students.map((s) => ({ student: s._id, marks: 0, grade: '' })),
  })
  res.status(201).json(exam)
}

// @desc   Enter/update marks in bulk
// @route  PUT /api/exams/:id/results
export const updateResults = async (req, res) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Exam not found' })

  const { results } = req.body
  if (!Array.isArray(results)) {
    return res.status(400).json({ message: 'results array is required' })
  }

  for (const incoming of results) {
    const existing = exam.results.find(
      (r) => String(r.student) === String(incoming.student),
    )
    if (existing) {
      existing.marks = incoming.marks ?? existing.marks
      existing.remark = incoming.remark ?? existing.remark
      existing.grade = computeGrade(existing.marks, exam.totalMarks, exam.passingMarks)
    }
  }

  await exam.save()
  const populated = await Exam.findById(exam._id).populate('results.student', 'admissionNumber')
  res.json(populated)
}

// @desc   Publish / unpublish results to students & parents
// @route  PUT /api/exams/:id/publish
export const publishExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Exam not found' })
  exam.published = req.body.published !== false
  await exam.save()
  res.json({ published: exam.published })
}

// @desc   Results of the logged-in student
// @route  GET /api/exams/my/results
export const getMyResults = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
  if (!student) return res.status(404).json({ message: 'Student profile not found' })

  const exams = await Exam.find({
    class: student.class,
    published: true,
    'results.student': student._id,
  })
    .populate('subject', 'name code')
    .sort('-date')

  const results = exams.map((e) => {
    const r = e.results.find((x) => String(x.student) === String(student._id))
    return {
      examId: e._id,
      examName: e.name,
      examType: e.examType,
      subject: e.subject?.name || '',
      date: e.date,
      totalMarks: e.totalMarks,
      marks: r?.marks ?? 0,
      grade: r?.grade || '',
      remark: r?.remark || '',
    }
  })

  res.json(results)
}
