const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const getDayName = (index) => dayNames[index] || ''

export const dateOnly = (d = new Date()) => {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export const monthLabel = (date) =>
  new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' })

export const toISODate = (d = new Date()) => {
  const dt = new Date(d)
  const off = dt.getTimezoneOffset()
  return new Date(dt.getTime() - off * 60000).toISOString().split('T')[0]
}
