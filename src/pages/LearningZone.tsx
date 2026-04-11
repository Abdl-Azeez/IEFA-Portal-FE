import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  GraduationCap,
  Megaphone,
  PlayCircle,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseExplorerDialog } from "@/components/learning/CourseExplorerDialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useMe } from "@/hooks/useAuth";
import {
  useEnrollInLearningCourse,
  useLearningAnnouncements,
  useLearningCourses,
  useLearningDashboard,
  useLearningMyCourses,
  useLearningPayments,
  useLearningResults,
  useLearningUpcomingActivities,
  useUnenrollFromLearningCourse,
} from "@/hooks/useLearning";
import type { StudentCourseDto, StudentEnrollmentDto } from "@/types/learning";

/* ── Animation variants ──────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function stripHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent ?? "").split(/\s+/).filter(Boolean).join(" ");
}

function formatActivityType(type: string): string {
  return type
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

/* ── Tab chip — matches category chips in Resources/Directory ─────────────── */
function TabChip({
  label,
  icon: Icon,
  active,
  onClick,
}: Readonly<{
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
        active
          ? "bg-[#D52B1E] text-white border-[#D52B1E] shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ── Enrollment card ────────────────────────────────────────────────────────── */
function EnrollmentCard({
  item,
  courseTitle,
}: Readonly<{ item: StudentEnrollmentDto; courseTitle?: string }>) {
  const programmeName = (item.programme as { title?: string } | null)?.title;
  const displayName = courseTitle ?? programmeName ?? `${item.itemType} enrollment`;

  const statusStyle: Record<string, { bg: string; text: string }> = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700" },
    active: { bg: "bg-blue-50", text: "text-blue-700" },
    in_progress: { bg: "bg-amber-50", text: "text-amber-700" },
  };
  const ss = statusStyle[item.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] to-orange-400" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${ss.bg} ${ss.text}`}
            >
              {item.status.replaceAll("_", " ")}
            </span>
            <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2 group-hover:text-[#D52B1E] transition-colors text-sm">
              {displayName}
            </h3>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-[#D52B1E]" />
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDate(item.lastActivityAt)}
            </span>
            <span className="font-bold text-[#D52B1E]">{item.progressPercent}%</span>
          </div>
          <Progress
            value={item.progressPercent}
            className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#D52B1E] [&>div]:to-orange-400"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {item.completedLessonIds?.length ?? 0} lessons done
          </span>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] hover:gap-2 transition-all">
            Continue <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Course card — mirrors OrgCard styling from Directory ───────────────────── */
function CourseCard({
  course,
  isEnrolled,
  onEnroll,
  onUnenroll,
  onExplore,
  mutating,
}: Readonly<{
  course: StudentCourseDto;
  isEnrolled: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  onExplore: () => void;
  mutating: boolean;
}>) {
  const levelColor: Record<string, string> = {
    beginner: "#059669",
    intermediate: "#d97706",
    advanced: "#D52B1E",
  };
  const lc = levelColor[course.level?.toLowerCase() ?? ""] ?? "#6d28d9";

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -3 }} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Cover */}
        <div className="h-44 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-14 h-14 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
              style={{ backgroundColor: lc }}
            >
              {course.level}
            </span>
            {course.isFree && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white bg-emerald-500">
                Free
              </span>
            )}
          </div>
          {course.educator?.profilePhotoUrl && (
            <div className="absolute bottom-3 right-3">
              <Avatar className="h-8 w-8 border-2 border-white shadow">
                <AvatarImage src={course.educator.profilePhotoUrl} />
                <AvatarFallback className="text-xs bg-white text-gray-700 font-bold">
                  {course.educator.name?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#D52B1E] transition-colors mb-1">
            {course.title}
          </h3>
          <p className="text-xs text-gray-400 mb-1">{course.educator?.name || "IEFA Educator"}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{stripHtml(course.description)}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-3 w-3" /> {course.videoCount} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {durationLabel(course.totalDurationMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {course.enrolledCount.toLocaleString()}
            </span>
          </div>

          {/* Rating + Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{course.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({course.reviewCount})</span>
            </div>
            {!course.isFree && (
              <span className="text-sm font-bold text-gray-900">${course.priceUsd}</span>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-50">
            <button
              onClick={onExplore}
              className="w-full mb-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              View Outline <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {isEnrolled ? (
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] hover:gap-2 transition-all">
                  Resume <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  onClick={onUnenroll}
                  disabled={mutating}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Unenroll
                </button>
              </div>
            ) : (
              <button
                onClick={onEnroll}
                disabled={mutating}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#D52B1E] py-1.5 rounded-full border border-[#D52B1E]/30 hover:bg-[#D52B1E]/5 transition-colors"
              >
                Enroll Now <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- Main Component ---------------------------------------- */
export function LearningZone() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showPaymentsAndResults = false;
  const allowedTabs = useMemo(
    () => new Set(showPaymentsAndResults
      ? ["my-learning", "courses", "payments", "results"]
      : ["my-learning", "courses"]),
    [showPaymentsAndResults],
  );
  const [courseSearch, setCourseSearch] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab && allowedTabs.has(tab) ? tab : "my-learning";
  });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && allowedTabs.has(tab)) {
      if (tab !== activeTab) setActiveTab(tab);
      return;
    }
    if (activeTab !== "my-learning") {
      setActiveTab("my-learning");
    }
  }, [activeTab, allowedTabs, searchParams]);

  const { data: me } = useMe();
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useLearningDashboard();
  const { data: myCourses = [], isLoading: myCoursesLoading, refetch: refetchMyCourses } = useLearningMyCourses();
  const { data: upcoming = [], isLoading: upcomingLoading, refetch: refetchUpcoming } = useLearningUpcomingActivities();
  const { data: announcements = [], isLoading: announcementsLoading, refetch: refetchAnnouncements } = useLearningAnnouncements();
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useLearningPayments(showPaymentsAndResults);
  const { data: results, isLoading: resultsLoading, refetch: refetchResults } = useLearningResults(showPaymentsAndResults);
  const { data: courseList, isLoading: coursesLoading, refetch: refetchCourses } = useLearningCourses({
    page: 1,
    perPage: 24,
    search: courseSearch || undefined,
  });

  const enrollMutation = useEnrollInLearningCourse();
  const unenrollMutation = useUnenrollFromLearningCourse();

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<number>();
    for (const item of myCourses) {
      if (typeof item.currentCourseId === "number") ids.add(item.currentCourseId);
      const n = Number(item.itemId);
      if (Number.isFinite(n)) ids.add(n);
    }
    return ids;
  }, [myCourses]);

  const fullName = [me?.firstName, me?.lastName].filter(Boolean).join(" ").trim();
  const welcomeName = fullName || me?.username || "Learner";
  const selectedCourse = useMemo(
    () => (courseList?.data ?? []).find((course) => course.id === selectedCourseId),
    [courseList?.data, selectedCourseId],
  );

  const onRefreshAll = async () => {
    if (showPaymentsAndResults) {
      await Promise.all([
        refetchDashboard(),
        refetchMyCourses(),
        refetchUpcoming(),
        refetchAnnouncements(),
        refetchCourses(),
        refetchPayments(),
        refetchResults(),
      ]);
      return;
    }

    await Promise.all([
      refetchDashboard(),
      refetchMyCourses(),
      refetchUpcoming(),
      refetchAnnouncements(),
      refetchCourses(),
    ]);
  };

  const TABS = [
    { id: "my-learning", label: "My Learning",    icon: BookOpen },
    { id: "courses",     label: "Browse Courses",  icon: GraduationCap },
  ] as const;

  const hasCourses        = (courseList?.data?.length ?? 0) > 0;
  const hasPaymentHistory = (payments?.paymentHistory?.length ?? 0) > 0;
  const totalLearners = (courseList?.data ?? []).reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const totalLearningHours = Math.round(
    (courseList?.data ?? []).reduce((sum, c) => sum + (c.totalDurationMinutes || 0), 0) / 60,
  );
  const avgCourseRating =
    (courseList?.data?.length ?? 0) > 0
      ? (courseList?.data ?? []).reduce((sum, c) => sum + (c.rating || 0), 0) / (courseList?.data?.length ?? 1)
      : 0;

  return (
    <motion.div
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero banner */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center">
          <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 w-full">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase">
                <GraduationCap className="h-3 w-3" /> IEFA Learning Zone
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Build your{" "}
                <span className="text-[#D52B1E]">Islamic Finance</span> mastery
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Track progress, continue lessons, manage subscriptions, and
                review your certifications from one learning workspace.
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-gray-600" />{" "}
                  {myCourses.length} Active Enrollments
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-gray-600" />{" "}
                  {dashboard?.stats?.certificatesEarned ?? 0} Certificates
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-gray-600" />{" "}
                  {dashboard?.stats?.weeklyProgress ?? 0}% Weekly Progress
                </span>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {myCourses.length}
                </p>
                <p className="text-xs text-gray-500">Enrolled</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#D52B1E]">
                  {dashboard?.stats?.coursesCompleted ?? 0}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {dashboard?.stats?.weeklyProgress ?? 0}%
                </p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
            <GraduationCap className="h-52 w-52" />
          </div>
        </div>
      </motion.div>

      {/* Page header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
              IEFA Learning Portal
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {welcomeName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {dashboardLoading
                ? "Loading your progress..."
                : `${dashboard?.stats?.weeklyProgress ?? 0}% weekly progress | ${dashboard?.stats?.coursesCompleted ?? 0} courses completed`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-gray-200 text-gray-600 hover:border-[#D52B1E]/40 hover:text-[#D52B1E] self-start sm:self-auto"
            onClick={() => void onRefreshAll()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: "Courses Completed",
            value: dashboard?.stats?.coursesCompleted ?? 0,
            icon: BookOpen,
            color: "#2563eb",
            bg: "#EFF6FF",
          },
          {
            label: "Certificates Earned",
            value: dashboard?.stats?.certificatesEarned ?? 0,
            icon: Award,
            color: "#d97706",
            bg: "#FFFBEB",
          },
          {
            label: "Weekly Progress",
            value: `${dashboard?.stats?.weeklyProgress ?? 0}%`,
            icon: BarChart3,
            color: "#059669",
            bg: "#ECFDF5",
          },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-1 w-full" style={{ backgroundColor: s.color }} />
            <div className="p-5 flex items-center gap-4">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: s.bg, color: s.color }}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardLoading ? (
                    <span className="inline-block h-6 w-12 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Continue Learning banner */}
      {dashboard?.continueLearning && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] to-orange-400" />
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center">
              <PlayCircle className="h-7 w-7 text-[#D52B1E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-0.5">
                Up Next
              </p>
              <h3 className="font-semibold text-gray-900 truncate">
                {dashboard.continueLearning.courseTitle}
              </h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {dashboard.continueLearning.moduleTitle} &mdash;{" "}
                {dashboard.continueLearning.lessonTitle}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Progress
                  value={dashboard.continueLearning.progress}
                  className="flex-1 h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#D52B1E] [&>div]:to-orange-400"
                />
                <span className="text-xs font-bold text-[#D52B1E] shrink-0">
                  {dashboard.continueLearning.progress}%
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#b82319] text-white rounded-full gap-1.5 shrink-0"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Resume
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab chips */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <TabChip
              key={t.id}
              label={t.label}
              icon={t.icon}
              active={activeTab === t.id}
              onClick={() => {
                setActiveTab(t.id);
                const next = new URLSearchParams(searchParams);
                next.set("tab", t.id);
                setSearchParams(next, { replace: true });
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {/* -- My Learning ------------------------------ */}
          {activeTab === "my-learning" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Enrollments */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#D52B1E]" /> Active
                      Enrollments
                    </h2>
                    <span className="text-xs text-gray-400">
                      {myCourses.length} enrolled
                    </span>
                  </div>
                  {myCoursesLoading && (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-28 bg-gray-50 rounded-2xl animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                  {!myCoursesLoading && myCourses.length > 0 && (
                    <motion.div
                      className="grid gap-4 sm:grid-cols-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {myCourses.map((item) => (
                        <EnrollmentCard key={item.id} item={item} />
                      ))}
                    </motion.div>
                  )}
                  {!myCoursesLoading && myCourses.length === 0 && (
                    <EmptyState
                      icon={BookOpen}
                      title="No active enrollments"
                      description="Browse courses below and start learning today."
                    />
                  )}
                </div>

                {/* Sidebar � schedule + announcements */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#D52B1E]" /> Schedule
                    </h2>
                    {upcomingLoading && (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-16 bg-gray-50 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {!upcomingLoading && upcoming.length > 0 && (
                      <div className="space-y-2">
                        {upcoming.map((activity) => (
                          <div
                            key={activity.id}
                            className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-[#D52B1E]/20 transition-all"
                          >
                            <div className="h-8 w-8 shrink-0 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center group-hover:bg-[#D52B1E] transition-colors">
                              <Calendar className="h-3.5 w-3.5 text-[#D52B1E] group-hover:text-white transition-colors" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {activity.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {formatActivityType(activity.type)}
                                </span>
                                {(activity.dueAt ?? activity.scheduledAt) && (
                                  <span className="text-xs bg-red-50 text-[#D52B1E] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatDate(
                                      activity.dueAt ?? activity.scheduledAt,
                                    )}
                                  </span>
                                )}
                                {activity.durationMinutes && (
                                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                    {durationLabel(activity.durationMinutes)}
                                  </span>
                                )}
                              </div>
                              {activity.joinUrl && (
                                <a
                                  href={activity.joinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#D52B1E] hover:bg-[#b82319] px-2.5 py-1 rounded-full transition-colors"
                                >
                                  <PlayCircle className="h-3 w-3" /> Join
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!upcomingLoading && upcoming.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">
                        No upcoming activities
                      </p>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-[#D52B1E]" /> Updates
                    </h2>
                    {announcementsLoading && (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-20 bg-gray-50 rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {!announcementsLoading && announcements.length > 0 && (
                      <div className="space-y-2">
                        {announcements.map((a) => (
                          <div
                            key={a.id}
                            className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="absolute left-0 top-0 h-full w-1 bg-[#D52B1E]" />
                            <div className="flex justify-between items-start mb-1 pl-1">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1 pr-2">
                                {a.title}
                              </p>
                              <span className="text-xs text-gray-400 shrink-0">
                                {formatDate(a.publishedAt)}
                              </span>
                            </div>
                            {a.course?.title && (
                              <span className="ml-1 mb-1.5 inline-block text-xs bg-[#D52B1E]/10 text-[#D52B1E] px-2 py-0.5 rounded-full font-medium">
                                {a.course.title}
                              </span>
                            )}
                            <p className="text-xs text-gray-500 leading-relaxed pl-1 line-clamp-2">
                              {a.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {!announcementsLoading && announcements.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">
                        No announcements
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -- Browse Courses --------------------------- */}
          {activeTab === "courses" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses, topics..."
                    className="pl-9 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-[#D52B1E]/30"
                  />
                </div>
                {courseSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-gray-500"
                    onClick={() => setCourseSearch("")}
                  >
                    Clear
                  </Button>
                )}
                <span className="text-xs text-gray-400 shrink-0 self-center">
                  {courseList?.data?.length ?? 0} courses
                </span>
              </div>

              <div>
                <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] via-orange-400 to-amber-300" />
                  <div className="pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full bg-[#D52B1E]/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-14 -left-12 h-44 w-44 rounded-full bg-blue-100/60 blur-2xl" />

                  <div className="relative p-4 md:p-5 grid gap-4 lg:grid-cols-5">
                    <div className="lg:col-span-3 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
                          Why Choose Our Programs?
                        </p>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          Built for career-ready Islamic finance professionals
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          {
                            icon: TrendingUp,
                            title: "Market-Relevant Content",
                            desc: "Courses align with real industry needs across banking, sukuk, and governance.",
                          },
                          {
                            icon: BookOpen,
                            title: "Structured Learning Paths",
                            desc: "Clear beginner-to-advanced progression with practical modules.",
                          },
                          {
                            icon: Award,
                            title: "Recognized Outcomes",
                            desc: "Assessments and certificates help demonstrate verified progress.",
                          },
                        ].map((feature) => (
                          <div
                            key={feature.title}
                            className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 hover:bg-white hover:shadow-sm transition-all"
                          >
                            <div className="h-8 w-8 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center mb-2">
                              <feature.icon className="h-4 w-4 text-[#D52B1E]" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {feature.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {feature.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-3 self-start">
                      <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                          Programs
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {courseList?.data?.length ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                          Learners
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {totalLearners.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                          Avg. Rating
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {avgCourseRating.toFixed(1)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                          Learning Hours
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {totalLearningHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {coursesLoading && (
                <motion.div
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="h-80 bg-gray-50 rounded-2xl animate-pulse"
                    />
                  ))}
                </motion.div>
              )}
              {!coursesLoading && hasCourses && (
                <motion.div
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {courseList?.data.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onEnroll={() => enrollMutation.mutate(course.id)}
                      onUnenroll={() => unenrollMutation.mutate(course.id)}
                      onExplore={() => setSelectedCourseId(course.id)}
                      mutating={
                        enrollMutation.isPending || unenrollMutation.isPending
                      }
                    />
                  ))}
                </motion.div>
              )}
              {!coursesLoading && !hasCourses && (
                <EmptyState
                  icon={GraduationCap}
                  title="No courses found"
                  description="Try a different search keyword."
                />
              )}
            </div>
          )}

          <CourseExplorerDialog
            course={selectedCourse ?? null}
            open={selectedCourse !== undefined && selectedCourse !== null}
            onClose={() => setSelectedCourseId(null)}
          />

          {/* -- Payments --------------------------------- */}
          {activeTab === "payments" && (
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Subscription card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] to-orange-400" />
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Current Plan
                  </p>
                  {paymentsLoading && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-gray-50 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                  {!paymentsLoading && payments?.activeSubscription && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {payments.activeSubscription.planName}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize mt-1.5 inline-block ${
                            payments.activeSubscription.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {payments.activeSubscription.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatMoney(
                              payments.activeSubscription.amountCents,
                              payments.activeSubscription.currency,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Renews</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(
                              payments.activeSubscription.currentPeriodEnd,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">
                            Started
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(
                              payments.activeSubscription.currentPeriodStart,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Type</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {payments.activeSubscription.planType}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!paymentsLoading && !payments?.activeSubscription && (
                    <div className="py-6 text-center">
                      <CreditCard className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-3">
                        No active subscription
                      </p>
                      <Button
                        size="sm"
                        className="bg-[#D52B1E] hover:bg-[#b82319] text-white rounded-full"
                      >
                        View Plans
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction history */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] to-orange-400" />
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Transaction History
                  </p>
                  {paymentsLoading && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 bg-gray-50 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                  {!paymentsLoading && hasPaymentHistory && (
                    <div className="space-y-2">
                      {payments?.paymentHistory.map((payment) => {
                        let paymentStatusClass = "bg-gray-100 text-gray-600";
                        if (
                          payment.status === "completed" ||
                          payment.status === "successful"
                        ) {
                          paymentStatusClass = "bg-emerald-50 text-emerald-700";
                        } else if (
                          payment.status === "failed" ||
                          payment.status === "refunded"
                        ) {
                          paymentStatusClass = "bg-red-50 text-red-700";
                        }

                        return (
                          <div
                            key={payment.id}
                            className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                                <CreditCard className="h-4 w-4 text-[#D52B1E]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {payment.itemTitle}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>{formatDate(payment.paidAt)}</span>
                                  <span>&middot;</span>
                                  <span className="capitalize">
                                    {payment.paymentMethod}
                                  </span>
                                  {payment.cardLast4 && (
                                    <>
                                      <span>&middot;</span>
                                      <span>****{payment.cardLast4}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">
                                {formatMoney(
                                  payment.amountCents,
                                  payment.currency,
                                )}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${paymentStatusClass}`}
                              >
                                {payment.status}
                              </span>
                              {payment.receiptUrl && (
                                <a
                                  href={payment.receiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Download receipt"
                                  className="text-gray-400 hover:text-[#D52B1E] transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!paymentsLoading && !hasPaymentHistory && (
                    <EmptyState
                      icon={CreditCard}
                      title="No transactions yet"
                      description="Your payment history will appear here."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -- Results & Certificates ------------------- */}
          {activeTab === "results" && (
            <div className="space-y-5">
              {resultsLoading && (
                <div className="grid sm:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-gray-50 rounded-2xl" />
                  ))}
                </div>
              )}
              {!resultsLoading && results && (
                <>
                  {/* Performance overview */}
                  <motion.div
                    className="grid sm:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      {
                        label: "Avg. Score",
                        value: `${results.performanceOverview.averageScore}%`,
                        icon: Star,
                        color: "#2563eb",
                        bg: "#EFF6FF",
                      },
                      {
                        label: "Assessments Done",
                        value: results.performanceOverview.assessmentsCompleted,
                        icon: CheckCircle2,
                        color: "#059669",
                        bg: "#ECFDF5",
                      },
                      {
                        label: "Certificates",
                        value: results.performanceOverview.certificatesEarned,
                        icon: Award,
                        color: "#d97706",
                        bg: "#FFFBEB",
                      },
                    ].map((s) => (
                      <motion.div
                        key={s.label}
                        variants={itemVariants}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                      >
                        <div
                          className="h-1 w-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="p-5 flex items-center gap-4">
                          <div
                            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: s.bg, color: s.color }}
                          >
                            <s.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              {s.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {s.value}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Certificates */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-[#D52B1E] to-orange-400" />
                    <div className="p-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Earned Certificates
                      </p>
                      {results.earnedCertificates.length > 0 ? (
                        <motion.div
                          className="grid sm:grid-cols-2 gap-3"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {results.earnedCertificates.map((cert) => (
                            <motion.div
                              key={cert.id}
                              variants={itemVariants}
                              className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center">
                                  <Award className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                      {cert.name}
                                    </p>
                                    {cert.isVerified && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {cert.type} &middot; {formatDate(cert.date)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={cert.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Download"
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#D52B1E] hover:bg-red-50 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <EmptyState
                          icon={Award}
                          title="No certificates yet"
                          description="Complete programmes to earn your certificates."
                        />
                      )}
                    </div>
                  </div>

                  {/* Assessment results */}
                  {results.assessmentResults.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <div className="p-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                          Assessment Results
                        </p>
                        <div className="space-y-2">
                          {results.assessmentResults.map((r) => {
                            const statusLower = r.status.toLowerCase();
                            let statusClass = "bg-gray-100 text-gray-600";
                            if (statusLower === "passed")
                              statusClass = "bg-emerald-50 text-emerald-700";
                            else if (statusLower === "failed")
                              statusClass = "bg-red-50 text-red-700";
                            else if (statusLower.includes("retake"))
                              statusClass = "bg-amber-50 text-amber-700";
                            return (
                              <div
                                key={r.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/60 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {r.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatDate(r.date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-lg font-bold text-gray-900">
                                    {r.score}%
                                  </p>
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusClass}`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!resultsLoading && !results && (
                <EmptyState
                  icon={BarChart3}
                  title="No results yet"
                  description="Complete assessments to see your results here."
                />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
