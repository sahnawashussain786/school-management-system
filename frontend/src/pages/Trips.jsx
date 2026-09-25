import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api/client'
import { fmtDate, fmtMoney } from '../utils/format'
import { Badge, Spinner } from '../components/ui'

const catTone = {
  educational: 'blue',
  adventure: 'amber',
  cultural: 'purple',
  sports: 'green',
  community: 'green',
  other: 'gray',
}

export default function Trips() {
  const [trips, setTrips] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiGet('/public/trips')
      .then(setTrips)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Beyond the Classroom</p>
          <h1 className="mt-2 text-4xl font-bold text-white">School Trips & Expeditions</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Day visits, cultural outings and multi-day residential adventures. Registered families can
            sign up and manage consent and payments directly from the portal.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Could not load live trips ({error}). Showing general programme information below.
            </div>
          )}

          {trips === null && !error && <Spinner />}

          {trips && trips.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between rounded-t-2xl bg-slate-50 px-6 py-4">
                    <Badge tone={catTone[t.category] || 'gray'}>{t.category}</Badge>
                    <Badge tone={t.status === 'open' ? 'green' : 'gray'}>{t.status}</Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
                    <p className="mt-1 text-sm font-medium text-brand-600">{t.destination}</p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{t.description}</p>
                    <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Dates</dt>
                        <dd className="font-medium text-slate-800">
                          {fmtDate(t.startDate)}
                          {t.endDate && t.endDate !== t.startDate ? ` – ${fmtDate(t.endDate)}` : ''}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Cost</dt>
                        <dd className="font-medium text-slate-800">
                          {t.costPerStudent > 0 ? `${fmtMoney(t.costPerStudent)} per student` : 'Free'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Places</dt>
                        <dd className="font-medium text-slate-800">
                          {t.registeredCount}/{t.capacity} taken
                        </dd>
                      </div>
                    </dl>
                    <Link
                      to="/login"
                      className="mt-5 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Register via Portal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {trips && trips.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-500">
              No trips are published at the moment. Please check back soon.
            </div>
          )}

          <div className="mt-14 rounded-2xl bg-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900">How Trip Registration Works</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                ['Browse trips', 'Open the trips section in your family portal to see full itineraries, costs and what is included.'],
                ['Register & consent', 'Select your child, sign the digital consent form and note any medical or dietary needs.'],
                ['Pay & prepare', 'Pay online or at the office, then pack according to the kit list — and enjoy the adventure!'],
              ].map(([t, d]) => (
                <div key={t}>
                  <h3 className="font-semibold text-brand-700">{t}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
