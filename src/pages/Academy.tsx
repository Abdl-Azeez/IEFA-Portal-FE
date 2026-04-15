import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  GraduationCap,
  PlayCircle,
  RefreshCw,
  Search,
  Star,
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
  useAcademyCourses,
  useAcademyMyEnrollments,
  useAcademyDashboard,
  useAcademyUpcomingActivities,
  useEnrollInAcademyCourse,
  useInstructorAcademyCourses,
  useInstructorCreateCourse,
  useInstructorAddSection,
  useInstructorAddLesson,
  useInstructorCourseDetails,
} from "@/hooks/useAcademy";
import type { AcademyCourseDetailsDto, AcademyEnrollmentDto } from "@/types/learning";

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
}: Readonly<{ item: AcademyEnrollmentDto; courseTitle?: string }>) {
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
  course: AcademyCourseDetailsDto;
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

/* ── Instructor Learning Workspace ─────────────────────────────────────────── */
function InstructorLearningWorkspace({
  name,
  educatorId,
}: Readonly<{ name: string; educatorId: string }>) {
  const [tab, setTab] = useState<"courses" | "builder" | "progress">("courses");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseLevel, setCourseLevel] = useState("Beginner");
  const [coursePriceUsd, setCoursePriceUsd] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const coursesQuery = useInstructorAcademyCourses();
  const createCourseMutation = useInstructorCreateCourse();
  const addSectionMutation = useInstructorAddSection();
  const addLessonMutation = useInstructorAddLesson();
  const courseDetailsQuery = useInstructorCourseDetails(
    typeof selectedCourseId === "number" ? selectedCourseId : undefined,
  );

  const selectedCourseDetails = courseDetailsQuery.data;
  const selectedSectionId = selectedCourseDetails?.sections?.[0]?.id;

  let selectedCourseDetailsBlock: React.JSX.Element;
  if (!selectedCourseId) {
    selectedCourseDetailsBlock = (
      <p className="mt-4 text-sm text-gray-500">
        Select a course from the list to manage its content.
      </p>
    );
  } else if (courseDetailsQuery.isLoading) {
    selectedCourseDetailsBlock = (
      <p className="mt-4 text-sm text-gray-500">Loading course details…</p>
    );
  } else if (selectedCourseDetails) {
    selectedCourseDetailsBlock = (
      <div className="mt-4 space-y-3 text-sm text-gray-600">
        <p className="font-semibold text-gray-900">
          {selectedCourseDetails.title}
        </p>
        <p>{selectedCourseDetails.description}</p>
        <p>Sections: {selectedCourseDetails.sections?.length ?? 0}</p>
        <p>Lessons: {selectedCourseDetails.lessonCount ?? 0}</p>
      </div>
    );
  } else {
    selectedCourseDetailsBlock = (
      <p className="mt-4 text-sm text-red-500">Failed to load course details.</p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your courses and track student progress.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("courses")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "courses"
                  ? "bg-[#D52B1E] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setTab("builder")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "builder"
                  ? "bg-[#D52B1E] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Course Builder
            </button>
            <button
              onClick={() => setTab("progress")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "progress"
                  ? "bg-[#D52B1E] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Student Progress
            </button>
          </div>
        </motion.div>

        {tab === "courses" && (
          <motion.div variants={itemVariants}>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Courses
              </h2>
              {coursesQuery.isLoading ? (
                <p>Loading courses…</p>
              ) : coursesQuery.data ? (
                <div className="space-y-4">
                  {coursesQuery.data.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {course.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCourseId(course.id as number)}
                        className="rounded bg-[#D52B1E] px-4 py-2 text-white hover:bg-[#D52B1E]/90"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No courses found.</p>
              )}
            </div>
          </motion.div>
        )}

        {tab === "builder" && (
          <motion.div variants={itemVariants}>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Course Builder
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="course-title" className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <input
                    id="course-title"
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                  />
                </div>
                <div>
                  <label htmlFor="course-description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="course-description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                  />
                </div>
                <div>
                  <label htmlFor="course-level" className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    id="course-level"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="course-price" className="block text-sm font-medium text-gray-700">
                    Price (USD)
                  </label>
                  <input
                    id="course-price"
                    type="number"
                    value={coursePriceUsd}
                    onChange={(e) => setCoursePriceUsd(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                  />
                </div>
                <button
                  onClick={() =>
                    createCourseMutation.mutate({
                      title: courseTitle,
                      slug: courseTitle
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9]+/g, "-")
                        .replaceAll(/(^-|-$)/g, ""),
                      description: courseDescription,
                      coverImageUrl: undefined,
                      previewVideoUrl: null,
                      level: courseLevel,
                      priceUsd: coursePriceUsd,
                      educatorId,
                      programmeId: null,
                      isFree: false,
                      status: "draft",
                      tags: [],
                    })
                  }
                  disabled={createCourseMutation.isPending}
                  className="rounded bg-[#D52B1E] px-4 py-2 text-white hover:bg-[#D52B1E]/90 disabled:opacity-50"
                >
                  Create Course
                </button>
              </div>
              {selectedCourseId && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Manage Course
                  </h3>
                  {selectedCourseDetailsBlock}
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="new-section-title" className="block text-sm font-medium text-gray-700">
                        New Section Title
                      </label>
                      <input
                        id="new-section-title"
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                      />
                    </div>
                    <button
                      onClick={() =>
                        addSectionMutation.mutate({
                          courseId: selectedCourseId,
                          payload: { title: newSectionTitle },
                        })
                      }
                      disabled={addSectionMutation.isPending}
                      className="rounded bg-[#D52B1E] px-4 py-2 text-white hover:bg-[#D52B1E]/90 disabled:opacity-50"
                    >
                      Add Section
                    </button>
                    <div>
                      <label htmlFor="new-lesson-title" className="block text-sm font-medium text-gray-700">
                        New Lesson Title
                      </label>
                      <input
                        id="new-lesson-title"
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D52B1E] focus:ring-[#D52B1E]"
                      />
                    </div>
                    <button
                      onClick={() =>
                        addLessonMutation.mutate({
                          sectionId: selectedSectionId!,
                          payload: { title: newLessonTitle },
                        })
                      }
                      disabled={addLessonMutation.isPending || !selectedSectionId}
                      className="rounded bg-[#D52B1E] px-4 py-2 text-white hover:bg-[#D52B1E]/90 disabled:opacity-50"
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "progress" && (
          <motion.div variants={itemVariants}>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Student Progress
              </h2>
              <p className="text-gray-500">Student progress tracking coming soon.</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export function Academy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courseSearch, setCourseSearch] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "courses" ? tab : "my-learning";
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);

  const { data: me } = useMe();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "courses" || tab === "my-learning") {
      setActiveTab(tab);
      return;
    }

    setActiveTab("my-learning");
  }, [searchParams]);

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useAcademyDashboard();
  const { data: myEnrollments = [], isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useAcademyMyEnrollments();
  const { data: upcoming = [], refetch: refetchUpcoming } = useAcademyUpcomingActivities();
  const { data: courseList, isLoading: coursesLoading, refetch: refetchCourses } = useAcademyCourses({
    page: 1,
    perPage: 24,
    search: courseSearch || undefined,
  });

  const enrollMutation = useEnrollInAcademyCourse();

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string | number>();
    for (const item of myEnrollments) {
      if (typeof item.currentCourseId === "number" || typeof item.currentCourseId === "string") {
        ids.add(item.currentCourseId);
      }
      if (typeof item.courseId === "number" || typeof item.courseId === "string") {
        ids.add(item.courseId);
      }
    }
    return ids;
  }, [myEnrollments]);

  const fullName = [me?.firstName, me?.lastName].filter(Boolean).join(" ").trim();
  const welcomeName = fullName || me?.username || "Learner";
  const selectedCourse = useMemo(
    () => courseList?.find((course) => course.id === selectedCourseId),
    [courseList, selectedCourseId],
  );

  const onRefreshAll = async () => {
    await Promise.all([
      refetchDashboard(),
      refetchEnrollments(),
      refetchUpcoming(),
      refetchCourses(),
    ]);
  };

  const TABS = [
    { id: "my-learning", label: "My Learning", icon: BookOpen },
    { id: "courses", label: "Browse Courses", icon: GraduationCap },
  ] as const;

  const hasCourses = (courseList?.length ?? 0) > 0;

  if (me?.role === "instructor") {
    return <InstructorLearningWorkspace name={`${me.firstName || ""} ${me.lastName || ""}`.trim() || "Instructor"} educatorId={`${me?.id ?? ""}`} />;
  }

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
                <GraduationCap className="h-3 w-3" /> IEFA Academy
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Build your{" "}
                <span className="text-[#D52B1E]">Islamic Finance</span> mastery
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Track progress, continue lessons, manage subscriptions, and
                review your certifications from one academy workspace.
              </p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-gray-600" />{" "}
                  {myEnrollments.length} Active Enrollments
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-gray-600" />{" "}
                  {0} Certificates
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-gray-600" />{" "}
                  {0}% Weekly Progress
                </span>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {myEnrollments.length}
                </p>
                <p className="text-xs text-gray-500">Enrolled</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-[#D52B1E]">
                  {dashboard?.completedCourses ?? 0}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {0}%
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
              IEFA Academy Portal
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {welcomeName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {dashboardLoading
                ? "Loading your progress..."
                : `${0}% weekly progress | ${dashboard?.completedCourses ?? 0} courses completed`}
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
            value: dashboard?.completedCourses ?? 0,
            icon: BookOpen,
            color: "#2563eb",
            bg: "#EFF6FF",
          },
          {
            label: "Certificates Earned",
            value: 0,
            icon: Award,
            color: "#d97706",
            bg: "#FFFBEB",
          },
          {
            label: "Weekly Progress",
            value: `0%`,
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
                <p className="text-sm font-medium text-gray-600">{s.label}</p>
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

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <TabChip
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchParams(tab.id === "courses" ? { tab: tab.id } : {});
            }}
          />
        ))}
      </motion.div>

      {/* Tab Content */}
      {activeTab === "my-learning" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* My Enrollments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Learning</h2>
              <span className="text-sm text-gray-500">
                {enrollmentsLoading ? "Loading..." : `${myEnrollments.length} enrollments`}
              </span>
            </div>

            {(() => {
              if (enrollmentsLoading) {
                return (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`enrollment-skeleton-${i}`} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-3 bg-gray-200 rounded mb-4" />
                        <div className="h-8 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                );
              } else if (myEnrollments.length === 0) {
                return (
                  <EmptyState
                    title="No enrollments yet"
                    description="Browse our academy courses and start your learning journey"
                    icon={BookOpen}
                  />
                );
              } else {
                return (
                  <motion.div
                    variants={containerVariants}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {myEnrollments.map((enrollment) => (
                      <EnrollmentCard
                        key={enrollment.id}
                        item={enrollment}
                        courseTitle={
                          enrollment.course?.title ??
                          courseList?.find((c) => c.id === enrollment.currentCourseId)?.title
                        }
                      />
                    ))}
                  </motion.div>
                );
              }
            })()}
          </div>

          {/* Upcoming Activities */}
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Activities</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-[#D52B1E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatActivityType(activity.type)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(activity.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Course Grid */}
          {(() => {
            if (coursesLoading) {
              return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`course-skeleton-${i}`} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded mb-4" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              );
            } else if (hasCourses === false) {
              return (
                <EmptyState
                  title="No courses available"
                  description="Check back later for new academy courses"
                  icon={BookOpen}
                />
              );
            } else {
              return (
                <motion.div
                  variants={containerVariants}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {(courseList ?? []).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onEnroll={() => enrollMutation.mutate(course.id)}
                      onUnenroll={() => {
                        // TODO: Implement unenroll functionality
                      }}
                      onExplore={() => setSelectedCourseId(course.id)}
                      mutating={enrollMutation.isPending}
                    />
                  ))}
                </motion.div>
              );
            }
          })()}
        </motion.div>
      )}

      {/* Course Explorer Dialog */}

      {/* Course Explorer Dialog */}
      {selectedCourse && (
        <CourseExplorerDialog
          course={selectedCourse}
          open={!!selectedCourse}
          onClose={() => setSelectedCourseId(null)}
        />
      )}
    </motion.div>
  );
}