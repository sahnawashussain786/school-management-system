import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost, apiPut } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Select, Modal, Badge, Spinner,
  EmptyState, ErrorBanner,
} from '../../components/ui'
import { fmtDate } from '../../utils/format'

const emptyExam = { name: '', examType: 'mid-term', classId: '', subjectId: '', date: '', totalMarks: 100, passingMarks: 40 }

export default function Exams() {
  const { data, loading, error, refetch } = useApi('/exams?limit=50')
  const { data: classes } = useApi('/classes?limit=100')
  const { data: subjects } = useApi('/subjects?limit=100')

  const [modal, setModal] = useState(null) // { mode:'create' } | { mode:'marks', exam }
  const [form, setForm] = useState(emptyExam)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [marksExam, setMarksExam] = useState(null)
  const [marksRows, setMarksRows] = useState([])
  const [marksError, setMarksError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyExam); setFormError(null); setModal({ mode: 'create' }) }

  const saveExam = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      await apiPost('/exams', {
        ...form,
        classId: form.classId,
        subjectId: form.subjectId,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
      })
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const openMarks = async (exam) => {
    setMarksError(null)
    try {
      const full = await apiGet(`/exams/${exam._id}`)
      setMarksRows(full.results.map((r) => ({ ...r, marks: r.marks ?? 0 })))
      setMarksExam(full)
    } catch (e) {
      setMarksError(e.message)
    }
  }

  const saveMarks = async () => {
    setBusy(true)
    setMarksError(null)
    try {
      await apiPut(`/exams/${marksExam._id}/results`, {
        results: marksRows.map((r) => ({ student: r.student._id || r.student, marks: Number(r.marks) || 0 })),
      })
      setMarksExam(null)
      refetch()
    } catch (e) {
      setMarksError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (exam) => {
    try {
      await apiPut(`/exams/${exam._id}/publish`, { published: !exam.published })
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Exams & Results"
        subtitle="Schedule exams, enter marks and publish results"
        actions={<Button onClick={openCreate}>+ Schedule Exam</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No exams scheduled" message="Create your first exam to begin recording marks." />
      ) : (
        <Table headers={['Exam', 'Class', 'Subject', 'Date', 'Total', 'Status', 'Actions']}>
          {(data.items || []).map((e) => (
            <tr key={e._id} className="hover:bg-slate-50">
              <Td>
                <p className="font-medium text-slate-800">{e.name}</p>
                <p className="text-xs capitalize text-slate-400">{e.examType}</p>
              </Td>
              <Td>{e.class?.name || '—'}</Td>
              <Td>{e.subject?.name || '—'}</Td>
              <Td>{fmtDate(e.date)}</Td>
              <Td>{e.totalMarks}</Td>
              <Td><Badge tone={e.published ? 'green' : 'amber'}>{e.published ? 'published' : 'draft'}</Badge></Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openMarks(e)}>Marks</Button>
                  <Button size="sm" variant={e.published ? 'secondary' : 'primary'} onClick={() => togglePublish(e)}>
                    {e.published ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create modal */}
      <Modal
        open={modal?.mode === 'create'}
        onClose={() => setModal(null)}
        title="Schedule Exam"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={saveExam} disabled={busy}>{busy ? 'Saving…' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={saveExam} className="space-y-4">
          <ErrorBanner message={formError} />
          <Input id="e-name" label="Exam name" required value={form.name} onChange={set('name')} placeholder="Mid-Term Mathematics" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="e-type" label="Type" value={form.examType} onChange={set('examType')}>
              {['quiz', 'unit-test', 'mid-term', 'final', 'practical', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input id="e-date" label="Date" type="date" required value={form.date} onChange={set('date')} />
            <Select id="e-class" label="Class" required value={form.classId} onChange={set('classId')}>
              <option value="">Select…</option>
              {(classes?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
            <Select id="e-subject" label="Subject" required value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Select…</option>
              {(subjects?.items || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
            <Input id="e-total" label="Total marks" type="number" value={form.totalMarks} onChange={set('totalMarks')} />
            <Input id="e-pass" label="Passing marks" type="number" value={form.passingMarks} onChange={set('passingMarks')} />
          </div>
          <p className="text-xs text-slate-400">A mark sheet is generated automatically for all active students in the class.</p>
        </form>
      </Modal>

      {/* Marks modal */}
      <Modal
        open={!!marksExam}
        onClose={() => setMarksExam(null)}
        title={`Enter marks — ${marksExam?.name || ''}`}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarksExam(null)}>Cancel</Button>
            <Button onClick={saveMarks} disabled={busy}>{busy ? 'Saving…' : 'Save Marks'}</Button>
          </>
        }
      >
        <ErrorBanner message={marksError} />
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {marksRows.map((r, i) => (
            <div key={r.student?._id || i} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2.5">
              <span className="flex-1 text-sm text-slate-700">
                {r.studentName || r.student?.admissionNumber || 'Student'}
                {r.student?.admissionNumber && (
                  <span className="ml-2 text-xs text-slate-400">{r.student.admissionNumber}</span>
                )}
              </span>
              <span className={`w-10 text-center text-sm font-semibold ${r.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}`}>
                {r.grade || '—'}
              </span>
              <input
                type="number"
                min="0"
                max={marksExam?.totalMarks}
                value={r.marks ?? 0}
                onChange={(e) => {
                  const v = e.target.value
                  setMarksRows((rows) => rows.map((x, j) => (j === i ? { ...x, marks: v } : x)))
                }}
                className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          ))}
          {marksRows.length === 0 && <p className="text-sm text-slate-400">No students enrolled in this exam.</p>}
        </div>
      </Modal>
    </div>
  )
}
