import { createContext, useContext, useMemo, useState } from 'react'
import { USERS } from '../data/seed'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  const login = (email, password) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!found) {
      setError('Those credentials were not recognised. Please try again.')
      return false
    }
    setError(null)
    setUser(found)
    return true
  }

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, login, logout, error, setError }), [user, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
