import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Card, Button, Input, Select, Textarea, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, statusTone, StatCard,
} from '../../components/ui'
import { fmtDate, fmtMoney, toInputDate } from '../../utils/format'

const catTone = { educational: 'blue', adventure: 'amber', cultural: 'purple', sports: 'green', community: 'green', other: 'gray' }
const payTone = { paid: 'green', unpaid: 'red', refunded: 'gray' }

const emptyTrip = {
  title: '', destination: '', description: '', category: 'educational',
  startDate: '', endDate: '', departureTime: '08:00', meetingPoint: '',
  costPerStudent: 0, includes: '', capacity: 40, gradesAllowed: '', coordinators: '',
}

export default function TripsAdmin() {
  const { data, loading, error, refetch } = useApi('/trips?limit=50')
  const { data: teachersData } = useApi('/teachers?limit=100')
  const { data: stats } = useApi('/trips/stats/summary')

  const [modal, setModal] = useState(null) // {mode:'create'} | {mode:'edit', item}
  const [form, setForm] = useState(emptyTrip)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [view, setView] = useState(null) // trip detail with registrations
  const [viewError, setViewError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyTrip); setFormError(null); setModal({ mode: 'create' }) }

  const openEdit = (t) => {
    setForm({
      title: t.title,
      destination: t.destination,
      description: t.description || '',
      category: t.category,
      startDate: t.startDate?.slice(0, 10) || '',
      endDate: t.endDate?.slice(0, 10) || '',
      departureTime: t.departureTime || '08:00',
      meetingPoint: t.meetingPoint || '',
      costPerStudent: t.costPerStudent,
      includes: (t.includes || []).join(', '),
      capacity: t.capacity,
      gradesAllowed: (t.gradesAllowed || []).join(', '),
      coordinators: (t.coordinators || []).map((c) => c._id || c).join(','),
    })
    setFormError(null)
    setModal({ mode: 'edit', item: t })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    const payload = {
      ...form,
      costPerStudent: Number(form.costPerStudent),
      capacity: Number(form.capacity),
      includes: form.includes.split(',').map((s) => s.trim()).filter(Boolean),
      gradesAllowed: form.gradesAllowed.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n) && n > 0),
      coordinators: form.coordinators ? form.coordinators.split(',').filter(Boolean) : [],
    }
    try {
      if (modal.mode === 'create') await apiPost('/trips', payload)
      else await apiPut(`/trips/${modal.item._id}`, payload)
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this trip? Registrations will be lost.')) return
    try {
      await apiDelete(`/trips/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const setStatus = async (trip, status) => {
    try {
      await apiPut(`/trips/${trip._id}`, { status })
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const openView = async (t) => {
    setViewError(null)
    try {
      setView(await apiGet(`/trips/${t._id}`))
    } catch (e) {
      setViewError(e.message)
    }
  }

  const updateReg = async (tripId, studentId, body) => {
    try {
      await apiPut(`/trips/${tripId}/registrations/${studentId}`, body)
      setView(await apiGet(`/trips/${tripId}`))
    } catch (e) {
      alert(e.message)
    }
  }

  const removeReg = async (tripId, studentId) => {
    if (!window.confirm('Remove this student from the trip?')) return
    try {
      await apiDelete(`/trips/${tripId}/registrations/${studentId}`)
      setView(await apiGet(`/trips/${tripId}`))
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="School Trips"
        subtitle="Plan trips and manage registrations, consent and payments"
        actions={<Button onClick={openCreate}>+ Plan New Trip</Button>}
      />

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Trips" value={stats.totalTrips} />
          <StatCard label="Upcoming" value={stats.upcoming} tone="blue" />
          <StatCard label="Registrations" value={stats.totalRegistrations} tone="purple" />
          <StatCard label="Collected (trips)" value={fmtMoney(stats.revenuePotential)} tone="amber" />
        </div>
      )}

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No trips planned" message="Create the first school trip to get started." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(data.items || []).map((t) => (
            <Card key={t._id} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <Badge tone={catTone[t.category] || 'gray'}>{t.category}</Badge>
                <Badge tone={statusTone[t.status] || 'gray'}>{t.status}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{t.title}</h3>
              <p className="text-sm text-brand-600">{t.destination}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{t.description}</p>
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                <p className="flex justify-between"><span className="text-slate-500">Dates</span><span className="font-medium">{fmtDate(t.startDate)}{t.endDate !== t.startDate ? ` – ${fmtDate(t.endDate)}` : ''}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Cost</span><span className="font-medium">{t.costPerStudent > 0 ? fmtMoney(t.costPerStudent) : 'Free'}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Registered</span><span className="font-medium">{t.registrations?.length ?? 0}/{t.capacity}</span></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <Button size="sm" variant="secondary" onClick={() => openView(t)}>Registrations</Button>
                <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>Edit</Button>
                {t.status === 'draft' && <Button size="sm" onClick={() => setStatus(t, 'open')}>Open</Button>}
                {t.status === 'open' && <Button size="sm" variant="secondary" onClick={() => setStatus(t, 'closed')}>Close</Button>}
                <Button size="sm" variant="danger" onClick={() => remove(t._id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Plan New Trip' : 'Edit Trip'}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Trip'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="t-title" label="Trip title" required value={form.title} onChange={set('title')} />
            <Input id="t-dest" label="Destination" required value={form.destination} onChange={set('destination')} />
            <Select id="t-cat" label="Category" value={form.category} onChange={set('category')}>
              {['educational', 'adventure', 'cultural', 'sports', 'community', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input id="t-cost" label="Cost per student ($)" type="number" min="0" value={form.costPerStudent} onChange={set('costPerStudent')} />
            <Input id="t-start" label="Start date" type="date" required value={form.startDate} onChange={set('startDate')} />
            <Input id="t-end" label="End date" type="date" required value={form.endDate} onChange={set('endDate')} />
            <Input id="t-dep" label="Departure time" type="time" value={form.departureTime} onChange={set('departureTime')} />
            <Input id="t-meet" label="Meeting point" value={form.meetingPoint} onChange={set('meetingPoint')} />
            <Input id="t-cap" label="Capacity" type="number" min="1" value={form.capacity} onChange={set('capacity')} />
            <Input id="t-grades" label="Grades allowed (e.g. 9, 10, 11)" value={form.gradesAllowed} onChange={set('gradesAllowed')} placeholder="Leave empty for all grades" />
          </div>
          <Input
            id="t-coord"
            label="Coordinating teachers"
            value={(() => {
              const ids = form.coordinators.split(',').filter(Boolean)
              if (!ids.length) return ''
              const names = ids.map((id) => {
                const t = (teachersData?.items || []).find((x) => x._id === id)
                return t ? t.user?.name : id
              })
              return names.join(', ')
            })()}
            onFocus={() => {}}
            readOnly
            placeholder="Select below"
          />
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Select coordinators</p>
            <div className="flex flex-wrap gap-2">
              {(teachersData?.items || []).map((t) => {
                const selected = form.coordinators.split(',').includes(t._id)
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => {
                      const ids = form.coordinators.split(',').filter(Boolean)
                      const next = selected ? ids.filter((i) => i !== t._id) : [...ids, t._id]
                      setForm({ ...form, coordinators: next.join(',') })
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.user?.name}
                  </button>
                )
              })}
            </div>
          </div>
          <Textarea id="t-desc" label="Description" value={form.description} onChange={set('description')} />
          <Textarea id="t-includes" label="What's included (comma separated)" value={form.includes} onChange={set('includes')} placeholder="Coach travel, Entry tickets, Lunch" />
        </form>
      </Modal>

      {/* Registrations modal */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={`Registrations — ${view?.title || ''}`}
        wide
      >
        <ErrorBanner message={viewError} />
        {view && (
          <>
            <div className="mb-4 flex flex-wrap gap-4 rounded-lg bg-slate-50 p-4 text-sm">
              <span><strong>{view.registrations.length}</strong> registered</span>
              <span><strong>{view.capacity - view.registrations.length}</strong> places left</span>
              <span className="ml-auto">{fmtDate(view.startDate)} · {view.departureTime} · {view.meetingPoint}</span>
            </div>
            <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {view.registrations.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No registrations yet.</p>
              )}
              {view.registrations.map((r) => (
                <div key={r.student} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-800">{r.studentInfo?.name || 'Student'}</p>
                    <p className="text-xs text-slate-400">
                      {r.studentInfo?.admissionNumber} · {r.studentInfo?.class || '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={payTone[r.paymentStatus]}>{r.paymentStatus}</Badge>
                    <Badge tone={r.consentSigned ? 'green' : 'red'}>
                      {r.consentSigned ? 'consent signed' : 'no consent'}
                    </Badge>
                    <Select
                      value={r.paymentStatus}
                      onChange={(e) => updateReg(view._id, r.student, { paymentStatus: e.target.value })}
                      className="w-28"
                    >
                      {['unpaid', 'paid', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    {!r.consentSigned && (
                      <Button size="sm" variant="secondary" onClick={() => updateReg(view._id, r.student, { consentSigned: true })}>
                        Mark consent
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => removeReg(view._id, r.student)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
