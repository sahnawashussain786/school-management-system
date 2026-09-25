import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Questions about admissions, transport or anything else? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="space-y-6">
              {[
                ['Visit', '45 Meadowbrook Avenue\nSpringfield, CA 90210', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
                ['Call', '+1 (555) 234-8890\nMon–Fri, 8 AM – 4 PM', 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'],
                ['Email', 'office@greenwoodschool.edu\nadmissions@greenwoodschool.edu', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
              ].map(([t, lines, d]) => (
                <div key={t} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{t}</h3>
                    {lines.split('\n').map((l) => (
                      <p key={l} className="text-sm text-slate-500">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {sent ? (
              <div className="py-12 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Message sent!</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Thank you for reaching out. Our office will reply within one working day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Send a Message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  defaultValue="Admissions enquiry"
                >
                  {['Admissions enquiry', 'Fees & payments', 'Transport', 'Academics', 'Other'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Send Message
                </button>
                <p className="text-center text-xs text-slate-400">
                  This demo form does not send email — in production it would reach the school office.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
