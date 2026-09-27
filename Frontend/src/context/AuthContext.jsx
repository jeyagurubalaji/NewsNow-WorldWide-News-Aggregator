import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('newsnow_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('newsnow_user')
      }
    }
    setLoading(false)
  }, [])

  const persist = (authResponse) => {
    localStorage.setItem('newsnow_token', authResponse.token)
    const userData = {
      email: authResponse.email,
      fullName: authResponse.fullName,
      preferredCountry: authResponse.preferredCountry,
    }
    localStorage.setItem('newsnow_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return persist(data)
  }

  const loginWithGoogle = async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken })
    return persist(data)
  }

  const register = async (fullName, email, password, preferredCountry) => {
    const { data } = await api.post('/auth/register', {
      fullName,
      email,
      password,
      preferredCountry,
    })
    return persist(data)
  }

  const logout = () => {
    localStorage.removeItem('newsnow_token')
    localStorage.removeItem('newsnow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}