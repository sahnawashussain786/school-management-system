import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api/client'
import { fmtDate } from '../utils/format'
import { Badge } from '../components/ui'

export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [trips, setTrips] = useState([])

  useEffect(() => {
    apiGet('/public/announcements').then(setAnnouncements).catch(() => {})
    apiGet('/public/trips').then(setTrips).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(44,127,92,0.5), transparent 40%), radial-gradient(circle at 80% 60%, rgba(44,127,92,0.35), transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 ring-1 ring-white/15">
              Admissions open for the 2026/27 academic year
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Nurturing Minds, <span className="text-brand-300">Building Futures</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Greenwood International School combines academic excellence, pastoral care and a vibrant
              programme of trips and activities to help every student thrive — from their first day to
              graduation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admissions"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
              >
                Apply for Admission
              </Link>
              <Link
                to="/trips"
                className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore School Trips
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ['25+', 'Years of Excellence'],
            ['1,200+', 'Students Enrolled'],
            ['98%', 'Graduation Rate'],
            ['40+', 'Clubs & Societies'],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-bold text-brand-600">{v}</p>
              <p className="mt-1 text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Academic Rigor', 'A broad curriculum, small class sizes and proven results across STEM, humanities and the arts.', '/academics'],
              ['Pastoral Care', 'Dedicated homeroom teachers, counselling and a strong anti-bullying culture keep students safe and happy.', '/about'],
              ['Trips & Activities', 'From museum visits to residential expeditions, learning continues beyond the classroom.', '/trips'],
            ].map(([t, d, to]) => (
              <Link
                key={t}
                to={to}
                className="group rounded-xl border border-slate-200 p-6 transition hover:border-brand-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Academic stages */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">One School, Every Stage</h2>
            <p className="mt-3 text-slate-500">
              A continuous journey from kindergarten through to university preparation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ['Lower School', 'Grades 1–5', 'Play-led discovery builds reading, numeracy and social confidence in small, nurturing classes.', '🌱'],
              ['Middle School', 'Grades 6–8', 'Students rotate through specialist labs and workshops, discovering passions and independence.', '🔭'],
              ['Upper School', 'Grades 9–12', 'Rigorous exam preparation, university guidance and leadership opportunities across the school.', '🎓'],
            ].map(([t, s, d, e]) => (
              <div key={t} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="text-3xl">{e}</span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{t}</h3>
                <p className="text-sm font-medium text-brand-600">{s}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements + trips preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Latest Announcements</h2>
                <Link to="/news" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {announcements.length === 0 && (
                  <p className="text-sm text-slate-500">No announcements right now — check back soon.</p>
                )}
                {announcements.slice(0, 3).map((a) => (
                  <div key={a._id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <Badge tone={a.priority === 'high' ? 'red' : 'blue'}>{a.category}</Badge>
                      <span className="text-xs text-slate-400">{fmtDate(a.publishedAt)}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Upcoming Trips</h2>
                <Link to="/trips" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  All trips →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {trips.length === 0 && (
                  <p className="text-sm text-slate-500">No trips published at the moment.</p>
                )}
                {trips.slice(0, 3).map((t) => (
                  <div key={t._id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <Badge tone="green">{t.category}</Badge>
                      <span className="text-xs text-slate-400">
                        {fmtDate(t.startDate)}
                        {t.endDate && t.endDate !== t.startDate ? ` – ${fmtDate(t.endDate)}` : ''}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">{t.title}</h3>
                    <p className="text-sm text-slate-500">{t.destination}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to join Greenwood?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Book a campus tour, meet our teachers and see the school in action. We look forward to
            welcoming your family.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/admissions"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Start an Application
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
