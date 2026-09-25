import useApi from '../../hooks/useApi'
import { PageHeader, Spinner, EmptyState, Card } from '../../components/ui'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = ['1', '2', '3', '4', '5', '6']

export default function MyTimetable() {
  const { data, loading, error } = useApi('/timetable/my/week')

  if (loading) return <Spinner />
  if (error) return <EmptyState title="Could not load timetable" message={error} />

  const grid = data || {}
  const hasAny = DAYS.some((d) => (grid[d] || []).length > 0)

  return (
    <div>
      <PageHeader title="My Timetable" subtitle="Your class weekly schedule" />

      {!hasAny ? (
        <EmptyState title="Timetable not published" message="Your class schedule will appear here once the school publishes it." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className="border-b border-l border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((p) => (
                <tr key={p}>
                  <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-600">P{p}</td>
                  {DAYS.map((d) => {
                    const entry = (grid[d] || []).find((x) => String(x.period) === p)
                    return (
                      <td key={d} className="border-b border-l border-slate-100 px-3 py-2">
                        {entry ? (
                          <div className="rounded-lg bg-brand-50 px-2.5 py-1.5 ring-1 ring-brand-100">
                            <p className="text-xs font-semibold text-brand-800">{entry.subject}</p>
                            <p className="text-[11px] text-brand-600">{entry.teacher}{entry.room ? ` · ${entry.room}` : ''}</p>
                            <p className="text-[10px] text-brand-500">{entry.startTime}–{entry.endTime}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
