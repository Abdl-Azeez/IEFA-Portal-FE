'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(globalThis.window.scrollY > 300)
    globalThis.window.addEventListener('scroll', onScroll, { passive: true })
    return () => globalThis.window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      aria-label="Back to top"
      onClick={() => globalThis.window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-[#D52B1E] text-white shadow-lg flex items-center justify-center transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
