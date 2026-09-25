import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Button, Input, Select, Textarea, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Card,
} from '../../components/ui'
import { toast } from 'react-toastify'
import { fmtDate } from '../../utils/format'

const emptyForm = { title: '', description: '', category: 'academic', startDate: '', endDate: '', location: '', isPublic: true }

export default function Events() {
  const { data, loading, error, refetch } = useApi('/events?limit=50')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyForm); setFormError(null); setModal({ mode: 'create' }) }
  const openEdit = (ev) => {
    setForm({
      title: ev.title,
      description: ev.description || '',
      category: ev.category,
      startDate: ev.startDate?.slice(0, 16) || '',
      endDate: ev.endDate?.slice(0, 16) || '',
      location: ev.location || '',
      isPublic: ev.isPublic,
    })
    setFormError(null)
    setModal({ mode: 'edit', item: ev })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      if (modal.mode === 'create') await apiPost('/events', form)
      else await apiPut(`/events/${modal.item._id}`, form)
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await apiDelete(`/events/${id}`)
      refetch()
      toast.success('Event deleted')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="School calendar of activities"
        actions={<Button onClick={openCreate}>+ New Event</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No events" message="Add the first event to the calendar." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data.items || []).map((ev) => (
            <Card key={ev._id} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <span className="text-[10px] font-semibold uppercase">
                    {new Date(ev.startDate).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold leading-none">{new Date(ev.startDate).getDate()}</span>
                </div>
                <Badge tone="purple">{ev.category}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{ev.title}</h3>
              {ev.location && <p className="text-xs text-brand-600">📍 {ev.location}</p>}
              <p className="mt-1.5 flex-1 text-sm text-slate-500">{ev.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                {fmtDate(ev.startDate)}{ev.endDate && ev.endDate !== ev.startDate ? ` – ${fmtDate(ev.endDate)}` : ''}
              </p>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <Button size="sm" variant="secondary" onClick={() => openEdit(ev)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => remove(ev._id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'New Event' : 'Edit Event'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <Input id="ev-title" label="Title" required value={form.title} onChange={set('title')} />
          <Textarea id="ev-desc" label="Description" value={form.description} onChange={set('description')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="ev-cat" label="Category" value={form.category} onChange={set('category')}>
              {['academic', 'sports', 'cultural', 'holiday', 'meeting', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input id="ev-loc" label="Location" value={form.location} onChange={set('location')} />
            <Input id="ev-start" label="Starts" type="datetime-local" required value={form.startDate} onChange={set('startDate')} />
            <Input id="ev-end" label="Ends" type="datetime-local" value={form.endDate} onChange={set('endDate')} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
