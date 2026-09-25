import useApi from '../../hooks/useApi'
import { PageHeader, Table, Td, Spinner, EmptyState, ErrorBanner, Badge, Card } from '../../components/ui'
import { fmtDate } from '../../utils/format'

export default function MyResults() {
  const { data, loading, error } = useApi('/exams/my/results')

  if (loading) return <Spinner />
  if (error) return <EmptyState title="Could not load results" message={error} />

  const results = data || []
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0

  return (
    <div>
      <PageHeader title="My Results" subtitle="Published exam results" />

      {results.length === 0 ? (
        <EmptyState title="No published results yet" message="Results appear here once your teachers publish them." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-brand-600">{avg}%</p>
              <p className="mt-1 text-sm text-slate-500">Average score</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-slate-800">{results.length}</p>
              <p className="mt-1 text-sm text-slate-500">Exams taken</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {results.filter((r) => r.grade !== 'F').length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Passed</p>
            </Card>
          </div>

          <Table headers={['Exam', 'Subject', 'Date', 'Score', 'Grade', 'Remark']}>
            {results.map((r) => (
              <tr key={r.examId} className="hover:bg-slate-50">
                <Td>
                  <p className="font-medium text-slate-800">{r.examName}</p>
                  <p className="text-xs capitalize text-slate-400">{r.examType}</p>
                </Td>
                <Td>{r.subject}</Td>
                <Td>{fmtDate(r.date)}</Td>
                <Td>{r.marks}/{r.totalMarks}</Td>
                <Td>
                  <Badge tone={r.grade === 'F' ? 'red' : 'green'}>{r.grade || '—'}</Badge>
                </Td>
                <Td className="text-sm text-slate-500">{r.remark || '—'}</Td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </div>
  )
}
