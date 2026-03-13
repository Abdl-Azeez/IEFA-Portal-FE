import { motion } from 'framer-motion'
import { Bell, Search, LogOut } from "lucide-react";
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '@/stores/auth';

export function Header() {
  const [notifications] = useState(3)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { user, logout } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const initials = [storeUser?.firstName, storeUser?.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join('') || storeUser?.email?.charAt(0).toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide when scrolling down, show when scrolling up
      // Add a small threshold (e.g., 10px) to prevent flickering
      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 transition-all duration-200 mt-8"
      style={{ backgroundColor: "transparent" }}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-1 items-center gap-4">
        <motion.div
          className="relative flex-1 max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737692]" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full border-0 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm"
            style={{ color: "#000000" }}
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative bg-white rounded-full shadow-sm hover:bg-white/80"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Bell className="h-5 w-5 text-[#737692]" />
            </motion.div>
            {notifications > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
              >
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white border-0">
                  {notifications}
                </Badge>
              </motion.div>
            )}
          </Button>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 bg-white rounded-full px-3 py-1.5 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/profile')}>
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40 cursor-pointer">
              <AvatarImage
                src={storeUser?.profilePhotoUrl ?? ''}
                alt="User"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="hidden md:block pr-2">
            <p className="text-sm font-medium" style={{ color: "#000000" }}>
              {storeUser?.firstName ? `${storeUser.firstName} ${storeUser.lastName ?? ''}`.trim() : (user?.email || 'User')}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'Guest'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
