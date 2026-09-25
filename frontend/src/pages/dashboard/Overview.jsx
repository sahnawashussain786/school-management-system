import { Link } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Card, StatCard, Badge, Spinner, EmptyState } from '../../components/ui'
import { fmtDate, fmtMoney } from '../../utils/format'

const Greeting = () => {
  const h = new Date().getHours()
  const name = useAuth().user?.name?.split(' ')[0]
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return <span>{`${part}, ${name}`}</span>
}

const AdminStats = ({ stats }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Active Students"
      value={stats.students}
      icon={<IconD d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />}
    />
    <StatCard
      label="Teachers"
      value={stats.teachers}
      tone="blue"
      icon={<IconD d="M12 14l9-5-9-5-9 5 9 5z" />}
    />
    <StatCard
      label="Classes"
      value={stats.classes}
      tone="purple"
      icon={<IconD d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247" />}
    />
    <StatCard
      label="Attendance Today"
      value={`${stats.attendanceToday?.rate ?? 0}%`}
      sub={`${stats.attendanceToday?.present ?? 0}/${stats.attendanceToday?.totalMarked ?? 0} present`}
      tone="amber"
      icon={<IconD d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
    />
    <StatCard
      label="Fees Collected"
      value={fmtMoney(stats.fees?.collected)}
      sub={`of ${fmtMoney(stats.fees?.billed)} billed`}
      tone="brand"
      icon={<IconD d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" />}
    />
    <StatCard
      label="Outstanding"
      value={fmtMoney(stats.fees?.outstanding)}
      sub={`${stats.fees?.overdue ?? 0} overdue invoices`}
      tone="red"
      icon={<IconD d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0l-7.1 12.25A2 2 0 005 19z" />}
    />
    <StatCard
      label="Trip Registrations"
      value={stats.tripRegistrations}
      sub="across all trips"
      tone="blue"
      icon={<IconD d="M8 16H6a2 2 0 01-2-2v-4h16v4a2 2 0 01-2 2h-2m-8 0V9m8 7v-7M4 6h16M6 20h12" />}
    />
    <StatCard
      label="School Year"
      value={new Date().getFullYear()}
      tone="purple"
      icon={<IconD d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
    />
  </div>
)

const IconD = ({ d }) => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

export default function Overview() {
  const { user } = useAuth()
  const { data, loading, error } = useApi('/dashboard')

  if (loading) return <Spinner />
  if (error) return <EmptyState title="Could not load dashboard" message={error} />

  const stats = data.stats || {}

  return (
    <div>
      <PageHeader
        title={<Greeting />}
        subtitle={
          user.role === 'admin'
            ? "Here's what's happening at Greenwood today."
            : user.role === 'teacher'
              ? 'Your classes and updates at a glance.'
              : user.role === 'parent'
                ? "Your child's school life at a glance."
                : 'Your learning dashboard.'
        }
      />

      {user.role === 'admin' && <AdminStats stats={stats} />}

      {user.role === 'teacher' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="My Classes" value={stats.classCount ?? 0} icon={<IconD d="M12 14l9-5-9-5-9 5 9 5z" />} />
          <StatCard
            label="Department"
            value={data.teacher?.department || '—'}
            tone="blue"
            icon={<IconD d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H2m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />}
          />
          <StatCard
            label="Employee ID"
            value={data.teacher?.employeeId || '—'}
            tone="purple"
            icon={<IconD d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 114 0 2 2 0 01-4 0z" />}
          />
        </div>
      )}

      {(user.role === 'student' || user.role === 'parent') && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Class"
              value={data.student?.class || '—'}
              icon={<IconD d="M12 14l9-5-9-5-9 5 9 5z" />}
            />
            <StatCard
              label="Attendance"
              value={`${stats.attendanceRate ?? 0}%`}
              sub="recent lessons"
              tone="blue"
              icon={<IconD d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            />
            <StatCard
              label="Fees Due"
              value={fmtMoney(stats.feesDue)}
              sub={stats.overdueInvoices ? `${stats.overdueInvoices} overdue` : 'all on track'}
              tone={stats.overdueInvoices ? 'red' : 'amber'}
              icon={<IconD d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" />}
            />
            <StatCard
              label="Trips Joined"
              value={stats.tripsRegistered ?? 0}
              tone="purple"
              icon={<IconD d="M8 16H6a2 2 0 01-2-2v-4h16v4a2 2 0 01-2 2h-2m-8 0V9m8 7v-7M4 6h16M6 20h12" />}
            />
          </div>
          {data.events?.length > 0 && (
            <Card className="mt-6 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Upcoming school events</h3>
              <ul className="mt-3 space-y-2.5">
                {data.events.map((e) => (
                  <li key={e._id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{e.title}</span>
                    <span className="text-slate-500">{fmtDate(e.startDate)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {/* Announcements */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Announcements</h3>
            <Link to="/dashboard/announcements" className="text-sm text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data.announcements || []).length === 0 && (
              <p className="text-sm text-slate-400">No announcements yet.</p>
            )}
            {(data.announcements || []).map((a) => (
              <div key={a._id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-2">
                  <Badge tone={a.priority === 'high' ? 'red' : 'blue'}>{a.category}</Badge>
                  <span className="text-xs text-slate-400">{fmtDate(a.publishedAt)}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-800">{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{a.body}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Trips preview */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              {user.role === 'admin' || user.role === 'teacher' ? 'Upcoming Trips' : 'My Trips'}
            </h3>
            <Link to="/dashboard/trips" className="text-sm text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data.trips || []).length === 0 && <p className="text-sm text-slate-400">No trips to show.</p>}
            {(data.trips || []).map((t) => (
              <div key={t._id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="green">{t.category}</Badge>
                  <span className="text-xs text-slate-400">{fmtDate(t.startDate)}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-800">{t.title}</p>
                <p className="text-xs text-slate-500">{t.destination}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
