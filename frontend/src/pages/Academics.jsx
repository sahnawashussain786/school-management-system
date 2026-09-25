export default function Academics() {
  const subjects = [
    ['Mathematics', 'From foundational numeracy to calculus and statistics.'],
    ['Sciences', 'Physics, chemistry and biology in fully equipped laboratories.'],
    ['English & Languages', 'Literature, composition and modern foreign languages.'],
    ['Humanities', 'History, geography, civics and global perspectives.'],
    ['Computer Science', 'Programming, robotics and digital literacy from grade 6.'],
    ['The Arts', 'Visual art, music, drama and annual production opportunities.'],
    ['Physical Education', 'Team sports, athletics and healthy-living education.'],
    ['Life Skills', 'Study skills, careers guidance and personal development.'],
  ]

  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Academics</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            A challenging, balanced curriculum designed to stretch every learner and open doors to
            top universities worldwide.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map(([t, d]) => (
              <div
                key={t}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand-300"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{t}</h3>
                  <p className="mt-1 text-sm text-slate-500">{d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 rounded-2xl bg-slate-100 p-8 md:grid-cols-3">
            {[
              ['Assessment & Reporting', 'Continuous assessment, formal exams each term, and detailed progress reports shared with parents via the portal.'],
              ['Learning Support', 'Specialist staff provide individual plans and small-group support for students who need an extra hand.'],
              ['University Guidance', 'One-to-one counselling from grade 10: course selection, applications, essays and interview practice.'],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="font-semibold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
