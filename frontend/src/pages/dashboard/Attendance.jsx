import { useEffect, useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost } from '../../api/client'
import {
  PageHeader, Card, Button, Select, Input, Badge, Spinner, EmptyState, ErrorBanner,
} from '../../components/ui'
import { toast } from 'react-toastify'
import { toInputDate } from '../../utils/format'

const STATUSES = ['unmarked', 'present', 'absent', 'late', 'excused']
const tone = { present: 'green', absent: 'red', late: 'amber', excused: 'blue', unmarked: 'gray' }

export default function Attendance() {
  const { data: classes } = useApi('/classes?limit=100')
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(toInputDate())
  const [roster, setRoster] = useState(null)
  const [records, setRecords] = useState([])
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [pageError, setPageError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!classId || !date) return
    let active = true
    apiGet('/attendance/roster', { classId, date })
      .then((res) => {
        if (!active) return
        setRoster(res)
        setRecords(res.records)
        setSaved(false)
      })
      .catch((e) => active && setPageError(e.message))
      .finally(() => active && setLoadingRoster(false))
    return () => { active = false }
  }, [classId, date])

  const setStatus = (idx, status) => {
    setRecords((rs) => rs.map((r, i) => (i === idx ? { ...r, status } : r)))
    setSaved(false)
  }

  const submit = async () => {
    setBusy(true)
    setPageError(null)
    try {
      await apiPost('/attendance', {
        classId,
        date,
        records: records.map((r) => ({ student: r.student, status: r.status, note: r.note })),
      })
      setSaved(true)
      toast.success('Attendance saved successfully')
    } catch (e) {
      setPageError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Take the daily register for each class" />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select class…</option>
          {(classes?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex items-center">
          <Button onClick={submit} disabled={!classId || !records.length || busy} className="w-full">
            {busy ? 'Saving…' : saved ? '✓ Saved' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      <ErrorBanner message={pageError} />

      {!classId ? (
        <EmptyState title="Select a class" message="Choose a class and date to load the roster." />
      ) : loadingRoster ? (
        <Spinner />
      ) : !roster || roster.records.length === 0 ? (
        <EmptyState title="No students in this class" message="Add students to this class first." />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm">
            {STATUSES.slice(1).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <Badge tone={tone[s]}>{counts[s]}</Badge>
                <span className="text-slate-500">{s}</span>
              </span>
            ))}
            <span className="ml-auto text-xs text-slate-400">{records.length} students</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {records.map((r, idx) => (
              <li key={r.student} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {r.name?.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">Roll {r.rollNumber || '—'} · {r.admissionNumber}</p>
                  </div>
                  <Badge tone={tone[r.status]} className="sm:hidden">{r.status}</Badge>
                </div>
                <div className="flex gap-1.5">
                  {STATUSES.slice(1).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(idx, s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                        r.status === s
                          ? s === 'present'
                            ? 'bg-emerald-600 text-white'
                            : s === 'absent'
                              ? 'bg-red-600 text-white'
                              : s === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
