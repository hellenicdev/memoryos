import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: string
  name: string
  email: string
  plan: string
  avatar?: string
  storageUsed?: number
  storageLimit?: number
  aiQueriesUsed?: number
  aiQueryLimit?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>
  register: (name: string, email: string, password: string, turnstileToken?: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/auth/profile')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string, turnstileToken?: string) => {
    const res = await api.post('/auth/login', { email, password, turnstileToken })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string, turnstileToken?: string) => {
    const res = await api.post('/auth/register', { name, email, password, turnstileToken })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
