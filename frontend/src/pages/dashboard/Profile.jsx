import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiPut } from '../../api/client'
import { PageHeader, Card, Input, Button, ErrorBanner } from '../../components/ui'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      await apiPut('/auth/profile', { name, phone })
      setMsg('Profile updated. Reload to see your new name across the portal.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setError(null)
    setMsg(null)
    if (pw.next !== pw.confirm) {
      setError('New passwords do not match')
      return
    }
    setBusy(true)
    try {
      await apiPut('/auth/profile', { currentPassword: pw.current, newPassword: pw.next })
      setMsg('Password changed successfully.')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const roleLabel = { admin: 'Administrator', teacher: 'Teacher', student: 'Student', parent: 'Parent' }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account details" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {user?.name?.slice(0, 1).toUpperCase()}
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {roleLabel[user?.role]}
          </p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Account details</h3>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <ErrorBanner message={error} />
            {msg && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="pr-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input id="pr-phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Input id="pr-email" label="Email (cannot change)" value={user?.email || ''} disabled />
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</Button>
          </form>

          <h3 className="mt-8 border-t border-slate-100 pt-6 font-semibold text-slate-900">Change password</h3>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input id="pw-cur" label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
              <Input id="pw-new" label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
              <Input id="pw-conf" label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
            </div>
            <Button type="submit" variant="secondary" disabled={busy}>Update Password</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
