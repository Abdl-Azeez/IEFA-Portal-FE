import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

interface User {
  email: string
  password: string
  role: 'user' | 'admin' | 'moderator' | 'educator'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (email: string, password: string, role: 'user' | 'admin') => Promise<boolean>
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize dummy data
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.length === 0) {
      const initialUsers: User[] = [
        { email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { email: 'user@example.com', password: 'user123', role: 'user' },
        { email: 'mod@example.com', password: 'mod123', role: 'moderator' },
        { email: 'edu@example.com', password: 'edu123', role: 'educator' }
      ]
      localStorage.setItem('users', JSON.stringify(initialUsers))
    }

    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('currentUser', JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const signup = async (email: string, password: string, role: 'user' | 'admin'): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')

    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return false
    }

    const newUser: User = { email, password, role }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    setUser(newUser)
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    return true
  }

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    isLoading
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}