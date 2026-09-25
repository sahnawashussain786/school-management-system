import Assignment from '../models/Assignment.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List assignments (filter by class, subject)
// @route  GET /api/assignments?class=...&subject=...
export const getAssignments = async (req, res) => {
  const filter = buildFilter(req.query, ['title'])
  const { page, limit, skip, sort } = getPagination(req.query)

  const [items, total] = await Promise.all([
    Assignment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort || '-assignedDate')
      .populate('class', 'name')
      .populate('subject', 'name code')
      .populate('teacher', 'employeeId'),
    Assignment.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Get one assignment with submissions
// @route  GET /api/assignments/:id
export const getAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('class', 'name')
    .populate('subject', 'name code')
    .populate('submissions.student', 'admissionNumber')
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

  const doc = assignment.toObject()
  const studentIds = doc.submissions.map((s) => s.student?._id || s.student).filter(Boolean)
  const roster = await Student.find({ _id: { $in: studentIds } }).populate('user', 'name')
  const nameMap = new Map(roster.map((s) => [String(s._id), s.user?.name || '']))
  doc.submissions = doc.submissions.map((s) => ({
    ...s,
    studentName: nameMap.get(String(s.student?._id || s.student)) || 'Deleted student',
  }))
  res.json(doc)
}

// @desc   Create assignment for a class
// @route  POST /api/assignments
export const createAssignment = async (req, res) => {
  const { classId, subjectId, title, description, dueDate, totalMarks } = req.body
  if (!classId || !subjectId || !title || !dueDate) {
    return res.status(400).json({ message: 'classId, subjectId, title and dueDate are required' })
  }

  const teacher = await Teacher.findOne({ user: req.user._id })
  const assignment = await Assignment.create({
    title,
    description,
    class: classId,
    subject: subjectId,
    teacher: teacher?._id,
    dueDate,
    totalMarks: totalMarks || 100,
    submissions: [],
  })
  res.status(201).json(assignment)
}

// @desc   Update assignment
// @route  PUT /api/assignments/:id
export const updateAssignment = async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
  res.json(assignment)
}

// @desc   Delete assignment
// @route  DELETE /api/assignments/:id
export const deleteAssignment = async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id)
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
  res.json({ message: 'Assignment deleted' })
}

// @desc   Student submits work for an assignment
// @route  POST /api/assignments/:id/submit
export const submitAssignment = async (req, res) => {
  const { content, fileUrl } = req.body
  const assignment = await Assignment.findById(req.params.id)
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

  const student = await Student.findOne({ user: req.user._id })
  if (!student) return res.status(403).json({ message: 'Only students can submit' })

  const late = new Date() > new Date(assignment.dueDate)
  const existing = assignment.submissions.find(
    (s) => String(s.student) === String(student._id),
  )

  if (existing) {
    existing.content = content ?? existing.content
    existing.fileUrl = fileUrl ?? existing.fileUrl
    existing.submittedAt = new Date()
    existing.status = late ? 'late' : 'submitted'
  } else {
    assignment.submissions.push({
      student: student._id,
      content: content || '',
      fileUrl: fileUrl || '',
      status: late ? 'late' : 'submitted',
    })
  }
  await assignment.save()
  res.json({ message: 'Submission saved', late })
}

// @desc   Grade a submission
// @route  PUT /api/assignments/:id/grade
export const gradeSubmission = async (req, res) => {
  const { studentId, marks, feedback } = req.body
  const assignment = await Assignment.findById(req.params.id)
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

  const sub = assignment.submissions.find((s) => String(s.student) === String(studentId))
  if (!sub) return res.status(404).json({ message: 'Submission not found' })

  sub.marks = marks
  sub.feedback = feedback || ''
  sub.status = 'graded'
  await assignment.save()
  res.json(assignment)
}

// @desc   Assignments + submission status for the logged-in student
// @route  GET /api/assignments/my
export const getMyAssignments = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id })
  if (!student) return res.json([])

  const assignments = await Assignment.find({ class: student.class })
    .populate('subject', 'name code')
    .sort('-assignedDate')

  const list = assignments.map((a) => {
    const sub = a.submissions.find((s) => String(s.student) === String(student._id))
    return {
      _id: a._id,
      title: a.title,
      description: a.description,
      subject: a.subject?.name || '',
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      status: sub?.status || 'pending',
      submittedAt: sub?.submittedAt || null,
      marks: sub?.marks ?? null,
      feedback: sub?.feedback || '',
    }
  })
  res.json(list)
}
