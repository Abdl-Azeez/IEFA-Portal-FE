import { motion } from 'framer-motion'
import { Bell, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '@/stores/auth';

export function AdminHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { user, logout } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const initials = [storeUser?.firstName, storeUser?.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join('') || storeUser?.email?.charAt(0).toUpperCase() || 'A';

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setIsVisible(current <= lastScrollY.current || current <= 20);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 mt-6"
      style={{ backgroundColor: "transparent" }}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-full border-0 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/20 shadow-sm transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-white rounded-full shadow-sm hover:bg-white/80"
        >
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#D52B1E] text-[9px] text-white flex items-center justify-center font-bold">
            3
          </span>
        </Button>

        {/* Admin badge */}
        <button
          onClick={() => navigate('/admin/profile')}
          className="flex items-center gap-2.5 bg-white rounded-full shadow-sm px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {storeUser?.profilePhotoUrl ? (
            <img
              src={storeUser.profilePhotoUrl}
              alt="Profile"
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-[#D52B1E] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">
              {storeUser?.firstName ? `${storeUser.firstName} ${storeUser.lastName ?? ''}`.trim() : (user?.email ?? 'Admin')}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
              {user?.role}
            </p>
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </motion.header>
  );
}
