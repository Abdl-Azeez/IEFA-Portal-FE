import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  LogOut,
  LayoutDashboard,
  Newspaper,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Building2,
  BookOpen,
  BarChart2,
  Mic2,
  Users,
  Settings,
  HelpCircle,
  User,
  Wrench,
  BookA,
  Shield,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

/* ── Searchable navigation items ──────────────────────────────────────────── */
type SearchItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  parent?: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  // ── Top-level pages ──
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Your personalized learning overview",
    path: "/",
  },
  {
    icon: Newspaper,
    label: "News",
    description: "Latest Islamic finance news & updates",
    path: "/news",
  },
  {
    icon: TrendingUp,
    label: "Market Insights",
    description: "Market data, trends and analysis",
    path: "/market-insights",
  },
  {
    icon: GraduationCap,
    label: "Learning Zone",
    description: "Courses and learning content",
    path: "/learning-zone",
  },
  {
    icon: MessageSquare,
    label: "Community",
    description: "Discussions, forums and networking",
    path: "/community",
  },
  {
    icon: Building2,
    label: "Directory",
    description: "Islamic finance institutions & providers",
    path: "/directory",
  },
  {
    icon: BookOpen,
    label: "Resources",
    description: "Guides, publications and practical resources",
    path: "/resources",
  },
  {
    icon: BarChart2,
    label: "Data",
    description: "Islamic finance datasets and statistics",
    path: "/data",
  },
  {
    icon: Mic2,
    label: "Podcast",
    description: "Islamic finance podcast episodes",
    path: "/podcast",
  },
  {
    icon: Users,
    label: "IF Professionals",
    description: "Connect with Islamic finance professionals",
    path: "/if-professionals",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Account and notification settings",
    path: "/settings",
  },
  {
    icon: HelpCircle,
    label: "Support",
    description: "Help and support centre",
    path: "/support",
  },
  {
    icon: User,
    label: "Profile",
    description: "Your personal profile and activity",
    path: "/profile",
  },
  // ── Resources sections ──
  {
    icon: BookOpen,
    label: "Educational Guides",
    description: "Introductory guides on Islamic finance fundamentals",
    path: "/resources?tab=educational-guides",
    parent: "Resources",
  },
  {
    icon: FileText,
    label: "Research & Publications",
    description: "Academic journals, white papers and industry reports",
    path: "/resources?tab=research-publications",
    parent: "Resources",
  },
  {
    icon: Shield,
    label: "Standards & Governance",
    description: "AAOIFI, IFSB and regulatory standards",
    path: "/resources?tab=standards-governance",
    parent: "Resources",
  },
  {
    icon: Wrench,
    label: "Tools & Practical Resources",
    description: "Templates, calculators and planning worksheets",
    path: "/resources?tab=tools-practical",
    parent: "Resources",
  },
  {
    icon: BookA,
    label: "Glossary",
    description: "Islamic finance terms and definitions",
    path: "/resources?tab=glossary",
    parent: "Resources",
  },
  // ── Directory — Financial ──
  {
    icon: Building2,
    label: "Financial Service Providers",
    description: "Banks, takaful, fintech and capital markets",
    path: "/directory?sector=financial",
    parent: "Directory",
  },
  {
    icon: Building2,
    label: "Islamic Banks",
    description: "Full-service Shariah-compliant banking institutions",
    path: "/directory?sector=financial&category=Islamic+Banks",
    parent: "Directory",
  },
  {
    icon: Shield,
    label: "Takaful Providers",
    description: "Islamic insurance and risk-sharing operators",
    path: "/directory?sector=financial&category=Takaful+Providers",
    parent: "Directory",
  },
  {
    icon: TrendingUp,
    label: "Asset Management",
    description: "Shariah-compliant fund and portfolio managers",
    path: "/directory?sector=financial&category=Asset+Management",
    parent: "Directory",
  },
  {
    icon: BarChart2,
    label: "Capital Markets",
    description: "Sukuk, Islamic equity and market intermediaries",
    path: "/directory?sector=financial&category=Capital+Markets",
    parent: "Directory",
  },
  {
    icon: Settings,
    label: "Islamic Fintech",
    description: "Technology-driven Islamic financial services",
    path: "/directory?sector=financial&category=Islamic+Fintech",
    parent: "Directory",
  },
  {
    icon: BookA,
    label: "Shariah Advisory",
    description: "Shariah boards, scholars and advisory firms",
    path: "/directory?sector=financial&category=Shariah+Advisory",
    parent: "Directory",
  },
  // ── Directory — Non-Financial ──
  {
    icon: Users,
    label: "Non-Financial Service Providers",
    description: "Research, legal, education and regulatory bodies",
    path: "/directory?sector=non-financial",
    parent: "Directory",
  },
  {
    icon: FileText,
    label: "Research Institutions",
    description: "Islamic finance research centres and think tanks",
    path: "/directory?sector=non-financial&category=Research+Institutions",
    parent: "Directory",
  },
  {
    icon: GraduationCap,
    label: "Education & Training",
    description: "Universities and professional training providers",
    path: "/directory?sector=non-financial&category=Education+%26+Training",
    parent: "Directory",
  },
  {
    icon: Shield,
    label: "Regulatory Bodies",
    description: "Central banks and Islamic finance regulators",
    path: "/directory?sector=non-financial&category=Regulatory+Bodies",
    parent: "Directory",
  },
  {
    icon: MessageSquare,
    label: "Legal Services",
    description: "Law firms specialising in Islamic finance",
    path: "/directory?sector=non-financial&category=Legal+Services",
    parent: "Directory",
  },
  {
    icon: Users,
    label: "Scholars & Experts",
    description: "Shariah scholars and subject-matter experts",
    path: "/directory?sector=non-financial&category=Scholars+%26+Experts",
    parent: "Directory",
  },
];

export function Header() {
  const [notifications] = useState(3);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const initials =
    [storeUser?.firstName, storeUser?.lastName]
      .filter(Boolean)
      .map((n) => n!.charAt(0).toUpperCase())
      .join("") ||
    storeUser?.email?.charAt(0).toUpperCase() ||
    "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide when scrolling down, show when scrolling up
      // Add a small threshold (e.g., 10px) to prevent flickering
      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults =
    searchQuery.trim().length > 0
      ? SEARCH_ITEMS.filter(
          (item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 8)
      : [];

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
          ref={searchRef}
          className="relative flex-1 max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737692] z-10" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowResults(false);
                setSearchQuery("");
              }
            }}
            placeholder="Search anything..."
            className="w-full rounded-full border-0 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm"
            style={{ color: "#000000" }}
          />
          {showResults && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-[#737692]">
                    No results for &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {searchResults.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.label + item.path}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setSearchQuery("");
                          setShowResults(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                          <ItemIcon className="h-4 w-4 text-[#D52B1E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">
                              {item.label}
                            </p>
                            {item.parent && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                                {item.parent}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#737692] truncate">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40 cursor-pointer">
              <AvatarImage src={storeUser?.profilePhotoUrl ?? ""} alt="User" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="hidden md:block pr-2">
            <p className="text-sm font-medium" style={{ color: "#000000" }}>
              {storeUser?.firstName
                ? `${storeUser.firstName} ${storeUser.lastName ?? ""}`.trim()
                : user?.email || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Guest"}
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
