import { motion } from 'framer-motion'
import {
  CheckCheck,
  Bell,
  BellRing,
  Clock3,
  ExternalLink,
  Search,
  LogOut,
  LayoutDashboard,
  Newspaper,
  TrendingUp,
  GraduationCap,
  Headphones,
  MessageSquare,
  Building2,
  Briefcase,
  BookOpen,
  CalendarDays,
  BarChart2,
  CreditCard,
  Globe,
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
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/hooks/use-toast";
import {
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
  type NotificationItem,
} from "@/hooks/useNotifications";

/* ── Searchable navigation items ──────────────────────────────────────────── */
type SearchItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  parent?: string;
  keywords?: string[];
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
    keywords: ["markets", "indices", "sukuk", "stocks"],
  },
  {
    icon: GraduationCap,
    label: "Learning Zone",
    description: "Courses and learning content",
    path: "/learning-zone",
    keywords: ["courses", "lessons", "training"],
  },
  {
    icon: MessageSquare,
    label: "Community",
    description: "Discussions, forums and networking",
    path: "/community",
    keywords: ["groups", "events", "mentorship"],
  },
  {
    icon: Building2,
    label: "Directory",
    description: "Islamic finance institutions & providers",
    path: "/directory",
    keywords: ["institutions", "service providers", "organizations"],
  },
  {
    icon: BookOpen,
    label: "Resources",
    description: "Guides, publications and practical resources",
    path: "/resources",
    keywords: ["guides", "publications", "standards"],
  },
  {
    icon: BarChart2,
    label: "Data",
    description: "Islamic finance datasets and statistics",
    path: "/data",
    keywords: ["datasets", "metrics", "analytics"],
  },
  {
    icon: Mic2,
    label: "Podcast",
    description: "Islamic finance podcast episodes",
    path: "/podcast",
    keywords: ["shows", "episodes", "playlists"],
  },
  {
    icon: Users,
    label: "IF Professionals",
    description: "Connect with Islamic finance professionals",
    path: "/if-professionals",
    keywords: ["experts", "directory", "linkedin"],
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "Mentions, replies and account activity",
    path: "/notifications",
    keywords: ["alerts", "activity"],
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
    keywords: ["help", "contact"],
  },
  {
    icon: User,
    label: "Profile",
    description: "Your personal profile and activity",
    path: "/profile",
    keywords: ["account", "bio"],
  },
  {
    icon: BookOpen,
    label: "Course Results",
    description: "Browse and enroll in available courses",
    path: "/course-results",
    parent: "Learning Zone",
    keywords: ["catalog", "course explorer", "enrollment"],
  },
  {
    icon: FileText,
    label: "Questionnaire",
    description: "Complete onboarding and preference questionnaires",
    path: "/questionnaire",
    keywords: ["onboarding", "survey"],
  },
  {
    icon: Wrench,
    label: "Zakat Calculator",
    description: "Calculate zakat obligations",
    path: "/tools/zakat",
    parent: "Tools",
    keywords: ["zakat", "calculator", "charity"],
  },
  {
    icon: TrendingUp,
    label: "Halal Stock Screening",
    description: "Check stocks against halal screening criteria",
    path: "/tools/halal-stocks",
    parent: "Tools",
    keywords: ["stocks", "screening", "halal"],
  },
  {
    icon: TrendingUp,
    label: "Halal Crypto Screening",
    description: "Evaluate digital assets using halal screening criteria",
    path: "/tools/halal-crypto",
    parent: "Tools",
    keywords: ["crypto", "screening", "halal"],
  },
  // ── Market Insights tabs ──
  {
    icon: TrendingUp,
    label: "Global Islamic Market",
    description: "Shariah market overview with macro indicators",
    path: "/market-insights?tab=global-islamic",
    parent: "Market Insights",
    keywords: ["global islamic", "overview", "market pulse"],
  },
  {
    icon: TrendingUp,
    label: "Global Market",
    description: "Global market cards, indices and top performers",
    path: "/market-insights?tab=global",
    parent: "Market Insights",
    keywords: ["indices", "gainers", "losers"],
  },
  {
    icon: TrendingUp,
    label: "NGX Market",
    description: "Nigerian Exchange market insights",
    path: "/market-insights?tab=ngx",
    parent: "Market Insights",
  },
  {
    icon: TrendingUp,
    label: "NGX Islamic",
    description: "Islamic-focused Nigerian Exchange market view",
    path: "/market-insights?tab=ngx-islamic",
    parent: "Market Insights",
  },
  {
    icon: TrendingUp,
    label: "Crypto Market",
    description: "Digital asset market metrics",
    path: "/market-insights?tab=crypto",
    parent: "Market Insights",
  },
  {
    icon: TrendingUp,
    label: "Halal Crypto",
    description: "Halal-screened crypto market view",
    path: "/market-insights?tab=halal-crypto",
    parent: "Market Insights",
  },
  // ── Learning Zone tabs ──
  {
    icon: BookOpen,
    label: "My Learning",
    description: "Track enrollments, progress and upcoming activities",
    path: "/learning-zone?tab=my-learning",
    parent: "Learning Zone",
  },
  {
    icon: GraduationCap,
    label: "Browse Courses",
    description: "Explore courses and open course explorer",
    path: "/learning-zone?tab=courses",
    parent: "Learning Zone",
  },
  {
    icon: CreditCard,
    label: "Learning Payments",
    description: "View payment history and invoices",
    path: "/learning-zone?tab=payments",
    parent: "Learning Zone",
  },
  {
    icon: BookA,
    label: "Learning Results & Certificates",
    description: "Review course results and certificates",
    path: "/learning-zone?tab=results",
    parent: "Learning Zone",
  },
  // ── Community tabs ──
  {
    icon: MessageSquare,
    label: "Community Discussions",
    description: "Explore latest discussions from members",
    path: "/community?tab=discussions",
    parent: "Community",
  },
  {
    icon: Users,
    label: "Community Groups",
    description: "Join and participate in study groups",
    path: "/community?tab=study-groups",
    parent: "Community",
  },
  {
    icon: Users,
    label: "Community Mentorship",
    description: "Mentorship opportunities and guidance",
    path: "/community?tab=mentorship",
    parent: "Community",
  },
  {
    icon: CalendarDays,
    label: "Community Events",
    description: "Upcoming events, workshops and sessions",
    path: "/community?tab=events",
    parent: "Community",
  },
  {
    icon: BookOpen,
    label: "Saved Community Posts",
    description: "Your bookmarked community content",
    path: "/community?tab=bookmarks",
    parent: "Community",
  },
  // ── Directory sectors ──
  {
    icon: Building2,
    label: "Directory Financial Sector",
    description: "Browse financial institutions and providers",
    path: "/directory?sector=financial",
    parent: "Directory",
  },
  {
    icon: Users,
    label: "Directory Non-Financial Sector",
    description: "Browse legal, research, education and advisory bodies",
    path: "/directory?sector=non-financial",
    parent: "Directory",
  },
  // ── Resources sections ──
  {
    icon: Shield,
    label: "Regulatory Resources",
    description: "Browse regulatory bodies and circulars",
    path: "/resources?category=regulatory",
    parent: "Resources",
  },
  {
    icon: BookOpen,
    label: "Educational Guides",
    description: "Introductory guides on Islamic finance fundamentals",
    path: "/resources?category=general&sub=educational-guides",
    parent: "Resources",
  },
  {
    icon: FileText,
    label: "Research & Publications",
    description: "Academic journals, white papers and industry reports",
    path: "/resources?category=general&sub=research-publications",
    parent: "Resources",
  },
  {
    icon: Shield,
    label: "Standards & Governance",
    description: "AAOIFI, IFSB and regulatory standards",
    path: "/resources?category=general&sub=standards-governance",
    parent: "Resources",
  },
  {
    icon: Wrench,
    label: "Tools & Practical Resources",
    description: "Templates, calculators and planning worksheets",
    path: "/resources?category=general&sub=tools-practical",
    parent: "Resources",
  },
  {
    icon: BookA,
    label: "Glossary",
    description: "Islamic finance terms and definitions",
    path: "/resources?category=general&sub=glossary",
    parent: "Resources",
  },
  // ── Data sections ──
  {
    icon: Globe,
    label: "Data Market Overview",
    description: "High-level Islamic finance market snapshot",
    path: "/data?tab=market-overview",
    parent: "Data",
  },
  {
    icon: BarChart2,
    label: "Data Islamic Banking",
    description: "Islamic banking metrics and benchmarks",
    path: "/data?tab=islamic-banking",
    parent: "Data",
  },
  {
    icon: TrendingUp,
    label: "Data Sukuk Market",
    description: "Sukuk issuance and performance indicators",
    path: "/data?tab=sukuk-market",
    parent: "Data",
  },
  {
    icon: Shield,
    label: "Data Takaful",
    description: "Islamic insurance market indicators",
    path: "/data?tab=takaful",
    parent: "Data",
  },
  {
    icon: BarChart2,
    label: "Data Islamic Capital Market",
    description: "Shariah-compliant equity and capital-market data",
    path: "/data?tab=islamic-capital-market",
    parent: "Data",
  },
  {
    icon: BookA,
    label: "Data Research & Insights",
    description: "Research-driven rankings and policy indicators",
    path: "/data?tab=research-insights",
    parent: "Data",
  },
  // ── Podcast shortcuts ──
  {
    icon: Mic2,
    label: "Podcast All Shows",
    description: "Browse all podcast shows",
    path: "/podcast?category=All",
    parent: "Podcast",
  },
  {
    icon: Headphones,
    label: "Podcast Interviews",
    description: "Jump to interview-focused podcast category",
    path: "/podcast?category=Interviews",
    parent: "Podcast",
  },
  {
    icon: Headphones,
    label: "Podcast Market Debriefs",
    description: "Jump to market-debrief podcast category",
    path: "/podcast?category=Market Debriefs",
    parent: "Podcast",
  },
  // ── IF Professionals shortcuts ──
  {
    icon: Users,
    label: "IF Professionals Local",
    description: "View local Nigerian professionals",
    path: "/if-professionals?scope=Local",
    parent: "IF Professionals",
  },
  {
    icon: Globe,
    label: "IF Professionals Global",
    description: "View globally-focused professionals",
    path: "/if-professionals?scope=Global",
    parent: "IF Professionals",
  },
  {
    icon: Shield,
    label: "IF Professionals Verified",
    description: "Filter to verified professionals",
    path: "/if-professionals?verification=Verified",
    parent: "IF Professionals",
  },
  {
    icon: Briefcase,
    label: "IF Professionals Senior",
    description: "Filter to senior-level experts",
    path: "/if-professionals?level=Senior",
    parent: "IF Professionals",
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
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notifications = 0 } = useUnreadNotificationsCount(isAuthenticated);
  const { data: notificationsPage, isLoading: isNotificationsLoading } = useNotifications({
    page: 1,
    perPage: 5,
    order: "DESC",
    enabled: isAuthenticated,
  });
  const markNotificationAsRead = useMarkNotificationAsRead();
  const profileImageUrl = storeUser?.profilePhotoUrl ?? user?.profilePhotoUrl ?? "";
  const notificationItems = notificationsPage?.data ?? [];

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
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults =
    searchQuery.trim().length > 0
      ? SEARCH_ITEMS.filter(
          (item) => {
            const query = searchQuery.toLowerCase();
            return (
              item.label.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query) ||
              item.path.toLowerCase().includes(query) ||
              item.parent?.toLowerCase().includes(query) ||
              item.keywords?.some((keyword) => keyword.toLowerCase().includes(query))
            );
          },
        ).slice(0, 12)
      : [];

  const isProtectedSearchPath = (path: string) => {
    const publicPaths = new Set(["/", "/news", "/market-insights", "/community"]);
    const basePath = path.split("?")[0];
    return !publicPaths.has(basePath);
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
    const diffDays = Math.round(diffHours / 24);
    return formatter.format(diffDays, "day");
  };

  const openNotification = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markNotificationAsRead.mutate(notification.id);
    }

    setShowNotifications(false);

    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith("/")) {
        navigate(notification.actionUrl);
        return;
      }
      globalThis.open(notification.actionUrl, "_blank", "noopener,noreferrer");
      return;
    }

    navigate("/notifications");
  };

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
                          if (!isAuthenticated && isProtectedSearchPath(item.path)) {
                            toast({
                              title: "Login required",
                              description: "Please login to access this feature.",
                            });
                            navigate("/login", {
                              state: {
                                from: `${location.pathname}${location.search}`,
                                redirectTo: item.path,
                              },
                            });
                          } else {
                            navigate(item.path);
                          }
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
          ref={notificationsRef}
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative bg-white rounded-full shadow-sm hover:bg-white/80"
            onClick={() => setShowNotifications((current) => !current)}
            aria-label="Open notifications"
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

          {showNotifications && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 top-full mt-3 w-[380px] overflow-hidden rounded-[28px] border border-[#D52B1E]/20 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,246,245,0.98)_100%)] shadow-[0_24px_80px_rgba(213,43,30,0.16)] backdrop-blur-xl"
            >
              <div className="border-b border-[#D52B1E]/15 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#D52B1E] text-white shadow-sm">
                        <BellRing className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#000000]">Notifications</h3>
                        <p className="text-xs text-[#7A8094]">Latest mentions, replies and alerts</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#FFF0ED] border border-[#D52B1E]/20 px-2.5 py-1 text-xs font-semibold text-[#D52B1E] shadow-sm">
                    {notifications} unread
                  </div>
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto px-3 py-3">
                {isNotificationsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div
                        key={`notification-preview-skeleton-${index}`}
                        className="animate-pulse rounded-[22px] border border-white/80 bg-white/85 p-4"
                      >
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-gray-200" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-28 rounded bg-gray-200" />
                            <div className="h-3 w-full rounded bg-gray-100" />
                            <div className="h-3 w-3/4 rounded bg-gray-100" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notificationItems.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FFF2EE] text-[#D52B1E]">
                      <Bell className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#111827]">No new notifications</p>
                    <p className="mt-1 text-xs leading-5 text-[#7A8094]">
                      When someone tags you or activity needs your attention, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notificationItems.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => openNotification(notification)}
                        className={[
                          "w-full rounded-[22px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                          notification.isRead
                            ? "border-[#F1E4E1] bg-white"
                            : "border-[#D52B1E]/25 bg-[#FFF9F8] shadow-[0_10px_24px_rgba(213,43,30,0.10)]",
                        ].join(" ")}
                      >
                        <div className="flex gap-3">
                          <div className={[
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            notification.isRead
                              ? "bg-[#FFF0ED] text-[#B8241B]"
                              : "bg-[#D52B1E] text-white",
                          ].join(" ")}>
                            {notification.isRead ? (
                              <CheckCheck className="h-4 w-4" />
                            ) : (
                              <BellRing className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="line-clamp-1 text-sm font-semibold text-[#111827]">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D52B1E]" />
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#636A80]">
                              {notification.actorName ? `${notification.actorName}: ` : ""}
                              {notification.message}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#8D93A6]">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium text-[#D52B1E]">
                                Open <ExternalLink className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#D52B1E]/15 bg-white/80 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/notifications");
                  }}
                  className="w-full rounded-full bg-[#D52B1E] text-white hover:bg-[#B8241B] hover:text-white"
                >
                  View all notifications
                </Button>
              </div>
            </motion.div>
          )}
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
              <AvatarImage src={profileImageUrl} alt="User" />
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
