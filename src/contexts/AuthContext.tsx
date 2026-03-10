import React, { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useMe } from '@/hooks/useAuth'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string, role: string) => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const { data: meData, isLoading } = useMe()

  useEffect(() => {
    if (meData && !user) {
      setUser(meData)
    }
  }, [meData, user, setUser])

  const login = async (_email: string, _password: string) => {
    // This will be handled by the hook
  }

  const signup = async (_email: string, _password: string, _role: string) => {
    // This will be handled by the hook
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    signup,
    isAuthenticated,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
