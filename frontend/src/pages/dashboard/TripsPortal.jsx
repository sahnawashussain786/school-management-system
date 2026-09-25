import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiDelete } from '../../api/client'
import {
  PageHeader, Card, Button, Textarea, Modal, Badge, Spinner, EmptyState,
  ErrorBanner,
} from '../../components/ui'
import { fmtDate, fmtMoney } from '../../utils/format'
import { statusTone } from '../../utils/constants'

const catTone = { educational: 'blue', adventure: 'amber', cultural: 'purple', sports: 'green', community: 'green', other: 'gray' }
const payTone = { paid: 'green', unpaid: 'red', refunded: 'gray' }

export default function TripsPortal() {
  const { data, loading, error, refetch } = useApi('/trips?limit=50')
  const [detail, setDetail] = useState(null)
  const [consent, setConsent] = useState(false)
  const [notes, setNotes] = useState('')
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('all') // all | registered

  const openDetail = (trip) => {
    setDetail(trip)
    setConsent(false)
    setNotes('')
    setActionError(null)
  }

  const register = async () => {
    if (!consent) {
      setActionError('Please confirm the parental consent checkbox to continue.')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      await apiPost(`/trips/${detail._id}/register`, { consentSigned: true, notes })
      setDetail(null)
      refetch()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (trip) => {
    if (!window.confirm('Cancel this registration?')) return
    try {
      await apiDelete(`/trips/${trip._id}/register`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const trips = (data?.items || []).filter((t) => (tab === 'registered' ? t.myRegistration : true))

  return (
    <div>
      <PageHeader
        title="School Trips"
        subtitle="Browse upcoming trips, sign consent and register your child"
      />

      <div className="mb-6 flex gap-2">
        {[
          ['all', 'All Trips'],
          ['registered', 'My Registrations'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : trips.length === 0 ? (
        <EmptyState
          title={tab === 'registered' ? 'No registrations yet' : 'No trips available'}
          message={tab === 'registered' ? 'Browse all trips and register for one that suits your child.' : 'Check back soon for new trips.'}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => {
            const mine = t.myRegistration
            const spotsLeft = t.capacity - (t.registrations?.length ?? 0)
            return (
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
                  <p className="flex justify-between"><span className="text-slate-500">Spots left</span><span className="font-medium">{Math.max(0, spotsLeft)}</span></p>
                  {mine && (
                    <p className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">My registration</span>
                      <span className="flex gap-1.5">
                        <Badge tone={payTone[mine.paymentStatus] || 'gray'}>{mine.paymentStatus}</Badge>
                        <Badge tone={mine.consentSigned ? 'green' : 'red'}>
                          {mine.consentSigned ? 'consented' : 'no consent'}
                        </Badge>
                      </span>
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => openDetail(t)}>
                    View Details
                  </Button>
                  {!mine && t.status === 'open' && spotsLeft > 0 && (
                    <Button size="sm" className="flex-1" onClick={() => openDetail(t)}>Register</Button>
                  )}
                  {mine && (
                    <Button size="sm" variant="danger" onClick={() => cancel(t)}>Cancel</Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail / register modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title || ''}
        wide
        footer={
          detail && !detail.myRegistration && detail.status === 'open' ? (
            <>
              <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
              <Button onClick={register} disabled={busy || detail.registrations.length >= detail.capacity}>
                {busy ? 'Registering…' : 'Confirm Registration'}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={catTone[detail.category] || 'gray'}>{detail.category}</Badge>
              <Badge tone={statusTone[detail.status] || 'gray'}>{detail.status}</Badge>
            </div>
            <p className="text-slate-600">{detail.description}</p>

            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div><p className="text-xs font-semibold uppercase text-slate-400">Destination</p><p className="text-sm font-medium text-slate-800">{detail.destination}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">Dates</p><p className="text-sm font-medium text-slate-800">{fmtDate(detail.startDate)} – {fmtDate(detail.endDate)}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">Departure</p><p className="text-sm font-medium text-slate-800">{detail.departureTime} · {detail.meetingPoint || 'TBD'}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">Cost per student</p><p className="text-sm font-medium text-slate-800">{detail.costPerStudent > 0 ? fmtMoney(detail.costPerStudent) : 'Free'}</p></div>
            </div>

            {detail.itinerary?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Itinerary</h4>
                <ol className="mt-2 space-y-1.5">
                  {detail.itinerary.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {detail.includes?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">What's included</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {detail.includes.map((x) => <Badge key={x} tone="blue">{x}</Badge>)}
                </div>
              </div>
            )}

            {detail.coordinators?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Teacher coordinators</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {detail.coordinators.map((c) => c.user?.name).filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {!detail.myRegistration && detail.status === 'open' && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                <h4 className="text-sm font-semibold text-brand-900">Register for this trip</h4>
                <label className="mt-3 flex items-start gap-2.5 text-sm text-brand-900">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                  />
                  I confirm the parental/guardian consent for the above student to attend this trip, including
                  transport and activities described, and I have noted any medical conditions below.
                </label>
                <Textarea
                  id="trip-notes"
                  label="Medical / dietary notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-3"
                />
                <ErrorBanner message={actionError} />
              </div>
            )}

            {detail.myRegistration && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                ✓ Registered on {fmtDate(detail.myRegistration.registeredAt)}. Payment status:{' '}
                <strong>{detail.myRegistration.paymentStatus}</strong>. Pay at the school office to
                confirm your place.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
