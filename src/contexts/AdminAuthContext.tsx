import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

/* ── Static admin credentials ───────────────────────────────────────────── */
const ADMIN_EMAIL = 'admin@iefa.org'
const ADMIN_ACCESS_KEY = 'Admin@2026!'
const STORAGE_KEY    = 'adminSession'

interface AdminUser {
  email: string
  name: string
  role: 'superadmin'
  avatar: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isAdminAuthenticated: boolean
  adminLogin: (email: string, password: string) => Promise<void>
  adminLogout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}

const ADMIN_PROFILE: AdminUser = {
  email: ADMIN_EMAIL,
  name: 'Super Admin',
  role: 'superadmin',
  avatar: 'SA',
}

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as AdminUser) : null
  })

  useEffect(() => {
    if (admin) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(admin))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [admin])

  const adminLogin = async (email: string, password: string) => {
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_ACCESS_KEY) {
      setAdmin(ADMIN_PROFILE)
    } else {
      throw new Error('Invalid admin credentials')
    }
  }

  const adminLogout = () => setAdmin(null)

  const value = useMemo(
    () => ({ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [admin],
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
