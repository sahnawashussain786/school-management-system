import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Pagination,
} from '../../components/ui'
import { statusTone } from '../../utils/constants'

const emptyForm = {
  name: '', email: '', password: '', phone: '', employeeId: '', department: '',
  qualification: '', salary: '', address: '',
}

export default function Teachers() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, loading, error: listError, refetch } = useApi('/teachers', [search, page], {
    search, page, limit: 10,
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyForm); setError(null); setModal({ mode: 'create' }) }

  const openEdit = async (id) => {
    try {
      const t = await apiGet(`/teachers/${id}`)
      setForm({
        name: t.user?.name || '',
        email: t.user?.email || '',
        password: '',
        phone: t.user?.phone || '',
        employeeId: t.employeeId || '',
        department: t.department || '',
        qualification: t.qualification || '',
        salary: t.salary || '',
        address: t.address || '',
      })
      setError(null)
      setModal({ mode: 'edit', teacher: t })
    } catch (e) {
      setError(e.message)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const payload = { ...form, salary: Number(form.salary) || 0 }
    try {
      if (modal.mode === 'create') await apiPost('/teachers', payload)
      else await apiPut(`/teachers/${modal.teacher._id}`, payload)
      setModal(null)
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this teacher and their account?')) return
    try {
      await apiDelete(`/teachers/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle={`${data?.total ?? '—'} staff members`}
        actions={<Button onClick={openCreate}>+ Add Teacher</Button>}
      />

      <div className="mb-4 sm:max-w-xs">
        <Input
          placeholder="Search teachers…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <ErrorBanner message={listError} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No teachers found" />
      ) : (
        <>
          <Table headers={['Teacher', 'Employee ID', 'Department', 'Subjects', 'Status', 'Actions']}>
            {(data.items || []).map((t) => (
              <tr key={t._id} className="hover:bg-slate-50">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                      {(t.user?.name || '?').slice(0, 1)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{t.user?.name}</p>
                      <p className="text-xs text-slate-400">{t.user?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>{t.employeeId}</Td>
                <Td>{t.department || '—'}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {(t.subjects || []).map((s) => (
                      <Badge key={s._id} tone="blue">{s.name}</Badge>
                    ))}
                    {(!t.subjects || t.subjects.length === 0) && '—'}
                  </div>
                </Td>
                <Td><Badge tone={statusTone[t.status] || 'green'}>{t.status}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(t._id)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(t._id)}>Delete</Button>
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
        title={modal?.mode === 'create' ? 'Add Teacher' : 'Edit Teacher'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Teacher'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="t-name" label="Full name" required value={form.name} onChange={set('name')} />
            <Input id="t-email" label="Email (login)" type="email" required value={form.email} onChange={set('email')} />
            <Input id="t-emp" label="Employee ID" required value={form.employeeId} onChange={set('employeeId')} disabled={modal?.mode === 'edit'} />
            <Input id="t-dept" label="Department" value={form.department} onChange={set('department')} />
            <Input id="t-qual" label="Qualification" value={form.qualification} onChange={set('qualification')} />
            <Input id="t-salary" label="Salary" type="number" value={form.salary} onChange={set('salary')} />
            <Input id="t-phone" label="Phone" value={form.phone} onChange={set('phone')} />
            {modal?.mode === 'create' && (
              <Input id="t-pass" label="Password (optional)" value={form.password} onChange={set('password')} placeholder="Default: teacher123" />
            )}
          </div>
          <Input id="t-address" label="Address" value={form.address} onChange={set('address')} />
        </form>
      </Modal>
    </div>
  )
}
