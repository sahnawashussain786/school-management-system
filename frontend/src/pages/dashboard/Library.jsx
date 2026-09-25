import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiPut, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Modal, Badge, Spinner, EmptyState, ErrorBanner,
} from '../../components/ui'

import { useAuth } from '../../context/AuthContext'

const emptyBook = { title: '', author: '', isbn: '', category: '', totalCopies: 1, shelf: '' }

export default function Library() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'

  const [search, setSearch] = useState('')
  const { data, loading, error, refetch } = useApi('/library', [search], { search, limit: 100 })
  const { data: studentsData } = useApi('/students?limit=100')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyBook)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [borrowModal, setBorrowModal] = useState(null)
  const [borrowStudent, setBorrowStudent] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(emptyBook); setFormError(null); setModal({ mode: 'create' }) }
  const openEdit = (b) => {
    setForm({ title: b.title, author: b.author || '', isbn: b.isbn || '', category: b.category || '', totalCopies: b.totalCopies, shelf: b.shelf || '' })
    setFormError(null)
    setModal({ mode: 'edit', item: b })
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies) }
      if (modal.mode === 'create') await apiPost('/library', payload)
      else await apiPut(`/library/${modal.item._id}`, payload)
      setModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await apiDelete(`/library/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const borrow = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await apiPost(`/library/${borrowModal._id}/borrow`, borrowStudent ? { studentId: borrowStudent } : {})
      setBorrowModal(null)
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  const doReturn = async (book) => {
    const activeLoan = (book.loans || []).find((l) => l.status !== 'returned')
    if (!activeLoan) return alert('No active loan for this book.')
    try {
      await apiPost(`/library/${book._id}/return`, { studentId: activeLoan.student })
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Library"
        subtitle={`${data?.total ?? '—'} titles in the catalogue`}
        actions={isAdmin && <Button onClick={openCreate}>+ Add Book</Button>}
      />

      <div className="mb-4 sm:max-w-xs">
        <Input placeholder="Search title, author, category…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : (data?.items || []).length === 0 ? (
        <EmptyState title="No books found" />
      ) : (
        <Table headers={['Title', 'Author', 'Category', 'Shelf', 'Available', ...(isAdmin ? ['Actions'] : [])]}>
          {(data.items || []).map((b) => (
            <tr key={b._id} className="hover:bg-slate-50">
              <Td>
                <p className="font-medium text-slate-800">{b.title}</p>
                {b.isbn && <p className="font-mono text-[11px] text-slate-400">{b.isbn}</p>}
              </Td>
              <Td>{b.author || '—'}</Td>
              <Td><Badge tone="blue">{b.category || 'General'}</Badge></Td>
              <Td>{b.shelf || '—'}</Td>
              <Td>
                <Badge tone={b.availableCopies > 0 ? 'green' : 'red'}>
                  {b.availableCopies}/{b.totalCopies}
                </Badge>
              </Td>
              {isAdmin && (
                <Td>
                  <div className="flex flex-wrap gap-2">
                    {b.availableCopies > 0 && (
                      <Button size="sm" onClick={() => { setBorrowModal(b); setBorrowStudent('') }}>Issue</Button>
                    )}
                    {(b.loans || []).some((l) => l.status !== 'returned') && (
                      <Button size="sm" variant="secondary" onClick={() => doReturn(b)}>Return</Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => openEdit(b)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(b._id)}>Delete</Button>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </Table>
      )}

      {/* Add/edit book */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Book' : 'Edit Book'}
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
            <Input id="b-title" label="Title" required value={form.title} onChange={set('title')} />
            <Input id="b-author" label="Author" value={form.author} onChange={set('author')} />
            <Input id="b-isbn" label="ISBN" value={form.isbn} onChange={set('isbn')} />
            <Input id="b-cat" label="Category" value={form.category} onChange={set('category')} />
            <Input id="b-copies" label="Total copies" type="number" min="1" value={form.totalCopies} onChange={set('totalCopies')} />
            <Input id="b-shelf" label="Shelf" value={form.shelf} onChange={set('shelf')} />
          </div>
        </form>
      </Modal>

      {/* Borrow modal */}
      <Modal
        open={!!borrowModal}
        onClose={() => setBorrowModal(null)}
        title={`Issue "${borrowModal?.title}"`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setBorrowModal(null)}>Cancel</Button>
            <Button onClick={borrow} disabled={busy}>Issue Book</Button>
          </>
        }
      >
        <form onSubmit={borrow}>
          <p className="mb-4 text-sm text-slate-500">Loan period is 14 days. Select the student borrowing this book:</p>
          <select
            value={borrowStudent}
            onChange={(e) => setBorrowStudent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">Select student…</option>
            {(studentsData?.items || []).map((s) => (
              <option key={s._id} value={s._id}>{s.user?.name} — {s.admissionNumber}</option>
            ))}
          </select>
        </form>
      </Modal>
    </div>
  )
}
