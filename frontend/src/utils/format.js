export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

export const fmtMoney = (n) =>
  n === undefined || n === null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

export const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const toInputDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  const off = dt.getTimezoneOffset()
  return new Date(dt.getTime() - off * 60000).toISOString().split('T')[0]
}
