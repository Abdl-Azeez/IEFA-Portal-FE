import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AnimatedLayout } from './AnimatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { BackToTop } from '@/components/ui/back-to-top'

export function MainLayout() {
  const { isAdmin, isLoading } = useAuth()

  // Initialize sidebar state based on screen size
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => globalThis.window.innerWidth < 768
  )

  useEffect(() => {
    const handleResize = () => {
      if (globalThis.window.innerWidth < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
    }

    globalThis.window.addEventListener('resize', handleResize)
    return () => globalThis.window.removeEventListener('resize', handleResize)
  }, [isSidebarCollapsed])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FFEFEF' }}>
        <div className="h-8 w-8 rounded-full border-4 border-[#D52B1E] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: '#FFEFEF' }}>
      {/* Sidebar - fixed position */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      {/* Main content area shifted by sidebar width */}
      <div 
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '297px' }}
      >
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <AnimatedLayout>
            <Outlet />
          </AnimatedLayout>
        </main>
        <Footer />
      </div>
      <BackToTop />
    </div>
  )
}
