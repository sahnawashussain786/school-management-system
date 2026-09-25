import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiDelete } from '../../api/client'
import {
  PageHeader, Card, Button, Select, Badge, Spinner, EmptyState, ErrorBanner,
} from '../../components/ui'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = [
  ['1', '08:00 – 08:45'], ['2', '08:50 – 09:35'], ['3', '09:40 – 10:25'],
  ['4', '10:45 – 11:30'], ['5', '11:35 – 12:20'], ['6', '13:00 – 13:45'],
]

export default function TimetableManage() {
  const { data: classes } = useApi('/classes?limit=100')
  const [classId, setClassId] = useState('')

  const { data: grid, loading, error, refetch } = useApi(
    `/timetable/${classId}`,
    [classId],
    undefined,
  )

  const { data: subjectsData } = useApi('/subjects?limit=100')
  const { data: teachersData } = useApi('/teachers?limit=100')

  const [form, setForm] = useState({ day: 'Monday', period: '1', startTime: '08:00', endTime: '08:45', subjectId: '', teacherId: '', room: '' })
  const [formError, setFormError] = useState(null)

  const addEntry = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await apiPost('/timetable', { ...form, classId, period: Number(form.period) })
      refetch()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const removeEntry = async (id) => {
    try {
      await apiDelete(`/timetable/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  if (!classes) return <Spinner />

  return (
    <div>
      <PageHeader title="Timetable" subtitle="Build the weekly schedule for each class" />

      <div className="mb-6 sm:max-w-xs">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select a class…</option>
          {(classes.items || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <ErrorBanner message={error} />

      {!classId ? (
        <EmptyState title="Pick a class" message="Choose a class above to view and edit its weekly timetable." />
      ) : loading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Period</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border-b border-slate-200 border-l px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map(([p, time]) => (
                  <tr key={p}>
                    <td className="border-b border-slate-100 px-4 py-3 align-top">
                      <p className="font-semibold text-slate-700">P{p}</p>
                      <p className="text-xs text-slate-400">{time}</p>
                    </td>
                    {DAYS.map((d) => {
                      const entries = (grid && grid[d]) ? grid[d].filter((x) => x.period === Number(p)) : []
                      return (
                        <td key={d} className="border-b border-l border-slate-100 px-3 py-2 align-top">
                          {entries.length === 0 && <span className="text-xs text-slate-300">—</span>}
                          {entries.map((e) => (
                            <div key={e._id} className="group mb-1 rounded-lg bg-brand-50 px-2.5 py-1.5 ring-1 ring-brand-100">
                              <p className="text-xs font-semibold text-brand-800">{e.subject?.name || 'Free'}</p>
                              <p className="text-[11px] text-brand-600">{e.teacher || 'No teacher'}{e.room ? ` · ${e.room}` : ''}</p>
                              <button
                                onClick={() => removeEntry(e._id)}
                                className="mt-1 text-[10px] font-medium text-red-500 opacity-0 transition group-hover:opacity-100"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="mt-6 p-5">
            <h3 className="font-semibold text-slate-900">Add a period</h3>
            <form onSubmit={addEntry} className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
              <ErrorBanner message={formError} />
              <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </Select>
              <Select value={form.period} onChange={(e) => {
                const p = Number(e.target.value)
                const slot = SLOTS[p - 1]
                setForm({ ...form, period: e.target.value, startTime: slot[1].split(' – ')[0], endTime: slot[1].split(' – ')[1] })
              }}>
                {SLOTS.map(([p]) => <option key={p} value={p}>Period {p}</option>)}
              </Select>
              <Select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                <option value="">Subject…</option>
                {(subjectsData?.items || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
              <Select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">Teacher…</option>
                {(teachersData?.items || []).map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
              </Select>
              <Input placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={!classId || !form.subjectId}>Add</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}
