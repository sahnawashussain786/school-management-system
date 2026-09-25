import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '../api/client'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token')
    return !!token
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }
    apiGet('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiPost('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    setUser(data.user)
    toast.success('Login successful')
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await apiPost('/auth/register', payload)
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout')
      toast.success('Logged out successfully')
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const value = { user, loading, login, register, logout, isAuthenticated: !!user }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
