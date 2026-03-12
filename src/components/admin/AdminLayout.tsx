import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AnimatedLayout } from '@/components/layout/AnimatedLayout'

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() =>
    globalThis.window === undefined ? true : globalThis.window.innerWidth < 768,
  )

  useEffect(() => {
    const onResize = () => {
      if (globalThis.window.innerWidth < 768) setIsCollapsed(true)
    }
    globalThis.window.addEventListener('resize', onResize)
    return () => globalThis.window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="overflow-x-hidden" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <div className="relative" style={{ minHeight: '100vh' }}>
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((v) => !v)}
        />
        <div
          className="flex flex-col transition-all duration-300"
          style={{ marginLeft: isCollapsed ? '80px' : '280px', minHeight: '100vh' }}
        >
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6">
            <AnimatedLayout>
              <Outlet />
            </AnimatedLayout>
          </main>
        </div>
      </div>
    </div>
  )
}
