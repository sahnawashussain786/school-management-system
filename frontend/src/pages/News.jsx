import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'
import { fmtDate } from '../utils/format'
import { Badge, Spinner } from '../components/ui'

export default function News() {
  const [announcements, setAnnouncements] = useState(null)
  const [events, setEvents] = useState(null)

  useEffect(() => {
    apiGet('/public/announcements').then(setAnnouncements).catch(() => setAnnouncements([]))
    apiGet('/public/events').then(setEvents).catch(() => setEvents([]))
  }, [])

  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">News & Events</h1>
          <p className="mt-4 text-lg text-slate-300">The latest from around the Greenwood campus.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
          {announcements === null && <Spinner />}
          {Array.isArray(announcements) && announcements.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">No announcements right now.</p>
          )}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {(announcements || []).map((a) => (
              <article key={a._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Badge tone={a.priority === 'high' ? 'red' : 'blue'}>{a.category}</Badge>
                  <span className="text-xs text-slate-400">{fmtDate(a.publishedAt)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{a.body}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-bold text-slate-900">Upcoming Events</h2>
          {events === null && <Spinner />}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {(events || []).map((e) => (
              <div key={e._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <span className="text-xs font-semibold uppercase">{new Date(e.startDate).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-xl font-bold leading-none">{new Date(e.startDate).getDate()}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{e.title}</h3>
                {e.location && <p className="text-sm text-brand-600">{e.location}</p>}
                <p className="mt-2 text-sm text-slate-500">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
