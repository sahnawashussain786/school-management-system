const API_URL = '/api'

const getToken = () => localStorage.getItem('token')

export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_URL + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v)
    })
  }

  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  // Handle non-JSON responses
  const contentType = res.headers.get('content-type')
  let data
  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}))
  } else {
    data = await res.text().catch(() => '')
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`)
    err.status = res.status
    // Log the error for debugging
    console.error(`API Error: ${method} ${path} - ${res.status}`, data)
    throw err
  }
  return data
}

export const apiGet = (path, params) => api(path, { params })
export const apiPost = (path, body) => api(path, { method: 'POST', body })
export const apiPut = (path, body) => api(path, { method: 'PUT', body })
export const apiDelete = (path) => api(path, { method: 'DELETE' })
