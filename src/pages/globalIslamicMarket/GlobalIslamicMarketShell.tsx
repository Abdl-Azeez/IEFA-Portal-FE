import { useEffect, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { SUB_TABS, TAB_COMPONENTS } from './components'

function GlobalIslamicMarketShell() {
  const [activeTab, setActiveTab] = useState('Global Glance')
  const [displayTab, setDisplayTab] = useState('Global Glance')
  const [mounted, setMounted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [transitionProgress, setTransitionProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setMounted(false)
    setTransitionProgress(0)

    const swapTimer = setTimeout(() => {
      setDisplayTab(activeTab)
      setMounted(true)
      const el = document.getElementById('gim-content')
      if (el) {
        el.scrollTop = 0
      }
    }, 150)

    const progressTimer = setTimeout(() => setTransitionProgress(100), 20)

    return () => {
      clearTimeout(swapTimer)
      clearTimeout(progressTimer)
    }
  }, [activeTab])

  const ActiveSection = TAB_COMPONENTS[displayTab]

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {loading && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 animate-spin [animation-duration:3s]">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-teal-500"
                  style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-32px) rotate(45deg)` }}
                />
              ))}
            </div>
            <p className="text-sm text-teal-600 animate-pulse">Loading Global Islamic Finance Data...</p>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-50 h-0.5 bg-gray-50">
        <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${transitionProgress}%` }} />
      </div>

      <div className="px-6 pt-5 pb-4 border-b border-gray-200 bg-gray-50/90">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
              <Globe2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold leading-tight tracking-tight">
                Global Islamic Market
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Powered by ICD–LSEG Islamic Finance Development Report 2025
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live Data 2024</span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-3 border-b border-gray-200 bg-gray-50/70">
        <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {SUB_TABS.map(({ id, label, icon: Icon, accentColor }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => {
                  if (id !== activeTab) {
                    setActiveTab(id)
                  }
                }}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 shrink-0 border ${
                  isActive
                    ? 'text-white font-semibold border-transparent'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 border-gray-200'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-label={`Open ${label} tab`}
                style={
                  isActive
                    ? {
                        backgroundColor: accentColor,
                        boxShadow: `0 4px 14px ${accentColor}40`,
                      }
                    : undefined
                }
              >
                {isActive && (
                  <>
                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#ffffff' }} />
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  </>
                )}
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        id="gim-content"
        className={`p-6 min-h-[480px] max-h-screen overflow-y-auto transition-all duration-[300ms] ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <ActiveSection />
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-2">
        <div className="flex flex-col gap-1 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <span className="text-xs text-gray-400">ICD-LSEG Islamic Finance Development Report 2025</span>
          <span className="text-xs text-gray-400">Data covers 140 countries · All values in US$ billions</span>
          <span className="text-xs text-gray-400">Last Updated: 2024 · © LSEG Data & Analytics</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalIslamicMarketShell
