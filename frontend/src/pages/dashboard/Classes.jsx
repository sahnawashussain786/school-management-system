import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Select, Modal, Badge, Spinner,
  EmptyState, ErrorBanner,
} from '../../components/ui'

export default function Classes() {
  const { data, loading, error, refetch } = useApi('/classes?limit=100')
  const { data: teachersData } = useApi('/teachers?limit=100')
  const { data: subjectsData } = useApi('/subjects?limit=100')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', gradeLevel: '', section: '', roomNumber: '', capacity: 35, homeroomTeacher: '' })
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => {
    setForm({ name: '', gradeLevel: '', section: '', roomNumber: '', capacity: 35, homeroomTeacher: '' })
    setFormError(null)
    setModal({ mode: 'create' })
  }

  const openEdit = (c) => {
    setForm({
      name: c.name,
      gradeLevel: c.gradeLevel,
      section: c.section,
      roomNumber: c.roomNumber || '',
      capacity: c.capacity,
      homeroomTeacher: c.homeroomTeacher?._id || '',
    })
    setFormError(null)
    setModal({ mode: 'edit', item: c })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    const payload = {
      ...form,
      gradeLevel: Number(form.gradeLevel),
      capacity: Number(form.capacity),
      homeroomTeacher: form.homeroomTeacher || null,
    }
    try {
      if (modal.mode === 'create') await apiPost('/classes', payload)
      else await apiPut(`/classes/${modal.item._id}`, payload)
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this class?')) return
    try {
      await apiDelete(`/classes/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Manage grade sections and homeroom teachers"
        actions={<Button onClick={openCreate}>+ Add Class</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No classes yet" message="Create your first class to get started." />
      ) : (
        <Table headers={['Class', 'Grade', 'Room', 'Homeroom Teacher', 'Capacity', 'Actions']}>
          {(data.items || []).map((c) => (
            <tr key={c._id} className="hover:bg-slate-50">
              <Td><span className="font-medium text-slate-800">{c.name}</span></Td>
              <Td><Badge tone="blue">Grade {c.gradeLevel}</Badge></Td>
              <Td>{c.roomNumber || '—'}</Td>
              <Td>{c.homeroomTeacher?.user?.name || 'Unassigned'}</Td>
              <Td>{c.capacity}</Td>
              <Td>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(c._id)}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Class' : 'Edit Class'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="c-name" label="Class name" required value={form.name} onChange={set('name')} placeholder="Grade 10 - A" />
            <Select id="c-grade" label="Grade level" required value={form.gradeLevel} onChange={set('gradeLevel')}>
              <option value="">Select…</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </Select>
            <Input id="c-section" label="Section" required value={form.section} onChange={set('section')} placeholder="A" />
            <Input id="c-room" label="Room number" value={form.roomNumber} onChange={set('roomNumber')} />
            <Input id="c-cap" label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} />
            <Select id="c-teacher" label="Homeroom teacher" value={form.homeroomTeacher} onChange={set('homeroomTeacher')}>
              <option value="">Unassigned</option>
              {(teachersData?.items || []).map((t) => (
                <option key={t._id} value={t._id}>{t.user?.name}</option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-slate-400">
            {subjectsData?.total ?? 0} subjects available school-wide and can be added via the Subjects page.
          </p>
        </form>
      </Modal>
    </div>
  )
}
