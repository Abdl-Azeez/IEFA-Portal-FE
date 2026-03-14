import { motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Mic,
  GraduationCap,
  FileText,
  Database,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  children?: { name: string; href: string; icon: React.ElementType }[]
}

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "News", href: "/admin/news", icon: Newspaper },
  { name: "Podcasts", href: "/admin/podcasts", icon: Mic },
  { name: "Learning Management", href: "/admin/learning", icon: GraduationCap },
  { name: "Resources", href: "/admin/research", icon: FileText },
  { name: "Data Management", href: "/admin/data", icon: Database },
  {
    name: "IF Professionals",
    href: "/admin/if-professionals",
    icon: Briefcase,
  },
  { name: "Community", href: "/admin/community", icon: MessageSquare },
  { name: "Directory", href: "/admin/directory", icon: FolderOpen },
];

const bottomNav: NavItem[] = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface Props {
  readonly isCollapsed: boolean
  readonly onToggle: () => void
}

export function AdminSidebar({ isCollapsed, onToggle }: Props) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [learningOpen, setLearningOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      className={cn(
        'absolute left-0 top-0 z-40 min-h-screen h-full transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-[280px]',
      )}
      style={{ backgroundColor: '#0f172a', boxShadow: '4px 0 24px rgba(0,0,0,0.35)' }}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* Logo */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 flex items-center py-5 transition-all duration-300 border-b border-white/8',
          isCollapsed ? 'w-20 justify-center px-2' : 'w-[280px] px-5',
        )}
        style={{ backgroundColor: '#0f172a' }}
      >
        {isCollapsed ? (
          <div className="h-9 w-9 rounded-xl bg-[#D52B1E] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#D52B1E] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">IEFA Admin</p>
              <p className="text-slate-400 text-xs mt-0.5">Management Portal</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-50 flex h-5 w-5 items-center justify-center rounded bg-slate-700 shadow-lg hover:bg-slate-600 border border-slate-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-slate-200" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-slate-200" />
          )}
        </button>
      </div>

      <div className="flex h-full flex-col pt-24 pb-4 overflow-y-auto">
        {/* Main Nav */}
        <div className="px-3 space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Administration
            </p>
          )}

          {adminNav.map((item, index) => {
            if (item.children) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (!isCollapsed) setLearningOpen((v) => !v)
                    }}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      'text-slate-400 hover:bg-white/8 hover:text-white',
                      isCollapsed && 'justify-center',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {learningOpen ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </>
                    )}
                  </button>
                  {learningOpen && !isCollapsed && (
                    <div className="ml-4 mt-0.5 mb-1 space-y-0.5">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.href}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200',
                              isActive
                                ? 'bg-[#D52B1E] text-white'
                                : 'text-slate-400 hover:bg-white/8 hover:text-white',
                            )
                          }
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/admin'}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-[#D52B1E] text-white'
                      : 'text-slate-400 hover:bg-white/8 hover:text-white',
                    isCollapsed && 'justify-center',
                  )
                }
              >
                {({ isActive }) => (
                  <motion.div
                    className="flex items-center gap-3 w-full"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                      )}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </motion.div>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Bottom nav */}
        <div className="mt-auto px-3 pt-4 border-t border-white/8 space-y-0.5">
          {bottomNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#D52B1E] text-white'
                    : 'text-slate-400 hover:bg-white/8 hover:text-white',
                  isCollapsed && 'justify-center',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'text-slate-400 hover:bg-red-500/20 hover:text-red-400',
              isCollapsed && 'justify-center',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
