import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Select, Textarea, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, statusTone,
} from '../../components/ui'
import { fmtDate } from '../../utils/format'

const emptyForm = { title: '', description: '', classId: '', subjectId: '', dueDate: '', totalMarks: 100 }

export default function Assignments() {
  const { data, loading, error, refetch } = useApi('/assignments?limit=50')
  const { data: classes } = useApi('/classes?limit=100')
  const { data: subjects } = useApi('/subjects?limit=100')

  const [modal, setModal] = useState(null) // {mode:'create'} | {mode:'view', assignment}
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState(null) // assignment with submissions
  const [grades, setGrades] = useState({})

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyForm); setFormError(null); setModal({ mode: 'create' }) }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      await apiPost('/assignments', {
        ...form,
        classId: form.classId,
        subjectId: form.subjectId,
        totalMarks: Number(form.totalMarks),
      })
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const openView = async (a) => {
    try {
      const full = await apiGet(`/assignments/${a._id}`)
      setView(full)
      setGrades({})
    } catch (e) {
      alert(e.message)
    }
  }

  const grade = async (assignmentId, studentId) => {
    const marks = grades[studentId]
    if (marks === undefined || marks === '') return alert('Enter marks first')
    try {
      await apiPut(`/assignments/${assignmentId}/grade`, { studentId, marks: Number(marks) })
      openView({ _id: assignmentId })
    } catch (e) {
      alert(e.message)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try {
      await apiDelete(`/assignments/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Set homework and track submissions"
        actions={<Button onClick={openCreate}>+ New Assignment</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No assignments yet" message="Create the first assignment for a class." />
      ) : (
        <Table headers={['Title', 'Class', 'Subject', 'Due', 'Submissions', 'Actions']}>
          {(data.items || []).map((a) => (
            <tr key={a._id} className="hover:bg-slate-50">
              <Td>
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="max-w-xs truncate text-xs text-slate-400">{a.description}</p>
              </Td>
              <Td>{a.class?.name || '—'}</Td>
              <Td>{a.subject?.name || '—'}</Td>
              <Td>{fmtDate(a.dueDate)}</Td>
              <Td><Badge tone="blue">{a.submissions?.length ?? 0}</Badge></Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openView(a)}>Submissions</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(a._id)}>Delete</Button>
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
        title="New Assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <Input id="a-title" label="Title" required value={form.title} onChange={set('title')} />
          <Textarea id="a-desc" label="Description" value={form.description} onChange={set('description')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="a-class" label="Class" required value={form.classId} onChange={set('classId')}>
              <option value="">Select…</option>
              {(classes?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
            <Select id="a-subject" label="Subject" required value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Select…</option>
              {(subjects?.items || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
            <Input id="a-due" label="Due date" type="datetime-local" required value={form.dueDate} onChange={set('dueDate')} />
            <Input id="a-marks" label="Total marks" type="number" value={form.totalMarks} onChange={set('totalMarks')} />
          </div>
        </form>
      </Modal>

      {/* Submissions modal */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={`Submissions — ${view?.title || ''}`}
        wide
      >
        <div className="space-y-3">
          {(view?.submissions || []).length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No submissions yet.</p>
          )}
          {(view?.submissions || []).map((s) => (
            <div key={s.student?._id || s.student} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{s.studentName || 'Student'}</p>
                  <p className="text-xs text-slate-400">
                    Submitted {s.submittedAt ? fmtDate(s.submittedAt) : '—'} · {s.content || 'No notes'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone[s.status] || 'gray'}>{s.status}</Badge>
                  {s.status === 'graded' ? (
                    <span className="text-sm font-semibold text-emerald-600">{s.marks}/{view.totalMarks}</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Marks"
                        value={grades[s.student?._id || s.student] ?? ''}
                        onChange={(e) => setGrades((g) => ({ ...g, [s.student?._id || s.student]: e.target.value }))}
                        className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                      />
                      <Button size="sm" onClick={() => grade(view._id, s.student?._id || s.student)}>Grade</Button>
                    </div>
                  )}
                </div>
              </div>
              {s.feedback && <p className="mt-2 text-xs italic text-slate-500">Feedback: {s.feedback}</p>}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
