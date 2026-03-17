import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Newspaper, TrendingUp, BookOpen, Settings, HelpCircle, Users, ChevronLeft, ChevronRight, FolderOpen, FileText, Database, Mic, Briefcase, UserCircle, Calculator, Coins, Wrench } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

// Menu section items
const menuNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Market Insights", href: "/market-insights", icon: TrendingUp },
  { name: "Learning Zone", href: "/learning-zone", icon: BookOpen },
  { name: "Community", href: "/community", icon: Users },
  { name: "Directory", href: "/directory", icon: FolderOpen },
  { name: "Resources", href: "/resources", icon: FileText },
  { name: "Data", href: "/data", icon: Database },
  { name: "Podcast", href: "/podcast", icon: Mic },
  { name: "IF Professionals", href: "/if-professionals", icon: Briefcase },
];

// Help section items
const helpNavigation = [
  { name: 'Profile', href: '/profile', icon: UserCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Support', href: '/support', icon: HelpCircle },
]

const toolsNavigation = [
  { name: 'Zakat Calculator', href: '/tools/zakat', icon: Calculator },
  { name: 'Halal Stock Screening', href: '/tools/halal-stocks', icon: TrendingUp },
  { name: 'Halal Crypto Screening', href: '/tools/halal-crypto', icon: Coins },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isToolsActive = location.pathname.startsWith('/tools')
  const [toolsOpen, setToolsOpen] = useState(isToolsActive)

  const visibleMenuNavigation = isAuthenticated ? menuNavigation : menuNavigation.filter(item => item.name === 'Dashboard')

  return (
    <motion.aside 
      className={cn(
        "absolute left-0 top-0 z-40 min-h-screen h-full transition-all duration-300",
        isCollapsed ? "w-20" : "w-[297px]"
      )}
      style={{ 
        backgroundColor: 'white',
        boxShadow: '10px 0 50px rgba(0, 0, 0, 0.2)' // "very thick shadow"
      }}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* Logo Section - Fixed at top, stays visible while scrolling */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 bg-white flex items-center py-8 transition-all duration-300",
          isCollapsed ? "w-20 justify-center px-2" : "w-[297px] justify-center px-6"
        )}
      >
        <motion.img 
          src="/Logo.svg" 
          alt="IEFA Logo" 
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "h-10 w-auto" : "h-16 w-auto"
          )}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        />
        {/* Toggle Button - Small box on the right side of logo section */}
        <button
          onClick={onToggle}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-50 flex h-5 w-5 items-center justify-center rounded bg-white shadow-lg hover:bg-gray-50 focus:outline-none border border-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-700" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-700" />
          )}
        </button>
      </div>

      <div className="flex h-full flex-col pt-28">
        {/* Menu Section */}
        <div className="px-4">
          {!isCollapsed && (
            <motion.p 
              className="px-3 mt-5 mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6F70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Menu
            </motion.p>
          )}
          <nav className="space-y-1">
            {visibleMenuNavigation.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    "hover:bg-[#FFEFEF]",
                    isActive
                      ? "bg-primary text-white"
                      : "text-[#737692]",
                    isCollapsed && "justify-center"
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary rounded-lg"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div 
                      className="relative z-10 flex items-center gap-2 w-full"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className={cn(
                          "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                          isActive ? "text-white" : "text-[#737692] group-hover:text-primary"
                        )} />
                      </motion.div>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className={isActive ? "text-white" : ""}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Tools sub-menu */}
          {isAuthenticated && (
            <div className="mt-1">
              <button
                onClick={() => setToolsOpen((o) => !o)}
                title={isCollapsed ? 'Tools' : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 w-full relative overflow-hidden hover:bg-[#FFEFEF] ${
                  isToolsActive ? 'bg-primary text-white' : 'text-[#737692]'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {isToolsActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-lg"
                    layoutId="activeNavTools"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  className="relative z-10 flex items-center gap-2 w-full"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Wrench className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isToolsActive ? 'text-white' : 'text-[#737692] group-hover:text-primary'}`} />
                  </motion.div>
                  {!isCollapsed && (
                    <>
                      <span className={isToolsActive ? 'text-white flex-1 text-left' : 'flex-1 text-left'}>Tools</span>
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-90' : ''} ${isToolsActive ? 'text-white' : 'text-[#737692]'}`} />
                    </>
                  )}
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {toolsOpen && !isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-3 border-l border-gray-100 space-y-0.5 py-1">
                      {toolsNavigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            `group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden hover:bg-[#FFEFEF] ${
                              isActive ? 'bg-primary text-white' : 'text-[#737692]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <motion.div
                                  className="absolute inset-0 bg-primary rounded-lg"
                                  layoutId={`activeToolNav-${item.name}`}
                                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                              )}
                              <div className="relative z-10 flex items-center gap-2">
                                <item.icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#737692] group-hover:text-primary'}`} />
                                <span className={isActive ? 'text-white text-xs' : 'text-xs'}>{item.name}</span>
                              </div>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed: show tool sub-items as icon-only */}
              {toolsOpen && isCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {toolsNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      title={item.name}
                      className={({ isActive }) =>
                        `flex items-center justify-center rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-[#FFEFEF] ${
                          isActive ? 'bg-primary text-white' : 'text-[#737692]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <item.icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#737692]'}`} />
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer to push Help section to bottom */}
        {/* <div className="flex-1" /> */}

        {/* Help Section - Positioned towards the bottom */}
        {isAuthenticated && (
          <div className="px-4 pb-8 mt-24">
            {!isCollapsed && (
              <motion.p 
                className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6F70]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Help
              </motion.p>
            )}
            <nav className="space-y-1">
              {helpNavigation.map((item, index) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      "hover:bg-[#FFEFEF]",
                      isActive
                        ? "bg-primary text-white"
                        : "text-[#737692]",
                      isCollapsed && "justify-center"
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-primary rounded-lg"
                          layoutId="activeNavHelp"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <motion.div 
                        className="relative z-10 flex items-center gap-2 w-full"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                            isActive ? "text-white" : "text-[#737692] group-hover:text-primary"
                          )} />
                        </motion.div>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className={isActive ? "text-white" : ""}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </motion.div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
