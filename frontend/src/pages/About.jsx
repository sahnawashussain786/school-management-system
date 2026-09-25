export default function About() {
  const values = [
    ['Curiosity', 'We encourage questions, exploration and independent thinking in every lesson.'],
    ['Integrity', 'Honesty, fairness and responsibility guide how we learn and how we treat each other.'],
    ['Community', 'Students, staff and families work together as one supportive school family.'],
    ['Excellence', 'We set high standards and celebrate effort, progress and achievement alike.'],
  ]

  return (
    <div>
      <section className="bg-navy-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">About Greenwood</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Founded in 1998, Greenwood International School is a co-educational day school serving
            1,200 students from kindergarten through grade 12.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 leading-7 text-slate-600">
              To provide an outstanding education that develops the whole child — academically,
              socially and emotionally — within a safe, inclusive and stimulating environment. We
              believe every student can achieve remarkable things when they are known, challenged and
              supported.
            </p>
            <h2 className="mt-10 text-2xl font-bold text-slate-900">Our Vision</h2>
            <p className="mt-4 leading-7 text-slate-600">
              To be the school of choice in our region, recognised for academic excellence, innovative
              teaching and graduates who lead purposeful lives in a global community.
            </p>
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {values.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-brand-700">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Leadership Team</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Dr. Evelyn Hartman', 'Principal', 'Ph.D. Education Leadership — 22 years in education'],
              ['Mr. Samuel Osei', 'Deputy Principal', 'M.Ed. Curriculum & Instruction'],
              ['Ms. Rita Alvarez', 'Head of Admissions', 'B.A. Communications'],
              ['Mr. Ken Watanabe', 'Head of Student Life', 'M.A. Counselling Psychology'],
            ].map(([n, r, d]) => (
              <div key={n} className="rounded-xl bg-white p-6 text-center shadow-sm">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                  {n.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{n}</h3>
                <p className="text-sm font-medium text-brand-600">{r}</p>
                <p className="mt-2 text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
