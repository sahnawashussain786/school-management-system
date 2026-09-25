import { Link } from 'react-router-dom'

const steps = [
  ['1', 'Enquiry & Campus Tour', 'Submit an enquiry or join one of our weekly tours to see the school in action.'],
  ['2', 'Application', 'Complete the online application form and upload reports from the previous two years.'],
  ['3', 'Assessment', 'Applicants complete a friendly age-appropriate assessment in literacy and numeracy.'],
  ['4', 'Family Interview', 'A short meeting with the principal or year-head so we can get to know your child.'],
  ['5', 'Offer & Enrolment', 'Successful families receive an offer with an enrolment pack and start date.'],
]

const faqs = [
  ['What are the school hours?', 'The school day runs 8:00 AM – 3:30 PM, with optional after-school clubs until 5:00 PM.'],
  ['Do you offer transport?', 'Yes — bus routes cover the greater Springfield area. Routes and fees are shared with the enrolment pack.'],
  ['What are the class sizes?', 'Capped at 24 students in lower school and 28 in upper school, with homeroom teachers for every section.'],
  ['Is there a waiting list?', 'Popular year groups may have a short waiting list; we always inform families of their status within two weeks.'],
]

export default function Admissions() {
  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Admissions</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Places are still available for the 2026/27 academic year in most year groups. We accept
            applications all year round.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">How to Apply</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-5">
            {steps.map(([n, t, d]) => (
              <div key={n} className="relative rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {n}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold text-slate-900">What You'll Need</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  'Birth certificate or passport copy',
                  'Reports from the previous two school years',
                  'Two passport-sized photographs',
                  'Immunisation record',
                  'Proof of address (utility bill or lease)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="mt-0.5 h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Request Application Form
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
              <div className="mt-4 space-y-3">
                {faqs.map(([q, a]) => (
                  <details key={q} className="group rounded-xl border border-slate-200 bg-white p-5">
                    <summary className="cursor-pointer list-none font-medium text-slate-800 marker:hidden">
                      <span className="flex items-center justify-between">
                        {q}
                        <span className="text-brand-600 transition group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
