import useApi from '../../hooks/useApi'
import { PageHeader, Card, Spinner, EmptyState, ErrorBanner, Badge } from '../../components/ui'
import { fmtDate } from '../../utils/format'

const tone = { present: 'green', absent: 'red', late: 'amber', excused: 'blue', unmarked: 'gray' }

export default function MyAttendance() {
  const { data, loading, error } = useApi('/attendance/my/summary')

  if (loading) return <Spinner />
  if (error) return <EmptyState title="Could not load attendance" message={error} />

  const summary = data?.summary || {}
  const history = data?.history || []

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Your attendance record at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="p-5 text-center">
          <p className="text-3xl font-bold text-brand-600">{summary.rate ?? 0}%</p>
          <p className="mt-1 text-sm text-slate-500">Overall rate</p>
        </Card>
        {[
          ['Present', summary.present, 'text-emerald-600'],
          ['Absent', summary.absent, 'text-red-600'],
          ['Late', summary.late, 'text-amber-600'],
          ['Excused', summary.excused, 'text-sky-600'],
        ].map(([label, value, cls]) => (
          <Card key={label} className="p-5 text-center">
            <p className={`text-3xl font-bold ${cls}`}>{value ?? 0}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h3 className="font-semibold text-slate-900">Recent history</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No attendance recorded yet.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 30).map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-sm">
                <span className="text-slate-600">{fmtDate(h.date)}</span>
                <Badge tone={tone[h.status]}>{h.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
