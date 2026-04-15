import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  LogOut,
  ChevronRight,
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
  BookOpen,
  UserCheck,
  Briefcase,
  User,
  Globe,
  Mail,
  Lock,
  Palette,
  Radio,
  Headphones,
  Flag,
  CheckCircle,
  Building2,
  Shield,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Download,
  Star,
  BookA,
  Wrench,
  Eye,
  UserCog,
  GraduationCap as GradCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

/* ── Searchable admin navigation items ───────────────────────────────────── */
type SearchItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  parent?: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  // ── Top-level ──
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Admin overview, stats and key metrics",
    path: "/admin",
  },

  // ── Users ──
  {
    icon: Users,
    label: "Users",
    description: "Manage all user accounts and roles",
    path: "/admin/users",
  },
  {
    icon: GraduationCap,
    label: "Student Users",
    description: "View and manage student accounts",
    path: "/admin/users",
    parent: "Users",
  },
  {
    icon: UserCheck,
    label: "Educator Users",
    description: "View and manage educator accounts",
    path: "/admin/users",
    parent: "Users",
  },
  {
    icon: Shield,
    label: "Moderator Users",
    description: "View and manage community moderators",
    path: "/admin/users",
    parent: "Users",
  },
  {
    icon: UserCog,
    label: "Admin Users",
    description: "View and manage admin accounts",
    path: "/admin/users",
    parent: "Users",
  },

  // ── News ──
  {
    icon: Newspaper,
    label: "News",
    description: "Publish and manage news articles",
    path: "/admin/news",
  },
  {
    icon: CheckCircle,
    label: "Published Articles",
    description: "All published news articles",
    path: "/admin/news",
    parent: "News",
  },
  {
    icon: FileText,
    label: "Draft Articles",
    description: "News articles saved as drafts",
    path: "/admin/news",
    parent: "News",
  },

  // ── Podcasts ──
  {
    icon: Mic,
    label: "Podcasts",
    description: "Manage podcast shows and episodes",
    path: "/admin/podcasts",
  },
  {
    icon: Radio,
    label: "Podcast Shows",
    description: "Create and manage podcast show listings",
    path: "/admin/podcasts",
    parent: "Podcasts",
  },
  {
    icon: Headphones,
    label: "Podcast Episodes",
    description: "Upload and manage individual podcast episodes",
    path: "/admin/podcasts",
    parent: "Podcasts",
  },

  // ── Academy ──
  {
    icon: ShieldCheck,
    label: "Academy Management",
    description: "Courses, analytics, enrollments and content",
    path: "/admin/academy",
  },
  {
    icon: BookOpen,
    label: "Courses",
    description: "Create and manage academy courses",
    path: "/admin/academy/courses",
    parent: "Academy",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    description: "View academy engagement and performance metrics",
    path: "/admin/academy/analytics",
    parent: "Academy",
  },
  {
    icon: Users,
    label: "Enrollments",
    description: "Track student enrollments and course access",
    path: "/admin/academy/enrollments",
    parent: "Academy",
  },
  {
    icon: FileText,
    label: "Content",
    description: "Manage course content, sections, lessons, and quizzes",
    path: "/admin/academy/content",
    parent: "Academy",
  },

  // ── Resources ──
  {
    icon: FileText,
    label: "Resources",
    description: "Educational guides, publications and tools",
    path: "/admin/research",
  },
  {
    icon: BookOpen,
    label: "Educational Guides",
    description: "Introductory guides on Islamic finance fundamentals",
    path: "/admin/research?tab=educational",
    parent: "Resources",
  },
  {
    icon: FileText,
    label: "Research & Publications",
    description: "Academic journals, white papers and industry reports",
    path: "/admin/research?tab=research",
    parent: "Resources",
  },
  {
    icon: Shield,
    label: "Standards & Governance",
    description: "AAOIFI, IFSB and regulatory standards documents",
    path: "/admin/research?tab=standards",
    parent: "Resources",
  },
  {
    icon: Wrench,
    label: "Tools & Practical Resources",
    description: "Templates, calculators and planning worksheets",
    path: "/admin/research?tab=tools",
    parent: "Resources",
  },
  {
    icon: BookA,
    label: "Glossary",
    description: "Islamic finance terms and definitions",
    path: "/admin/research?tab=glossary",
    parent: "Resources",
  },

  // ── Data ──
  {
    icon: Database,
    label: "Data Management",
    description: "Datasets, statistics and data uploads",
    path: "/admin/data",
  },
  {
    icon: Download,
    label: "Datasets",
    description: "Browse and manage published datasets",
    path: "/admin/data",
    parent: "Data",
  },
  {
    icon: BarChart2,
    label: "Data Categories",
    description: "Manage dataset category taxonomy",
    path: "/admin/data",
    parent: "Data",
  },

  // ── IF Professionals ──
  {
    icon: Briefcase,
    label: "IF Professionals",
    description: "Manage Islamic finance professional profiles",
    path: "/admin/if-professionals",
  },
  {
    icon: TrendingUp,
    label: "Early Career Professionals",
    description: "Profiles for early-career Islamic finance practitioners",
    path: "/admin/if-professionals",
    parent: "IF Professionals",
  },
  {
    icon: Briefcase,
    label: "Mid-Career Professionals",
    description: "Profiles for mid-career Islamic finance practitioners",
    path: "/admin/if-professionals",
    parent: "IF Professionals",
  },
  {
    icon: Star,
    label: "Senior Professionals",
    description: "Profiles for senior Islamic finance practitioners",
    path: "/admin/if-professionals",
    parent: "IF Professionals",
  },

  // ── Community ──
  {
    icon: MessageSquare,
    label: "Community",
    description: "Moderate discussions, posts and member interactions",
    path: "/admin/community",
  },
  {
    icon: Flag,
    label: "Flagged Posts",
    description: "Review and action user-reported community posts",
    path: "/admin/community",
    parent: "Community",
  },
  {
    icon: Eye,
    label: "Active Discussions",
    description: "Currently active community discussion threads",
    path: "/admin/community",
    parent: "Community",
  },
  {
    icon: Users,
    label: "Community Members",
    description: "View and manage community member activity",
    path: "/admin/community",
    parent: "Community",
  },

  // ── Directory ──
  {
    icon: FolderOpen,
    label: "Directory",
    description: "Institutions, providers and directory listings",
    path: "/admin/directory",
  },
  {
    icon: Building2,
    label: "Financial Service Providers",
    description: "Banks, takaful, fintech and capital market firms",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: Building2,
    label: "Islamic Banks",
    description: "Full-service Shariah-compliant banking institutions",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: Shield,
    label: "Takaful Providers",
    description: "Islamic insurance and risk-sharing operators",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: TrendingUp,
    label: "Asset Management",
    description: "Shariah-compliant fund and portfolio managers",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: BarChart2,
    label: "Capital Markets",
    description: "Sukuk, Islamic equity and market intermediaries",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: Settings,
    label: "Islamic Fintech",
    description: "Technology-driven Islamic financial services",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: BookA,
    label: "Shariah Advisory",
    description: "Shariah boards, scholars and advisory firms",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: Users,
    label: "Non-Financial Providers",
    description: "Research, legal, education and regulatory bodies",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: FileText,
    label: "Research Institutions",
    description: "Islamic finance research centres and think tanks",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: GradCap,
    label: "Education & Training",
    description: "Universities and professional training providers",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: Shield,
    label: "Regulatory Bodies",
    description: "Central banks and Islamic finance regulators",
    path: "/admin/directory",
    parent: "Directory",
  },
  {
    icon: MessageSquare,
    label: "Legal Services",
    description: "Law firms specialising in Islamic finance",
    path: "/admin/directory",
    parent: "Directory",
  },

  // ── Settings ──
  {
    icon: Settings,
    label: "Settings",
    description: "Portal configuration and admin settings",
    path: "/admin/settings",
  },
  {
    icon: Globe,
    label: "General Settings",
    description: "Site name, timezone, language and regional options",
    path: "/admin/settings",
    parent: "Settings",
  },
  {
    icon: Mail,
    label: "Email Settings",
    description: "Email templates, SMTP and notification delivery",
    path: "/admin/settings",
    parent: "Settings",
  },
  {
    icon: Bell,
    label: "Notification Settings",
    description: "Push, in-app and email notification preferences",
    path: "/admin/settings",
    parent: "Settings",
  },
  {
    icon: Lock,
    label: "Security Settings",
    description: "Password policy, 2FA and session management",
    path: "/admin/settings",
    parent: "Settings",
  },
  {
    icon: Palette,
    label: "Appearance",
    description: "Theme, branding colours and portal appearance",
    path: "/admin/settings",
    parent: "Settings",
  },

  // ── Profile ──
  {
    icon: User,
    label: "Profile",
    description: "Your admin account profile and preferences",
    path: "/admin/profile",
  },
];

export function AdminHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const profileImageUrl = storeUser?.profilePhotoUrl ?? user?.profilePhotoUrl ?? "";

  const initials =
    [storeUser?.firstName, storeUser?.lastName]
      .filter(Boolean)
      .map((n) => n!.charAt(0).toUpperCase())
      .join("") ||
    storeUser?.email?.charAt(0).toUpperCase() ||
    "A";

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setIsVisible(current <= lastScrollY.current || current <= 20);
      lastScrollY.current = current;
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const searchResults =
    searchQuery.trim().length > 0
      ? SEARCH_ITEMS.filter((item) => {
          const q = searchQuery.toLowerCase();
          return (
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.parent?.toLowerCase().includes(q) ?? false)
          );
        }).slice(0, 10)
      : [];

  return (
    <motion.header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 mt-6"
      style={{ backgroundColor: "transparent" }}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
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
          placeholder="Search admin portal..."
          className="w-full rounded-full border-0 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/20 shadow-sm transition-all"
        />
        {showResults && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-400">
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
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
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
                        <p className="text-xs text-slate-400 truncate">
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
          onClick={() => navigate("/admin/profile")}
          className="flex items-center gap-2.5 bg-white rounded-full shadow-sm px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
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
              {storeUser?.firstName
                ? `${storeUser.firstName} ${storeUser.lastName ?? ""}`.trim()
                : (user?.email ?? "Admin")}
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
