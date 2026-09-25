import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Button, Input, Select, Textarea, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Card,
} from '../../components/ui'
import { toast } from 'react-toastify'
import { fmtDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { title: '', body: '', category: 'general', priority: 'normal', audience: 'all' }

export default function Announcements() {
  const { user } = useAuth()
  const canManage = user.role === 'admin' || user.role === 'teacher'

  const { data, loading, error, refetch } = useApi('/announcements?limit=50')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyForm); setFormError(null); setModal({ mode: 'create' }) }
  const openEdit = (a) => {
    setForm({ title: a.title, body: a.body, category: a.category, priority: a.priority, audience: a.audience })
    setFormError(null)
    setModal({ mode: 'edit', item: a })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      if (modal.mode === 'create') await apiPost('/announcements', form)
      else await apiPut(`/announcements/${modal.item._id}`, form)
      setModal(null)
      refetch()
      toast.success('Announcement saved successfully')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await apiDelete(`/announcements/${id}`)
      refetch()
      toast.success('Announcement deleted')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle={canManage ? 'Post updates for the school community' : 'Updates from the school'}
        actions={canManage && <Button onClick={openCreate}>+ New Announcement</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No announcements" message={canManage ? 'Post the first update for your school.' : 'Check back later.'} />
      ) : (
        <div className="space-y-4">
          {(data.items || []).map((a) => (
            <Card key={a._id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={a.priority === 'high' ? 'red' : 'blue'}>{a.category}</Badge>
                  <Badge tone="gray">{a.audience}</Badge>
                  <span className="text-xs text-slate-400">{fmtDate(a.publishedAt)}</span>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(a._id)}>Delete</Button>
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{a.title}</h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-600">{a.body}</p>
              {a.author?.name && <p className="mt-2 text-xs text-slate-400">Posted by {a.author.name}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'New Announcement' : 'Edit Announcement'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Publish'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <Input id="an-title" label="Title" required value={form.title} onChange={set('title')} />
          <Textarea id="an-body" label="Message" required value={form.body} onChange={set('body')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select id="an-cat" label="Category" value={form.category} onChange={set('category')}>
              {['general', 'academic', 'event', 'urgent', 'holiday', 'sports'].map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select id="an-pri" label="Priority" value={form.priority} onChange={set('priority')}>
              {['normal', 'high'].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select id="an-aud" label="Audience" value={form.audience} onChange={set('audience')}>
              {['all', 'teachers', 'students', 'parents'].map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
