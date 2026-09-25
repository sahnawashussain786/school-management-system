import { useState } from 'react'
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner, Input, Button } from '../components/ui'

const demoAccounts = [
  ['Admin', 'admin@school.edu', 'admin123'],
  ['Teacher', 'sarah@school.edu', 'teacher123'],
  ['Student', 'student1@school.edu', 'student123'],
  ['Parent', 'parent@school.edu', 'parent123'],
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-navy-900 lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, rgba(220,38,38,0.6), transparent 45%), radial-gradient(circle at 70% 75%, rgba(220,38,38,0.4), transparent 40%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-center px-16">
          <h2 className="text-3xl font-bold leading-tight text-white">
            One portal for your whole
            <br />
            school community.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Attendance, results, fees, assignments, trips and more — everything for students,
            parents, teachers and administrators in one place.
          </p>
          <div className="mt-10 space-y-3">
            {['Role-based dashboards', 'Trips registration & consent', 'Fees tracking & receipts'].map((f) => (
              <p key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <svg className="h-5 w-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {f}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 py-16 lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to the Portal</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use your school account. Demo logins are listed below the form.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <ErrorBanner message={error} />
            <Input
              id="email"
              label="Email address"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demo accounts</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {demoAccounts.map(([label, e, p]) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setEmail(e)
                    setPassword(p)
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs transition hover:border-brand-300 hover:shadow-sm"
                >
                  <span className="block font-semibold text-slate-700">{label}</span>
                  <span className="block truncate text-slate-400">{e}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
              ← Back to school website
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
