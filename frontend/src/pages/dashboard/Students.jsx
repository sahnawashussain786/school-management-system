import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Select, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Pagination,
} from '../../components/ui'
import { statusTone } from '../../utils/constants'


const emptyForm = {
  name: '', email: '', password: '', phone: '', admissionNumber: '', rollNumber: '',
  class: '', dateOfBirth: '', gender: 'other', address: '', guardianName: '',
  guardianPhone: '', bloodGroup: '', medicalNotes: '',
}

export default function Students() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', student }
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, loading, error: listError, refetch } = useApi(
    '/students',
    [search, classFilter, page],
    { search, class: classFilter, page, limit: 10 },
  )
  const { data: classes } = useApi('/classes?limit=100')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => {
    setForm(emptyForm)
    setError(null)
    setModal({ mode: 'create' })
  }
  const openEdit = async (id) => {
    try {
      const s = await apiGet(`/students/${id}`)
      setForm({
        name: s.user?.name || '',
        email: s.user?.email || '',
        password: '',
        phone: s.user?.phone || '',
        admissionNumber: s.admissionNumber || '',
        rollNumber: s.rollNumber || '',
        class: s.class?._id || '',
        dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
        gender: s.gender || 'other',
        address: s.address || '',
        guardianName: s.guardianName || '',
        guardianPhone: s.guardianPhone || '',
        bloodGroup: s.bloodGroup || '',
        medicalNotes: s.medicalNotes || '',
      })
      setError(null)
      setModal({ mode: 'edit', student: s })
    } catch (e) {
      setError(e.message)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const payload = { ...form, class: form.class || null }
    try {
      if (modal.mode === 'create') await apiPost('/students', payload)
      else await apiPut(`/students/${modal.student._id}`, payload)
      setModal(null)
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this student and their account? This cannot be undone.')) return
    try {
      await apiDelete(`/students/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const items = data?.items || []

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.total ?? '—'} enrolled students`}
        actions={<Button onClick={openCreate}>+ Add Student</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by name or admission no…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="sm:max-w-xs"
        />
        <Select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1) }}
          className="sm:max-w-[220px]"
        >
          <option value="">All classes</option>
          {(classes?.items || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <ErrorBanner message={listError} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No students found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <Table headers={['Student', 'Admission #', 'Class', 'Guardian', 'Status', 'Actions']}>
            {items.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {(s.user?.name || '?').slice(0, 1)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{s.user?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{s.user?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>{s.admissionNumber}</Td>
                <Td>{s.class?.name || '—'}</Td>
                <Td>
                  <p>{s.guardianName || '—'}</p>
                  <p className="text-xs text-slate-400">{s.guardianPhone}</p>
                </Td>
                <Td><Badge tone={statusTone[s.status] || 'gray'}>{s.status}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(s._id)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(s._id)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Student' : 'Edit Student'}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Student'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="s-name" label="Full name" required value={form.name} onChange={set('name')} />
            <Input id="s-email" label="Email (login)" type="email" required value={form.email} onChange={set('email')} />
            <Input id="s-adm" label="Admission number" required value={form.admissionNumber} onChange={set('admissionNumber')} disabled={modal?.mode === 'edit'} />
            <Input id="s-roll" label="Roll number" value={form.rollNumber} onChange={set('rollNumber')} />
            <Select id="s-class" label="Class" value={form.class} onChange={set('class')}>
              <option value="">Unassigned</option>
              {(classes?.items || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Select id="s-gender" label="Gender" value={form.gender} onChange={set('gender')}>
              {['male', 'female', 'other'].map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
            <Input id="s-dob" label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            <Input id="s-phone" label="Phone" value={form.phone} onChange={set('phone')} />
            <Input id="s-guardian" label="Guardian name" value={form.guardianName} onChange={set('guardianName')} />
            <Input id="s-gphone" label="Guardian phone" value={form.guardianPhone} onChange={set('guardianPhone')} />
            <Input id="s-blood" label="Blood group" value={form.bloodGroup} onChange={set('bloodGroup')} />
            {modal?.mode === 'create' && (
              <Input id="s-pass" label="Password (optional)" value={form.password} onChange={set('password')} placeholder="Default: student123" />
            )}
          </div>
          <Input id="s-address" label="Address" value={form.address} onChange={set('address')} />
          <Input id="s-medical" label="Medical notes" value={form.medicalNotes} onChange={set('medicalNotes')} />
        </form>
      </Modal>
    </div>
  )
}
