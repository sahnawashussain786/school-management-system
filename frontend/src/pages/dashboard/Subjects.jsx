import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Modal, Badge, Spinner, EmptyState, ErrorBanner,
} from '../../components/ui'
import { toast } from 'react-toastify'

export default function Subjects() {
  const { data, loading, error, refetch } = useApi('/subjects?limit=100')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', description: '' })
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => {
    setForm({ name: '', code: '', description: '' })
    setFormError(null)
    setModal({ mode: 'create' })
  }
  const openEdit = (s) => {
    setForm({ name: s.name, code: s.code, description: s.description || '' })
    setFormError(null)
    setModal({ mode: 'edit', item: s })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      if (modal.mode === 'create') await apiPost('/subjects', form)
      else await apiPut(`/subjects/${modal.item._id}`, form)
      setModal(null)
      refetch()
      toast.success('Subject saved successfully')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this subject?')) return
    try {
      await apiDelete(`/subjects/${id}`)
      refetch()
      toast.success('Subject deleted')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={`${data?.total ?? '—'} subjects in the curriculum`}
        actions={<Button onClick={openCreate}>+ Add Subject</Button>}
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No subjects yet" />
      ) : (
        <Table headers={['Subject', 'Code', 'Description', 'Actions']}>
          {(data.items || []).map((s) => (
            <tr key={s._id} className="hover:bg-slate-50">
              <Td><span className="font-medium text-slate-800">{s.name}</span></Td>
              <Td><Badge tone="purple">{s.code}</Badge></Td>
              <Td className="max-w-md text-sm text-slate-500">{s.description || '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(s._id)}>Delete</Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Subject' : 'Edit Subject'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <ErrorBanner message={formError} />
          <Input id="sub-name" label="Subject name" required value={form.name} onChange={set('name')} />
          <Input id="sub-code" label="Code" required value={form.code} onChange={set('code')} placeholder="MATH" />
          <Input id="sub-desc" label="Description" value={form.description} onChange={set('description')} />
        </form>
      </Modal>
    </div>
  )
}
