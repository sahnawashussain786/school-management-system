import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Textarea, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Card,
} from '../../components/ui'
import { fmtDate } from '../../utils/format'
import { statusTone } from '../../utils/constants'

export default function MyAssignments() {
  const { data, loading, error, refetch } = useApi('/assignments/my')
  const [submit, setSubmit] = useState(null) // assignment
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  const doSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setActionError(null)
    try {
      await apiPost(`/assignments/${submit._id}/submit`, { content })
      setSubmit(null)
      setContent('')
      refetch()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const items = data || []
  const pending = items.filter((a) => a.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle={items.length ? `${pending} pending of ${items.length} total` : 'Homework and classwork'}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No assignments" message="Nothing assigned to your class yet." />
      ) : (
        <div className="space-y-4">
          {pending > 0 && (
            <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              📌 You have {pending} assignment{pending > 1 ? 's' : ''} waiting to be submitted.
            </Card>
          )}
          <Table headers={['Assignment', 'Subject', 'Due', 'Status', 'Marks', 'Action']}>
            {items.map((a) => (
              <tr key={a._id} className="hover:bg-slate-50">
                <Td>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="max-w-sm truncate text-xs text-slate-400">{a.description}</p>
                </Td>
                <Td>{a.subject}</Td>
                <Td>{fmtDate(a.dueDate)}</Td>
                <Td><Badge tone={statusTone[a.status] || 'gray'}>{a.status}</Badge></Td>
                <Td>{a.marks !== null && a.marks !== undefined ? `${a.marks}/${a.totalMarks}` : '—'}</Td>
                <Td>
                  {a.status === 'pending' || a.status === 'late' ? (
                    <Button size="sm" onClick={() => { setSubmit(a); setActionError(null) }}>Submit</Button>
                  ) : (
                    <span className="text-xs text-slate-400">Submitted ✓</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal
        open={!!submit}
        onClose={() => setSubmit(null)}
        title={`Submit — ${submit?.title || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubmit(null)}>Cancel</Button>
            <Button onClick={doSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Submit Work'}</Button>
          </>
        }
      >
        <form onSubmit={doSubmit} className="space-y-4">
          <ErrorBanner message={actionError} />
          {submit && (
            <p className="text-sm text-slate-500">
              Due {fmtDate(submit.dueDate)} · {submit.totalMarks} marks. Submissions after the due
              date are marked as late automatically.
            </p>
          )}
          <Textarea
            id="sub-content"
            label="Your answer / notes for the teacher"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your response or describe any attached work…"
          />
        </form>
      </Modal>
    </div>
  )
}
