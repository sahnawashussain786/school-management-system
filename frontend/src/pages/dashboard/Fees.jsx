import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { apiPost, apiDelete } from '../../api/client'
import {
  PageHeader, Table, Td, Button, Input, Select, Modal, Badge, Spinner,
  EmptyState, ErrorBanner, Pagination, StatCard, Card,
} from '../../components/ui'

import { fmtDate, fmtMoney } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { statusTone } from '../../utils/constants'

export default function Fees() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'

  // Admin state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, loading, error, refetch } = useApi('/fees', [page, search, statusFilter], {
    page, search, status: statusFilter, limit: 10,
  })
  const { data: stats } = useApi('/fees/stats/summary')
  const { data: classes } = useApi('/classes?limit=100')

  const [payModal, setPayModal] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', reference: '' })
  const [genModal, setGenModal] = useState(false)
  const [genForm, setGenForm] = useState({ classId: '', title: 'Tuition — Monthly', amount: 450, dueDate: '', month: '' })
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const openPay = (inv) => {
    setPayForm({ amount: (inv.amount - (inv.payments || []).reduce((s, p) => s + p.amount, 0)).toString(), method: 'cash', reference: '' })
    setPayModal(inv)
    setFormError(null)
  }

  const doPay = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      await apiPost(`/fees/${payModal._id}/pay`, { ...payForm, amount: Number(payForm.amount) })
      setPayModal(null)
      refetch()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const doGenerate = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const res = await apiPost('/fees/generate', {
        ...genForm,
        amount: Number(genForm.amount),
      })
      setGenModal(false)
      refetch()
      alert(`Created ${res.created} invoices.`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const doDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return
    try {
      await apiDelete(`/fees/${id}`)
      refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  const rows = data?.items || []
  const paidSoFar = (inv) => (inv.payments || []).reduce((s, p) => s + p.amount, 0)

  /* ---------------- Student/parent view ---------------- */
  if (!isAdmin) {
    const myInvoices = rows
    return (
      <div>
        <PageHeader title="My Fees" subtitle="Invoices and payment history" />
        <ErrorBanner message={error} />
        {loading ? (
          <Spinner />
        ) : myInvoices.length === 0 ? (
          <EmptyState title="No invoices" message="You have no fee invoices yet." />
        ) : (
          <div className="space-y-4">
            {myInvoices.map((inv) => {
              const paid = paidSoFar(inv)
              return (
                <Card key={inv._id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{inv.title}</p>
                      <p className="text-xs text-slate-400">{inv.invoiceNumber} · due {fmtDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{fmtMoney(inv.amount)}</p>
                        <p className="text-xs text-slate-400">{fmtMoney(paid)} paid</p>
                      </div>
                      <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
                    </div>
                  </div>
                  {(inv.payments || []).length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold uppercase text-slate-400">Payments</p>
                      <ul className="mt-1.5 space-y-1">
                        {inv.payments.map((p, i) => (
                          <li key={i} className="flex justify-between text-sm text-slate-600">
                            <span>{fmtMoney(p.amount)} · {p.method}</span>
                            <span className="text-xs text-slate-400">{fmtDate(p.paidAt)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ---------------- Admin view ---------------- */
  return (
    <div>
      <PageHeader
        title="Fees & Billing"
        subtitle="Invoices, payments and collection stats"
        actions={<Button onClick={() => { setFormError(null); setGenModal(true) }}>Generate Invoices</Button>}
      />

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Billed" value={fmtMoney(stats.totalBilled)} />
          <StatCard label="Collected" value={fmtMoney(stats.totalCollected)} sub={`${stats.collectionRate}% collection rate`} tone="blue" />
          <StatCard label="Outstanding" value={fmtMoney(stats.outstanding)} tone="amber" />
          <StatCard label="Overdue Invoices" value={stats.overdue} tone="red" />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search invoices…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="sm:max-w-[180px]">
          <option value="">All statuses</option>
          {['unpaid', 'partial', 'paid', 'overdue'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No invoices" message="Generate invoices for a class to get started." />
      ) : (
        <>
          <Table headers={['Invoice', 'Student', 'Title', 'Amount', 'Paid', 'Due', 'Status', 'Actions']}>
            {rows.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <Td className="font-mono text-xs">{inv.invoiceNumber}</Td>
                <Td>{inv.studentName || '—'}</Td>
                <Td>{inv.title}</Td>
                <Td>{fmtMoney(inv.amount)}</Td>
                <Td>{fmtMoney(paidSoFar(inv))}</Td>
                <Td>{fmtDate(inv.dueDate)}</Td>
                <Td><Badge tone={statusTone[inv.status]}>{inv.status}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    {inv.status !== 'paid' && (
                      <Button size="sm" onClick={() => openPay(inv)}>Record Payment</Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => doDelete(inv._id)}>Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}

      {/* Pay modal */}
      <Modal
        open={!!payModal}
        onClose={() => setPayModal(null)}
        title={`Record Payment — ${payModal?.invoiceNumber || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayModal(null)}>Cancel</Button>
            <Button onClick={doPay} disabled={busy}>{busy ? 'Saving…' : 'Record'}</Button>
          </>
        }
      >
        <form onSubmit={doPay} className="space-y-4">
          <ErrorBanner message={formError} />
          <p className="text-sm text-slate-500">
            {payModal?.title} — total {fmtMoney(payModal?.amount)}, outstanding{' '}
            <strong>{fmtMoney((payModal?.amount || 0) - paidSoFar(payModal || {}))}</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="p-amount" label="Amount" type="number" step="0.01" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
            <Select id="p-method" label="Method" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              {['cash', 'card', 'bank', 'online'].map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <Input id="p-ref" label="Reference (optional)" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
        </form>
      </Modal>

      {/* Generate modal */}
      <Modal
        open={genModal}
        onClose={() => setGenModal(false)}
        title="Generate Class Invoices"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenModal(false)}>Cancel</Button>
            <Button onClick={doGenerate} disabled={busy}>{busy ? 'Creating…' : 'Generate'}</Button>
          </>
        }
      >
        <form onSubmit={doGenerate} className="space-y-4">
          <ErrorBanner message={formError} />
          <Select id="g-class" label="Class" required value={genForm.classId} onChange={(e) => setGenForm({ ...genForm, classId: e.target.value })}>
            <option value="">Select…</option>
            {(classes?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Input id="g-title" label="Invoice title" required value={genForm.title} onChange={(e) => setGenForm({ ...genForm, title: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="g-amount" label="Amount per student" type="number" required value={genForm.amount} onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })} />
            <Input id="g-due" label="Due date" type="date" required value={genForm.dueDate} onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })} />
          </div>
          <p className="text-xs text-slate-400">One invoice will be created for every active student in the selected class.</p>
        </form>
      </Modal>
    </div>
  )
}
