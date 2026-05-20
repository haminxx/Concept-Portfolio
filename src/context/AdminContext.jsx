import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readAdminSession, verifyAdminLogin, writeAdminSession } from '../utils/adminAuth'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => readAdminSession())

  const login = useCallback((username, password) => {
    if (!verifyAdminLogin(username, password)) return false
    writeAdminSession(true)
    setIsAdmin(true)
    return true
  }, [])

  const logout = useCallback(() => {
    writeAdminSession(false)
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({ isAdmin, login, logout }),
    [isAdmin, login, logout],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
