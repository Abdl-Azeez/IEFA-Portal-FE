import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CourseExplorerDialog } from "@/components/learning/CourseExplorerDialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress, getProgressGradient } from "@/components/ui/progress";
import { useMe } from "@/hooks/useAuth";
import {
  useAcademyCourses,
  useAcademyCoursesMeta,
  useAcademyMyEnrollments,
  useAcademyMyEnrollmentsMeta,
  useAcademyDashboard,
  useAcademyUpcomingActivities,
  useEnrollInAcademyCourse,
  useUnenrollFromAcademyCourse,
  useAcademyCategoryTypes,
  useInstructorAcademyCourses,
  useInstructorCreateCourse,
  useInstructorUpdateCourse,
  useInstructorPublishCourse,
  useInstructorSuspendCourse,
  useInstructorAddSection,
  useInstructorAddLesson,
  useInstructorAddQuiz,
  useInstructorUpdateQuiz,
  useInstructorDeleteQuiz,
  useInstructorAddQuestion,
  useInstructorUpdateQuestion,
  useInstructorDeleteQuestion,
  useInstructorAddOption,
  useInstructorUpdateOption,
  useInstructorDeleteOption,
  useInstructorQuizAttempts,
  useInstructorCourseDetails,
  useInstructorQuizDetails,
  useInstructorSectionDetails,
  useInstructorLessonDetails,
} from "@/hooks/useAcademy";
import type {
  AcademyCourseDetailsDto,
  AcademyEnrollmentDto,
} from "@/types/learning";

/* ── Animation variants ──────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const pageSwapTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatSecondsAsLabel(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "---";
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const remainingSeconds = seconds % 60;

  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0)
    return remainingSeconds > 0 ? `${m}m ${remainingSeconds}s` : `${m}m`;
  return `${remainingSeconds}s`;
}

function stripHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent ?? "").split(/\s+/).filter(Boolean).join(" ");
}

function buildCourseStub(
  courseId: string | number,
  title?: string,
): AcademyCourseDetailsDto {
  const now = new Date().toISOString();
  return {
    id: courseId,
    title: title ?? "Course",
    slug: "",
    description: "",
    coverImageUrl: "",
    previewVideoUrl: null,
    educatorId: "",
    educator: { id: "", name: "IEFA Educator", profilePhotoUrl: "", rating: 0 },
    programmeId: null,
    programme: null,
    moduleCount: 0,
    videoCount: 0,
    totalDurationMinutes: 0,
    enrolledCount: 0,
    level: "beginner",
    priceUsd: 0,
    isFree: true,
    rating: 0,
    reviewCount: 0,
    status: "published",
    tags: [],
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    sections: [],
  };
}

function formatActivityType(type: string): string {
  return type
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function buildPaginationItems(
  currentPage: number,
  pageCount: number,
): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < pageCount - 1) pages.push("ellipsis");

  pages.push(pageCount);
  return pages;
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

function CreativePagination({
  currentPage,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  itemCount,
  entityLabel,
  onPageChange,
}: Readonly<{
  currentPage: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  itemCount?: number;
  entityLabel: string;
  onPageChange: (page: number) => void;
}>) {
  const safeCurrent = Math.max(
    1,
    Math.min(currentPage, Math.max(1, pageCount)),
  );
  const safePageCount = Math.max(1, pageCount);
  const pageItems = buildPaginationItems(safeCurrent, safePageCount);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white via-[#FFF7F6] to-[#FFF1EE] p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Page {safeCurrent} of {safePageCount}
          </p>
          <p className="text-xs text-gray-500">
            {typeof itemCount === "number"
              ? `${itemCount.toLocaleString()} total ${entityLabel}`
              : `Browse ${entityLabel} page by page`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
            disabled={!hasPreviousPage}
            className="h-8 rounded-full border-gray-200 bg-white px-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${safeCurrent}-${index}`}
                className="px-1 text-xs text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition-colors ${
                  item === safeCurrent
                    ? "bg-[#D52B1E] text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                aria-current={item === safeCurrent ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => onPageChange(safeCurrent + 1)}
            disabled={!hasNextPage}
            className="h-8 rounded-full bg-[#D52B1E] px-3 text-white hover:bg-[#b92418]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Enrollment card ────────────────────────────────────────────────────────── */
function EnrollmentCard({
  item,
  courseTitle,
  onContinue,
}: Readonly<{
  item: AcademyEnrollmentDto;
  courseTitle?: string;
  onContinue: () => void;
}>) {
  const programmeName = (item.programme as { title?: string } | null)?.title;
  const displayName =
    courseTitle ?? programmeName ?? `${item.itemType} enrollment`;

  const statusStyle: Record<string, { bg: string; text: string }> = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700" },
    active: { bg: "bg-blue-50", text: "text-blue-700" },
    in_progress: { bg: "bg-amber-50", text: "text-amber-700" },
  };
  const ss = statusStyle[item.status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  const completedLessons =
    Number(item.completedLessonsCount ?? 0) ||
    (item.completedLessonIds?.length ?? 0);

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
            <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2 group-hover:text-[#D52B1E] transition-colors text-sm min-h-[2.5rem]">
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
            <span className="font-bold text-[#D52B1E]">
              {item.progressPercent}%
            </span>
          </div>
          <Progress
            value={item.progressPercent}
            className="h-1.5 bg-gray-100"
            indicatorStyle={getProgressGradient(item.progressPercent)}
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {completedLessons} lesson{completedLessons !== 1 ? "s" : ""}{" "}
            completed
          </span>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] hover:gap-2 transition-all"
          >
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
  onResume,
  mutating,
}: Readonly<{
  course: AcademyCourseDetailsDto;
  isEnrolled: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  onExplore: () => void;
  onResume: () => void;
  mutating: boolean;
}>) {
  const levelColor: Record<string, string> = {
    beginner: "#059669",
    intermediate: "#d97706",
    advanced: "#D52B1E",
  };
  const lc = levelColor[course.level?.toLowerCase() ?? ""] ?? "#6d28d9";
  const lessonCount = Number(course.lessonCount ?? course.videoCount ?? 0) || 0;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="group"
    >
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
          <p className="text-xs text-gray-400 mb-1">
            {course.educator?.name || "IEFA Educator"}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
            {stripHtml(course.description)}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-3 w-3" /> {lessonCount} lesson
              {lessonCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{" "}
              {durationLabel(course.totalDurationMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />{" "}
              {course.enrolledCount.toLocaleString()}
            </span>
          </div>

          {/* Rating + Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">
                {course.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({course.reviewCount})
              </span>
            </div>
            {!course.isFree && (
              <span className="text-sm font-bold text-gray-900">
                ${course.priceUsd}
              </span>
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
                <button
                  type="button"
                  onClick={onResume}
                  className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] hover:gap-2 transition-all"
                >
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
const emptyCourseForm = {
  title: "",
  subtitle: "",
  description: "",
  categoryId: "",
  level: "beginner" as "beginner" | "intermediate" | "advanced",
  thumbnailUrl: "",
  price: 0,
  isFree: false,
};

const emptySectionForm = { title: "", description: "", sortOrder: "" };

const emptyLessonForm = {
  title: "",
  type: "video" as "video" | "article" | "quiz" | "assignment" | "live_session",
  contentUrl: "",
  contentText: "",
  meetingLink: "",
  scheduledAt: "",
  durationSeconds: "",
  sortOrder: "",
};

const LESSON_TYPE_META = {
  video: {
    label: "Video",
    icon: PlayCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  article: {
    label: "Article",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  quiz: {
    label: "Quiz",
    icon: HelpCircle,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  assignment: {
    label: "Assignment",
    icon: ClipboardList,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  live_session: {
    label: "Live Session",
    icon: Video,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
} as const;

const LEVEL_META = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  advanced: { label: "Advanced", color: "text-violet-700", bg: "bg-violet-50" },
} as const;

function InstructorLearningWorkspace({
  name,
}: Readonly<{ name: string; educatorId: string }>) {
  const [selectedCourseId, setSelectedCourseId] = useState<
    string | number | ""
  >("");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    null,
  );
  const [addingLessonSectionId, setAddingLessonSectionId] = useState<
    string | null
  >(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [managingQuizId, setManagingQuizId] = useState<string | null>(null);
  const [addingQuizToLessonId, setAddingQuizToLessonId] = useState<
    string | null
  >(null);
  const [addingQuizLessonTitle, setAddingQuizLessonTitle] = useState("");
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    passPercentage: 70,
    timeLimitMinutes: "",
  });
  const [showEditQuizSettings, setShowEditQuizSettings] = useState(false);
  const [editQuizForm, setEditQuizForm] = useState({
    title: "",
    description: "",
    passPercentage: 70,
    timeLimitMinutes: "",
    maxAttempts: "",
    isPublished: false,
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "mcq",
    points: 1,
  });
  const [addingOptionToQId, setAddingOptionToQId] = useState<string | null>(
    null,
  );
  const [optionForm, setOptionForm] = useState({ text: "", isCorrect: false });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionText, setEditingOptionText] = useState("");
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<
    string | null
  >(null);
  const [confirmDeleteOptionId, setConfirmDeleteOptionId] = useState<
    string | null
  >(null);
  const [viewingLessonId, setViewingLessonId] = useState<string | null>(null);
  const [inspectingSectionId, setInspectingSectionId] = useState<string | null>(
    null,
  );
  const [courseSearch, setCourseSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");

  const categoryTypesQuery = useAcademyCategoryTypes();
  const coursesQuery = useInstructorAcademyCourses({ page: 1, perPage: 100 });
  const createCourseMutation = useInstructorCreateCourse();
  const updateCourseMutation = useInstructorUpdateCourse();
  const publishCourseMutation = useInstructorPublishCourse();
  const suspendCourseMutation = useInstructorSuspendCourse();
  const addSectionMutation = useInstructorAddSection();
  const addLessonMutation = useInstructorAddLesson();
  const addQuizMutation = useInstructorAddQuiz();
  const updateQuizMutation = useInstructorUpdateQuiz();
  const deleteQuizMutation = useInstructorDeleteQuiz();
  const addQuestionMutation = useInstructorAddQuestion();
  const updateQuestionMutation = useInstructorUpdateQuestion();
  const deleteQuestionMutation = useInstructorDeleteQuestion();
  const addOptionMutation = useInstructorAddOption();
  const updateOptionMutation = useInstructorUpdateOption();
  const deleteOptionMutation = useInstructorDeleteOption();
  const courseDetailsQuery = useInstructorCourseDetails(
    selectedCourseId !== "" ? selectedCourseId : undefined,
  );
  const courseDetails = courseDetailsQuery.data;
  const sections = courseDetails?.sections ?? [];
  const quizDetailsQuery = useInstructorQuizDetails(
    managingQuizId ?? undefined,
  );
  const quizAttemptsQuery = useInstructorQuizAttempts(
    managingQuizId ?? undefined,
  );
  const lessonDetailQuery = useInstructorLessonDetails(
    viewingLessonId ?? undefined,
  );
  const sectionInspectorQuery = useInstructorSectionDetails(
    inspectingSectionId ?? undefined,
  );

  const courseQuizzes = useMemo(
    () =>
      (sections ?? []).flatMap((s) =>
        (s.lessons ?? [])
          .filter(
            (l) =>
              l.quizId != null ||
              (Array.isArray(l.quizzes) && (l.quizzes as unknown[]).length > 0),
          )
          .map((l) => ({
            id: String(
              l.quizId ??
                (l.quizzes as Array<Record<string, unknown>> | undefined)?.[0]
                  ?.id ??
                "",
            ),
            label: l.title,
          })),
      ),
    [sections],
  );

  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) return;
    const slug = courseForm.title
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");
    await createCourseMutation.mutateAsync({
      title: courseForm.title,
      slug,
      subtitle: courseForm.subtitle || undefined,
      description: courseForm.description || undefined,
      categoryId: courseForm.categoryId || undefined,
      level: courseForm.level,
      thumbnailUrl: courseForm.thumbnailUrl || undefined,
      price: courseForm.price,
      isFree: courseForm.isFree,
    });
    setShowCreateCourse(false);
    setCourseForm(emptyCourseForm);
  };

  const handleAddSection = async () => {
    if (!sectionForm.title.trim() || selectedCourseId === "") return;
    await addSectionMutation.mutateAsync({
      courseId: selectedCourseId,
      payload: {
        title: sectionForm.title,
        description: sectionForm.description || undefined,
        sortOrder: sectionForm.sortOrder
          ? Number(sectionForm.sortOrder)
          : undefined,
      },
    });
    setShowAddSection(false);
    setSectionForm(emptySectionForm);
  };

  const handleAddLesson = async (sectionId: string) => {
    if (!lessonForm.title.trim()) return;
    await addLessonMutation.mutateAsync({
      sectionId,
      payload: {
        title: lessonForm.title,
        type: lessonForm.type,
        contentUrl: lessonForm.contentUrl || undefined,
        contentText: lessonForm.contentText || undefined,
        meetingLink: lessonForm.meetingLink || undefined,
        scheduledAt: lessonForm.scheduledAt || undefined,
        durationSeconds: lessonForm.durationSeconds
          ? Number(lessonForm.durationSeconds)
          : undefined,
        sortOrder: lessonForm.sortOrder
          ? Number(lessonForm.sortOrder)
          : undefined,
      },
    });
    setAddingLessonSectionId(null);
    setLessonForm(emptyLessonForm);
  };

  const handleUpdateCourse = async () => {
    if (!courseForm.title.trim() || selectedCourseId === "") return;
    const slug = courseForm.title
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");
    await updateCourseMutation.mutateAsync({
      id: selectedCourseId,
      payload: {
        title: courseForm.title,
        slug,
        subtitle: courseForm.subtitle || undefined,
        description: courseForm.description || undefined,
        categoryId: courseForm.categoryId || undefined,
        level: courseForm.level,
        thumbnailUrl: courseForm.thumbnailUrl || undefined,
        price: courseForm.price,
        isFree: courseForm.isFree,
      },
    });
    setShowCreateCourse(false);
    setIsEditingCourse(false);
    setCourseForm(emptyCourseForm);
  };

  const handleSuspendCourse = async () => {
    if (selectedCourseId === "") return;
    await suspendCourseMutation.mutateAsync(selectedCourseId);
  };

  const handlePublishCourse = async () => {
    if (selectedCourseId === "") return;
    await publishCourseMutation.mutateAsync(selectedCourseId);
  };

  const handleAddQuiz = async () => {
    if (
      !quizForm.title.trim() ||
      selectedCourseId === "" ||
      !addingQuizToLessonId
    )
      return;
    await addQuizMutation.mutateAsync({
      courseId: selectedCourseId,
      payload: {
        title: quizForm.title,
        description: quizForm.description || undefined,
        passPercentage: quizForm.passPercentage,
        timeLimitMinutes: quizForm.timeLimitMinutes
          ? Number(quizForm.timeLimitMinutes)
          : undefined,
        lessonId: addingQuizToLessonId,
      },
    });
    setAddingQuizToLessonId(null);
    setAddingQuizLessonTitle("");
    setQuizForm({
      title: "",
      description: "",
      passPercentage: 70,
      timeLimitMinutes: "",
    });
  };

  const handleUpdateQuizSettings = async () => {
    if (!managingQuizId) return;
    await updateQuizMutation.mutateAsync({
      id: managingQuizId,
      payload: {
        title: editQuizForm.title || undefined,
        description: editQuizForm.description || undefined,
        passPercentage: editQuizForm.passPercentage || undefined,
        timeLimitMinutes: editQuizForm.timeLimitMinutes
          ? Number(editQuizForm.timeLimitMinutes)
          : undefined,
        maxAttempts: editQuizForm.maxAttempts
          ? Number(editQuizForm.maxAttempts)
          : undefined,
        isPublished: editQuizForm.isPublished,
      },
    });
    setShowEditQuizSettings(false);
  };

  const handleAddQuestionToQuiz = async () => {
    if (!managingQuizId || !questionForm.text.trim()) return;
    await addQuestionMutation.mutateAsync({
      quizId: managingQuizId,
      payload: {
        text: questionForm.text.trim(),
        type: questionForm.type,
        points: questionForm.points,
      },
    });
    setQuestionForm({ text: "", type: "mcq", points: 1 });
    setShowAddQuestion(false);
  };

  const handleAddOptionToQuestion = async () => {
    if (!addingOptionToQId || !optionForm.text.trim()) return;
    await addOptionMutation.mutateAsync({
      questionId: addingOptionToQId,
      payload: {
        text: optionForm.text.trim(),
        isCorrect: optionForm.isCorrect,
      },
    });
    setOptionForm({ text: "", isCorrect: false });
    setAddingOptionToQId(null);
  };

  const inputCls =
    "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#D52B1E] focus:outline-none focus:ring-1 focus:ring-[#D52B1E]";
  const labelCls =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5";

  const totalLessons = (coursesQuery.data ?? []).reduce(
    (acc, c) => acc + (c.lessonCount ?? 0),
    0,
  );
  const totalCourses = coursesQuery.data?.length ?? 0;
  const publishedCourses = (coursesQuery.data ?? []).filter(
    (c) => c.status === "published",
  ).length;
  const activeLessonDetail = lessonDetailQuery.data;
  const activeLessonMeta =
    LESSON_TYPE_META[
      (activeLessonDetail?.type as keyof typeof LESSON_TYPE_META) ?? "video"
    ] ?? LESSON_TYPE_META.video;
  const ActiveLessonIcon = activeLessonMeta.icon;

  const filteredCourses = useMemo(() => {
    const all = coursesQuery.data ?? [];
    const q = courseSearch.trim().toLowerCase();
    return all.filter((c) => {
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.subtitle ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [coursesQuery.data, courseSearch, statusFilter]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#F8F9FC]"
    >
      {/* ── Create / Edit Course Modal ──────────────────────────────── */}
      {showCreateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditingCourse ? "Edit Course" : "Create New Course"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEditingCourse
                    ? "Update your course details"
                    : "Fill in the details to publish your course"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateCourse(false);
                  setIsEditingCourse(false);
                  setCourseForm(emptyCourseForm);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className={labelCls}>Course Title *</label>
                <input
                  className={inputCls}
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Islamic Finance Foundations"
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Subtitle</label>
                <input
                  className={inputCls}
                  value={courseForm.subtitle}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  placeholder="Brief tagline that sells the course"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What will students learn in this course?"
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <Select
                  value={courseForm.categoryId ?? ""}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                >
                  <option value="">— Select a category —</option>
                  {categoryTypesQuery.data?.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Level *</label>
                  <Select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm((f) => ({
                        ...f,
                        level: e.target.value as typeof f.level,
                      }))
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
                <div>
                  <label className={labelCls}>Price (USD) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputCls}
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm((f) => ({
                        ...f,
                        price: Number(e.target.value),
                        isFree: Number(e.target.value) === 0,
                      }))
                    }
                    placeholder="49.99"
                  />
                </div>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setCourseForm((f) => ({
                    ...f,
                    isFree: !f.isFree,
                    price: !f.isFree ? 0 : f.price,
                  }))
                }
                onKeyDown={(e) =>
                  (e.key === " " || e.key === "Enter") &&
                  setCourseForm((f) => ({
                    ...f,
                    isFree: !f.isFree,
                    price: !f.isFree ? 0 : f.price,
                  }))
                }
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors select-none"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Free course
                  </p>
                  <p className="text-xs text-gray-400">
                    Make this course available at no cost
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={courseForm.isFree}
                  onClick={(e) => e.stopPropagation()}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D52B1E] focus-visible:ring-offset-2 ${
                    courseForm.isFree ? "bg-[#D52B1E]" : "bg-gray-200"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                      courseForm.isFree ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className={labelCls}>Thumbnail</label>
                <ImageUpload
                  value={courseForm.thumbnailUrl ?? ""}
                  onChange={(url) =>
                    setCourseForm((f) => ({ ...f, thumbnailUrl: url }))
                  }
                  previewHeight="h-32"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateCourse(false);
                    setIsEditingCourse(false);
                    setCourseForm(emptyCourseForm);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    void (isEditingCourse
                      ? handleUpdateCourse()
                      : handleCreateCourse())
                  }
                  disabled={
                    !courseForm.title.trim() ||
                    createCourseMutation.isPending ||
                    updateCourseMutation.isPending
                  }
                  className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-2"
                >
                  {createCourseMutation.isPending ||
                  updateCourseMutation.isPending ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      {isEditingCourse ? "Updating…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      {isEditingCourse ? (
                        <Edit className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}{" "}
                      {isEditingCourse ? "Update Course" : "Create Course"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Lesson Inspector Modal ───────────────────────────────────── */}
      <Dialog
        open={viewingLessonId !== null}
        onClose={() => setViewingLessonId(null)}
        title="About this Lesson"
        maxWidth="max-w-2xl"
      >
        {lessonDetailQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 rounded-full border-2 border-[#D52B1E] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Loading lesson details…</p>
            </div>
          </div>
        ) : activeLessonDetail ? (
          <div className="space-y-6">
            {/* Hero row */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div
                className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${activeLessonMeta.bg}`}
              >
                <ActiveLessonIcon
                  className={`h-6 w-6 ${activeLessonMeta.color}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${activeLessonMeta.bg} ${activeLessonMeta.color} ${activeLessonMeta.border} capitalize`}
                  >
                    {activeLessonMeta.label}
                  </span>
                  {activeLessonDetail.isPublished ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Published
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Draft — not visible to students
                    </span>
                  )}
                  {activeLessonDetail.isFreePreview && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Free Preview
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {activeLessonDetail.title}
                </h2>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-800">
                  {formatSecondsAsLabel(activeLessonDetail.durationSeconds)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Duration</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <BarChart3 className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-800">
                  Position {(activeLessonDetail.sortOrder ?? 0) + 1}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">In this section</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                {activeLessonDetail.isPublished ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-emerald-700">
                      Published
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Visible to students
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-amber-600">Draft</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hidden from students
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {(activeLessonDetail.contentUrl ||
              activeLessonDetail.meetingLink ||
              activeLessonDetail.scheduledAt ||
              activeLessonDetail.contentText) && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Lesson Content
                </p>
                {activeLessonDetail.contentUrl && (
                  <a
                    href={activeLessonDetail.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900">
                        Watch Lesson Video
                      </p>
                      <p className="text-xs text-blue-500 truncate">
                        {activeLessonDetail.contentUrl}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-blue-500 shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                )}
                {activeLessonDetail.meetingLink && (
                  <a
                    href={activeLessonDetail.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-violet-100 bg-violet-50 hover:bg-violet-100 transition-colors group"
                  >
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-violet-900">
                        Join Live Session
                      </p>
                      <p className="text-xs text-violet-500 truncate">
                        {activeLessonDetail.meetingLink}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-violet-500 shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                )}
                {activeLessonDetail.scheduledAt && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50">
                    <Calendar className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">
                        Session Scheduled for
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        {new Date(
                          activeLessonDetail.scheduledAt,
                        ).toLocaleString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {activeLessonDetail.contentText && (
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Written Content
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {activeLessonDetail.contentText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Section context */}
            {activeLessonDetail.section && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Part of Section
                </p>
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="text-sm font-bold text-gray-800">
                      {activeLessonDetail.section.title}
                    </p>
                  </div>
                  {activeLessonDetail.section.description && (
                    <p className="text-xs text-gray-600 leading-relaxed pl-6">
                      {activeLessonDetail.section.description}
                    </p>
                  )}
                  <div className="pl-6">
                    {activeLessonDetail.section.isFreePreview ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Section available as Free Preview
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Requires enrollment to access
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Course context */}
            {activeLessonDetail.course && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Course
                </p>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {activeLessonDetail.course.thumbnailUrl && (
                    <img
                      src={activeLessonDetail.course.thumbnailUrl}
                      alt={activeLessonDetail.course.title ?? ""}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {activeLessonDetail.course.title}
                      </p>
                      {activeLessonDetail.course.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activeLessonDetail.course.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeLessonDetail.course.level && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_META[activeLessonDetail.course.level as keyof typeof LEVEL_META]?.bg ?? "bg-gray-100"} ${LEVEL_META[activeLessonDetail.course.level as keyof typeof LEVEL_META]?.color ?? "text-gray-600"}`}
                        >
                          {activeLessonDetail.course.level}
                        </span>
                      )}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {activeLessonDetail.course.isFree
                          ? "Free Course"
                          : `$${activeLessonDetail.course.price} ${activeLessonDetail.course.currency ?? "USD"}`}
                      </span>
                      {activeLessonDetail.course.status && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${activeLessonDetail.course.status === "published" ? "bg-emerald-50 text-emerald-700" : activeLessonDetail.course.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-700"}`}
                        >
                          {activeLessonDetail.course.status === "published"
                            ? "✓ Published"
                            : activeLessonDetail.course.status === "draft"
                              ? "In Draft"
                              : activeLessonDetail.course.status}
                        </span>
                      )}
                      {activeLessonDetail.course.language && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">
                          {activeLessonDetail.course.language}
                        </span>
                      )}
                      {activeLessonDetail.course.shariahCompliant && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/10 text-emerald-800">
                          Shariah Compliant ✓
                        </span>
                      )}
                      {activeLessonDetail.course.certificateIssued && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                          🎓 Certificate Issued
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-1 border-t border-gray-100 text-xs text-gray-500">
                      <span>
                        <span className="font-bold text-gray-700">
                          {activeLessonDetail.course.totalEnrollments ?? 0}
                        </span>{" "}
                        student
                        {(activeLessonDetail.course.totalEnrollments ?? 0) !== 1
                          ? "s"
                          : ""}{" "}
                        enrolled
                      </span>
                      {activeLessonDetail.course.ratingAvg &&
                        parseFloat(activeLessonDetail.course.ratingAvg) > 0 && (
                          <span>
                            <span className="font-bold text-amber-500">
                              ★{" "}
                              {parseFloat(
                                activeLessonDetail.course.ratingAvg,
                              ).toFixed(1)}
                            </span>{" "}
                            rating
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            No lesson details available.
          </p>
        )}
      </Dialog>

      {/* ── Section Inspector Modal ──────────────────────────────────── */}
      <Dialog
        open={inspectingSectionId !== null}
        onClose={() => setInspectingSectionId(null)}
        title="About this Section"
        maxWidth="max-w-2xl"
      >
        {sectionInspectorQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 rounded-full border-2 border-[#D52B1E] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Loading section details…</p>
            </div>
          </div>
        ) : sectionInspectorQuery.data ? (
          <div className="space-y-6">
            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <div className="shrink-0 h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Course Section
                </p>
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {sectionInspectorQuery.data.title}
                </h2>
                {sectionInspectorQuery.data.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {sectionInspectorQuery.data.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <BarChart3 className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-800">
                  Section {sectionInspectorQuery.data.sortOrder ?? 1}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Position in course
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <PlayCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">
                  {sectionInspectorQuery.data.lessons?.length ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Lessons</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                {sectionInspectorQuery.data.isFreePreview ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-emerald-700">
                      Free Preview
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Open access</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-700">
                      Enrolled Only
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Requires enrollment
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Lessons list */}
            {(sectionInspectorQuery.data.lessons?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Lessons in this Section
                </p>
                <div className="space-y-2">
                  {sectionInspectorQuery.data.lessons.map((lesson, idx) => {
                    const lMeta =
                      LESSON_TYPE_META[
                        lesson.type as keyof typeof LESSON_TYPE_META
                      ] ?? LESSON_TYPE_META.video;
                    const LIcon = lMeta.icon;
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-300 w-5 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${lMeta.bg}`}
                        >
                          <LIcon className={`h-4 w-4 ${lMeta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {lMeta.label}
                            {lesson.durationSeconds
                              ? ` · ${formatSecondsAsLabel(lesson.durationSeconds)}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {lesson.isFreePreview && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              Preview
                            </span>
                          )}
                          {lesson.isPublished ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              Live
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Course context */}
            {sectionInspectorQuery.data.course && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Part of Course
                </p>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {sectionInspectorQuery.data.course.thumbnailUrl && (
                    <img
                      src={sectionInspectorQuery.data.course.thumbnailUrl}
                      alt={sectionInspectorQuery.data.course.title ?? ""}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {sectionInspectorQuery.data.course.title}
                      </p>
                      {sectionInspectorQuery.data.course.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sectionInspectorQuery.data.course.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {sectionInspectorQuery.data.course.level && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_META[sectionInspectorQuery.data.course.level as keyof typeof LEVEL_META]?.bg ?? "bg-gray-100"} ${LEVEL_META[sectionInspectorQuery.data.course.level as keyof typeof LEVEL_META]?.color ?? "text-gray-600"}`}
                        >
                          {sectionInspectorQuery.data.course.level}
                        </span>
                      )}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {sectionInspectorQuery.data.course.isFree
                          ? "Free Course"
                          : `$${sectionInspectorQuery.data.course.price} ${sectionInspectorQuery.data.course.currency ?? "USD"}`}
                      </span>
                      {sectionInspectorQuery.data.course.status && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${sectionInspectorQuery.data.course.status === "published" ? "bg-emerald-50 text-emerald-700" : sectionInspectorQuery.data.course.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-700"}`}
                        >
                          {sectionInspectorQuery.data.course.status ===
                          "published"
                            ? "✓ Published"
                            : sectionInspectorQuery.data.course.status ===
                                "draft"
                              ? "In Draft"
                              : sectionInspectorQuery.data.course.status}
                        </span>
                      )}
                      {sectionInspectorQuery.data.course.shariahCompliant && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/10 text-emerald-800">
                          Shariah Compliant ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-1 border-t border-gray-100 text-xs text-gray-500">
                      <span>
                        <span className="font-bold text-gray-700">
                          {sectionInspectorQuery.data.course.totalEnrollments ??
                            0}
                        </span>{" "}
                        student
                        {(sectionInspectorQuery.data.course.totalEnrollments ??
                          0) !== 1
                          ? "s"
                          : ""}{" "}
                        enrolled
                      </span>
                      {sectionInspectorQuery.data.course.ratingAvg &&
                        parseFloat(
                          sectionInspectorQuery.data.course.ratingAvg,
                        ) > 0 && (
                          <span>
                            <span className="font-bold text-amber-500">
                              ★{" "}
                              {parseFloat(
                                sectionInspectorQuery.data.course.ratingAvg,
                              ).toFixed(1)}
                            </span>{" "}
                            rating
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">
            No section details available.
          </p>
        )}
      </Dialog>

      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 px-6 py-8 md:px-12 md:py-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#D52B1E]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#D52B1E]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-8 bottom-2 opacity-5 text-white select-none hidden md:block">
          <GraduationCap className="h-48 w-48" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase mb-3">
              <GraduationCap className="h-3 w-3" /> Instructor Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {name}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Build impactful courses for Islamic Finance professionals
              worldwide.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-3">
              {[
                { label: "Courses", value: totalCourses, icon: BookOpen },
                { label: "Published", value: publishedCourses, icon: Star },
                { label: "Lessons", value: totalLessons, icon: Layers },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[80px]"
                >
                  <stat.icon className="h-4 w-4 text-[#D52B1E] mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowCreateCourse(true)}
              className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-2 px-5 shadow-lg shadow-red-900/30"
            >
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          variants={itemVariants}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* ── Left: Course List ──────────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-3 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                My Courses
              </h2>
              {totalCourses > 0 && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {totalCourses}
                </span>
              )}
            </div>

            {/* Search + filter — only shown when courses exist */}
            {(coursesQuery.data?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses…"
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#D52B1E] focus:ring-1 focus:ring-[#D52B1E]/20 transition-colors"
                  />
                  {courseSearch && (
                    <button
                      onClick={() => setCourseSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  {(["all", "published", "draft"] as const).map((f) => {
                    const cnt =
                      f === "all"
                        ? (coursesQuery.data?.length ?? 0)
                        : (coursesQuery.data ?? []).filter(
                            (c) => c.status === f,
                          ).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors capitalize flex items-center justify-center gap-1 ${
                          statusFilter === f
                            ? "bg-[#D52B1E] text-white shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {f}
                        <span
                          className={`text-[10px] px-1.5 py-0 rounded-full leading-5 ${
                            statusFilter === f
                              ? "bg-white/20 text-white"
                              : "bg-white text-gray-500"
                          }`}
                        >
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Course list */}
            {coursesQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white border border-gray-100 p-3 animate-pulse flex gap-3"
                  >
                    <div className="h-[52px] w-[52px] rounded-xl bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (coursesQuery.data?.length ?? 0) === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-700">No courses yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  Create your first course to get started
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowCreateCourse(true)}
                  className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Course
                </Button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-8 text-center">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">
                  No matching courses
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try a different search or filter
                </p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-440px)] pr-0.5">
                {filteredCourses.map((course, idx) => {
                  const isSelected = selectedCourseId === course.id;
                  const levelMeta = LEVEL_META[
                    course.level as keyof typeof LEVEL_META
                  ] ?? {
                    label: course.level,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                  };
                  const accentColors = [
                    "border-l-blue-400",
                    "border-l-violet-400",
                    "border-l-emerald-400",
                    "border-l-amber-400",
                    "border-l-rose-400",
                  ];
                  const accentColor = accentColors[idx % accentColors.length];
                  const sectionCount =
                    course.sections?.length ?? course.moduleCount ?? 0;
                  const lessonCount = course.videoCount ?? 0;
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setExpandedSectionId(null);
                        setViewingLessonId(null);
                        setManagingQuizId(null);
                        setAddingQuizToLessonId(null);
                        setShowEditQuizSettings(false);
                        setShowAddSection(false);
                        setAddingLessonSectionId(null);
                      }}
                      className={`w-full text-left rounded-[18px] border-l-4 border border-gray-100 transition-all duration-200 ${accentColor} ${
                        isSelected
                          ? "ring-2 ring-[#D52B1E]/25 shadow-[0_10px_24px_-14px_rgba(213,43,30,0.4)] bg-gradient-to-br from-white to-red-50/40"
                          : "bg-white/95 hover:shadow-md hover:border-gray-200"
                      }`}
                    >
                      <div className="flex gap-3 p-3.5">
                        {/* Thumbnail */}
                        <div className="shrink-0 h-[52px] w-[52px] rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                          {course.coverImageUrl ? (
                            <img
                              src={course.coverImageUrl}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug flex-1">
                              {course.title}
                            </p>
                            <span
                              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                                course.status === "published"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : course.status === "suspended"
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {course.status ?? "draft"}
                            </span>
                          </div>
                          {course.subtitle && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mb-1.5">
                              {course.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${levelMeta.bg} ${levelMeta.color}`}
                            >
                              {levelMeta.label}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {sectionCount}S · {lessonCount}L
                            </span>
                            {course.enrolledCount > 0 && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Users className="h-2.5 w-2.5" />
                                {course.enrolledCount}
                              </span>
                            )}
                            {course.isFree ? (
                              <span className="text-[10px] font-semibold text-emerald-600">
                                Free
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-500">
                                ${course.priceUsd}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center justify-end gap-0.5 px-3.5 pb-2.5 -mt-1">
                          <span className="text-[11px] font-bold text-[#D52B1E]">
                            Managing
                          </span>
                          <ChevronRight className="h-3 w-3 text-[#D52B1E]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right: Course Builder ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            {selectedCourseId === "" ? (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#D52B1E]/10 to-red-50 flex items-center justify-center mb-5">
                  <Layers className="h-9 w-9 text-[#D52B1E]/50" />
                </div>
                <p className="text-lg font-bold text-gray-700">
                  No course selected
                </p>
                <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
                  Pick a course from the left panel to manage its curriculum —
                  sections and lessons.
                </p>
              </div>
            ) : courseDetailsQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-white border border-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Course info card */}
                <div className="rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_14px_34px_-22px_rgba(213,43,30,0.45)]">
                  {/* Thumbnail banner */}
                  {courseDetails?.coverImageUrl ? (
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={courseDetails.coverImageUrl}
                        alt={courseDetails.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                        <h2 className="text-lg font-bold text-white leading-tight line-clamp-2 flex-1">
                          {courseDetails.title}
                        </h2>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            courseDetails.status === "published"
                              ? "bg-emerald-500/90 text-white"
                              : courseDetails.status === "suspended"
                                ? "bg-red-500/90 text-white"
                                : "bg-amber-400/90 text-gray-900"
                          }`}
                        >
                          {courseDetails.status}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-gradient-to-br from-white via-white to-red-50/25 p-5">
                    {/* Title (only if no thumbnail) */}
                    {!courseDetails?.coverImageUrl && (
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {courseDetails?.title}
                          </h2>
                          {courseDetails?.subtitle && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {courseDetails.subtitle}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                            courseDetails?.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : courseDetails?.status === "suspended"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {courseDetails?.status}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {courseDetails?.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                        {courseDetails.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-center">
                        <p className="text-base font-bold text-blue-700">
                          {sections.length}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-500 mt-0.5">
                          Sections
                        </p>
                      </div>
                      <div className="rounded-xl bg-purple-50 p-2.5 text-center">
                        <p className="text-base font-bold text-purple-700">
                          {sections.reduce(
                            (t, s) => t + (s.lessons?.length ?? 0),
                            0,
                          )}
                        </p>
                        <p className="text-[10px] font-semibold text-purple-500 mt-0.5">
                          Lessons
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-2.5 text-center">
                        <p className="text-base font-bold text-gray-700">
                          {courseDetails?.enrolledCount ?? 0}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                          Students
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2.5 text-center">
                        <p className="text-base font-bold text-amber-600">
                          {courseDetails?.rating && courseDetails.rating > 0
                            ? courseDetails.rating.toFixed(1)
                            : "—"}
                        </p>
                        <p className="text-[10px] font-semibold text-amber-400 mt-0.5">
                          Rating
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_META[courseDetails?.level as keyof typeof LEVEL_META]?.bg ?? "bg-gray-100"} ${LEVEL_META[courseDetails?.level as keyof typeof LEVEL_META]?.color ?? "text-gray-600"}`}
                      >
                        {courseDetails?.level}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {courseDetails?.isFree
                          ? "Free"
                          : `$${courseDetails?.priceUsd} USD`}
                      </span>
                      {courseDetails?.language && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 uppercase">
                          {courseDetails.language}
                        </span>
                      )}
                      {courseDetails?.shariahCompliant && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/10 text-emerald-800">
                          Shariah ✓
                        </span>
                      )}
                      {courseDetails?.certificateIssued && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                          🎓 Certificate
                        </span>
                      )}
                    </div>

                    {/* Course actions */}
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          courseDetails?.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : courseDetails?.status === "suspended"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            courseDetails?.status === "published"
                              ? "bg-emerald-500"
                              : courseDetails?.status === "suspended"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                        {courseDetails?.status === "published"
                          ? "Live"
                          : courseDetails?.status === "suspended"
                            ? "Suspended"
                            : "Draft"}
                      </span>
                      <button
                        onClick={() => {
                          setCourseForm({
                            title: courseDetails?.title ?? "",
                            subtitle: "",
                            description: courseDetails?.description ?? "",
                            categoryId: "",
                            level: (courseDetails?.level ?? "beginner") as
                              | "beginner"
                              | "intermediate"
                              | "advanced",
                            thumbnailUrl: courseDetails?.coverImageUrl ?? "",
                            price: courseDetails?.priceUsd ?? 0,
                            isFree: courseDetails?.isFree ?? false,
                          });
                          setIsEditingCourse(true);
                          setShowCreateCourse(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Course
                      </button>
                      {courseDetails?.status !== "published" && (
                        <button
                          onClick={() => void handlePublishCourse()}
                          disabled={
                            publishCourseMutation.isPending ||
                            suspendCourseMutation.isPending
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {publishCourseMutation.isPending
                            ? "Publishing..."
                            : courseDetails?.status === "suspended"
                              ? "Re-publish Course"
                              : "Publish Course"}
                        </button>
                      )}
                      {courseDetails?.status === "published" && (
                        <button
                          onClick={() => void handleSuspendCourse()}
                          disabled={
                            suspendCourseMutation.isPending ||
                            publishCourseMutation.isPending
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-60"
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
                          {suspendCourseMutation.isPending
                            ? "Processing..."
                            : "Suspend Course"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sections & Lessons */}
                <div className="rounded-[22px] bg-white border border-gray-100 shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="h-4 w-4 text-white/70" />
                        <h3 className="text-sm font-bold text-white">
                          Course Curriculum
                        </h3>
                      </div>
                      {sections.length > 0 &&
                        (() => {
                          const totalLessons = sections.reduce(
                            (t, s) => t + (s.lessons?.length ?? 0),
                            0,
                          );
                          const totalSecs = sections.reduce(
                            (t, s) =>
                              t +
                              (s.lessons ?? []).reduce(
                                (ls, l) => ls + (l.durationSeconds ?? 0),
                                0,
                              ),
                            0,
                          );
                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-white/60 font-medium">
                                {sections.length} section
                                {sections.length !== 1 ? "s" : ""}
                              </span>
                              <span className="text-white/30">·</span>
                              <span className="text-[11px] text-white/60 font-medium">
                                {totalLessons} lesson
                                {totalLessons !== 1 ? "s" : ""}
                              </span>
                              {totalSecs > 0 && (
                                <>
                                  <span className="text-white/30">·</span>
                                  <span className="text-[11px] text-white/60 font-medium flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatSecondsAsLabel(totalSecs)}
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                    {!showAddSection && (
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Section
                      </button>
                    )}
                  </div>

                  {sections.length === 0 && !showAddSection && (
                    <div className="py-14 text-center px-6">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Layers className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        No sections yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1 mb-5">
                        Structure your course into sections, then add lessons to
                        each
                      </p>
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#D52B1E] hover:bg-[#b82319] px-4 py-2 rounded-xl transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add First Section
                      </button>
                    </div>
                  )}

                  {sections.map((section, sIdx) => {
                    const isExpanded = expandedSectionId === section.id;
                    const lessonCount = section.lessons?.length ?? 0;
                    const sectionDuration = (section.lessons ?? []).reduce(
                      (t, l) => t + (l.durationSeconds ?? 0),
                      0,
                    );
                    return (
                      <div
                        key={section.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        {/* Section header row */}
                        <div
                          className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isExpanded ? "bg-blue-50/40" : "hover:bg-gray-50/50"}`}
                        >
                          {/* Number badge */}
                          <div className="shrink-0 h-7 w-7 rounded-lg bg-[#D52B1E]/10 text-[#D52B1E] flex items-center justify-center text-xs font-bold">
                            {sIdx + 1}
                          </div>

                          {/* Title + meta */}
                          <button
                            className="flex-1 min-w-0 text-left"
                            onClick={() =>
                              setExpandedSectionId(
                                isExpanded ? null : String(section.id),
                              )
                            }
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-800 truncate">
                                {section.title}
                              </span>
                              {section.isFreePreview && (
                                <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-blue-100 text-blue-700 leading-5">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400 font-medium">
                                {lessonCount} lesson
                                {lessonCount !== 1 ? "s" : ""}
                              </span>
                              {sectionDuration > 0 && (
                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatSecondsAsLabel(sectionDuration)}
                                </span>
                              )}
                              {section.description && (
                                <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
                                  {section.description}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Actions */}
                          <div className="shrink-0 flex items-center gap-1">
                            <button
                              className="flex items-center gap-1 text-xs font-semibold text-[#D52B1E] bg-[#D52B1E]/8 hover:bg-[#D52B1E]/15 px-3 py-1.5 rounded-lg transition-colors"
                              onClick={() => {
                                setExpandedSectionId(String(section.id));
                                setAddingLessonSectionId(
                                  addingLessonSectionId === String(section.id)
                                    ? null
                                    : String(section.id),
                                );
                                setLessonForm(emptyLessonForm);
                              }}
                            >
                              <Plus className="h-3 w-3" /> Lesson
                            </button>
                            <button
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() =>
                                setInspectingSectionId(String(section.id))
                              }
                              title="View section details"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                              onClick={() =>
                                setExpandedSectionId(
                                  isExpanded ? null : String(section.id),
                                )
                              }
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="bg-blue-50/20 px-5 pb-5 pt-2">
                            {/* Lesson list */}
                            {lessonCount > 0 && (
                              <div className="space-y-1.5 mb-4">
                                {section.lessons!.map((lesson, lIdx) => {
                                  const meta =
                                    LESSON_TYPE_META[
                                      lesson.type as keyof typeof LESSON_TYPE_META
                                    ] ?? LESSON_TYPE_META.video;
                                  const LessonIcon = meta.icon;
                                  return (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3.5 py-2.5 shadow-sm hover:shadow transition-shadow"
                                    >
                                      <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0 text-right">
                                        {lIdx + 1}
                                      </span>
                                      <div
                                        className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${meta.bg}`}
                                      >
                                        <LessonIcon
                                          className={`h-3.5 w-3.5 ${meta.color}`}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                          {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className={`text-[10px] font-bold px-1.5 py-0 rounded-full leading-5 border ${meta.bg} ${meta.color} ${meta.border}`}
                                          >
                                            {meta.label}
                                          </span>
                                          {lesson.durationSeconds ? (
                                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                                              <Clock className="h-2.5 w-2.5" />
                                              {formatSecondsAsLabel(
                                                lesson.durationSeconds,
                                              )}
                                            </span>
                                          ) : null}
                                          {lesson.contentUrl && (
                                            <span className="text-[10px] text-blue-500 font-medium flex items-center gap-0.5">
                                              <ExternalLink className="h-2.5 w-2.5" />{" "}
                                              Link
                                            </span>
                                          )}
                                          {lesson.isFreePreview && (
                                            <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-blue-50 text-blue-600 leading-5">
                                              Preview
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {lesson.isPublished ? (
                                          <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-emerald-50 text-emerald-700 leading-5">
                                            Live
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-amber-50 text-amber-700 leading-5">
                                            Draft
                                          </span>
                                        )}
                                        {/* Quiz badge + button */}
                                        {(lesson.quizId != null ||
                                          (lesson.quizzes &&
                                            (lesson.quizzes as unknown[])
                                              .length > 0)) && (
                                          <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-violet-50 text-violet-700 leading-5 border border-violet-100">
                                            Quiz
                                          </span>
                                        )}
                                        <button
                                          onClick={() => {
                                            const rawQuizId =
                                              lesson.quizId ??
                                              (
                                                lesson.quizzes?.[0] as
                                                  | Record<string, unknown>
                                                  | undefined
                                              )?.id;
                                            if (rawQuizId != null) {
                                              setManagingQuizId(
                                                String(rawQuizId),
                                              );
                                              setShowEditQuizSettings(false);
                                            } else {
                                              setAddingQuizToLessonId(
                                                String(lesson.id),
                                              );
                                              setAddingQuizLessonTitle(
                                                lesson.title,
                                              );
                                              setQuizForm({
                                                title: "",
                                                description: "",
                                                passPercentage: 70,
                                                timeLimitMinutes: "",
                                              });
                                            }
                                          }}
                                          className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${
                                            lesson.quizId != null ||
                                            (lesson.quizzes &&
                                              (lesson.quizzes as unknown[])
                                                .length > 0)
                                              ? "text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100"
                                              : "text-[#D52B1E] bg-[#D52B1E]/8 border-[#D52B1E]/30 hover:bg-[#D52B1E]/15 shadow-[0_0_0_2px_rgba(213,43,30,0.06)]"
                                          }`}
                                          title={
                                            lesson.quizId != null
                                              ? "Manage lesson quiz"
                                              : "Attach quiz to lesson"
                                          }
                                        >
                                          <HelpCircle className="h-3.5 w-3.5" />
                                          <span>
                                            {lesson.quizId != null ||
                                            (lesson.quizzes &&
                                              (lesson.quizzes as unknown[])
                                                .length > 0)
                                              ? "Manage quiz"
                                              : "Add quiz"}
                                          </span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            setViewingLessonId(
                                              viewingLessonId ===
                                                String(lesson.id)
                                                ? null
                                                : String(lesson.id),
                                            )
                                          }
                                          className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#D52B1E] transition-colors"
                                          title="View full lesson details"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {lessonCount === 0 &&
                              addingLessonSectionId !== String(section.id) && (
                                <p className="text-xs text-gray-400 mb-3 italic">
                                  No lessons in this section yet.
                                </p>
                              )}

                            {/* Add lesson inline form */}
                            {addingLessonSectionId === String(section.id) ? (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl border border-[#D52B1E]/20 bg-white shadow-sm p-4 space-y-3"
                              >
                                <div className="flex items-center gap-2 pb-1">
                                  <div className="h-6 w-6 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                                    <Plus className="h-3.5 w-3.5 text-[#D52B1E]" />
                                  </div>
                                  <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-wider">
                                    Add Lesson to "{section.title}"
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="col-span-2">
                                    <label className={labelCls}>Title *</label>
                                    <input
                                      className={inputCls}
                                      value={lessonForm.title}
                                      onChange={(e) =>
                                        setLessonForm((f) => ({
                                          ...f,
                                          title: e.target.value,
                                        }))
                                      }
                                      placeholder="What is Riba?"
                                      autoFocus
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Type *</label>
                                    <select
                                      className={inputCls}
                                      value={lessonForm.type}
                                      onChange={(e) =>
                                        setLessonForm((f) => ({
                                          ...f,
                                          type: e.target.value as typeof f.type,
                                        }))
                                      }
                                    >
                                      <option value="video">Video</option>
                                      <option value="article">Article</option>
                                      <option value="quiz">Quiz</option>
                                      <option value="assignment">
                                        Assignment
                                      </option>
                                      <option value="live_session">
                                        Live Session
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>
                                      Sort Order
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      className={inputCls}
                                      value={lessonForm.sortOrder}
                                      onChange={(e) =>
                                        setLessonForm((f) => ({
                                          ...f,
                                          sortOrder: e.target.value,
                                        }))
                                      }
                                      placeholder={String(lessonCount + 1)}
                                    />
                                  </div>
                                  {lessonForm.type === "video" && (
                                    <>
                                      <div className="col-span-2">
                                        <label className={labelCls}>
                                          Video URL
                                        </label>
                                        <input
                                          className={inputCls}
                                          value={lessonForm.contentUrl}
                                          onChange={(e) =>
                                            setLessonForm((f) => ({
                                              ...f,
                                              contentUrl: e.target.value,
                                            }))
                                          }
                                          placeholder="https://youtube.com/watch?v=..."
                                        />
                                      </div>
                                      <div>
                                        <label className={labelCls}>
                                          Duration (seconds)
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          className={inputCls}
                                          value={lessonForm.durationSeconds}
                                          onChange={(e) =>
                                            setLessonForm((f) => ({
                                              ...f,
                                              durationSeconds: e.target.value,
                                            }))
                                          }
                                          placeholder="600"
                                        />
                                      </div>
                                    </>
                                  )}
                                  {(lessonForm.type === "article" ||
                                    lessonForm.type === "assignment") && (
                                    <div className="col-span-2">
                                      <label className={labelCls}>
                                        Content
                                      </label>
                                      <textarea
                                        rows={3}
                                        className={inputCls}
                                        value={lessonForm.contentText}
                                        onChange={(e) =>
                                          setLessonForm((f) => ({
                                            ...f,
                                            contentText: e.target.value,
                                          }))
                                        }
                                        placeholder="Lesson content or assignment instructions…"
                                      />
                                    </div>
                                  )}
                                  {lessonForm.type === "live_session" && (
                                    <>
                                      <div className="col-span-2">
                                        <label className={labelCls}>
                                          Meeting Link
                                        </label>
                                        <input
                                          className={inputCls}
                                          value={lessonForm.meetingLink}
                                          onChange={(e) =>
                                            setLessonForm((f) => ({
                                              ...f,
                                              meetingLink: e.target.value,
                                            }))
                                          }
                                          placeholder="https://zoom.us/j/…"
                                        />
                                      </div>
                                      <div>
                                        <label className={labelCls}>
                                          Scheduled At
                                        </label>
                                        <input
                                          type="datetime-local"
                                          className={inputCls}
                                          value={lessonForm.scheduledAt}
                                          onChange={(e) =>
                                            setLessonForm((f) => ({
                                              ...f,
                                              scheduledAt: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className={labelCls}>
                                          Duration (seconds)
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          className={inputCls}
                                          value={lessonForm.durationSeconds}
                                          onChange={(e) =>
                                            setLessonForm((f) => ({
                                              ...f,
                                              durationSeconds: e.target.value,
                                            }))
                                          }
                                          placeholder="3600"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-500"
                                    onClick={() => {
                                      setAddingLessonSectionId(null);
                                      setLessonForm(emptyLessonForm);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      void handleAddLesson(String(section.id))
                                    }
                                    disabled={
                                      !lessonForm.title.trim() ||
                                      addLessonMutation.isPending
                                    }
                                    className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5"
                                  >
                                    {addLessonMutation.isPending ? (
                                      <>
                                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                        Adding…
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3.5 w-3.5" /> Add
                                        Lesson
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <button
                                className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#D52B1E] transition-colors mt-1"
                                onClick={() => {
                                  setAddingLessonSectionId(String(section.id));
                                  setLessonForm(emptyLessonForm);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" /> Add lesson to
                                this section
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add section form */}
                  {showAddSection && (
                    <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center text-xs font-bold text-[#D52B1E]">
                            {sections.length + 1}
                          </div>
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            New Section
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-white border border-gray-100 rounded-xl p-4">
                          <div className="col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input
                              className={inputCls}
                              value={sectionForm.title}
                              onChange={(e) =>
                                setSectionForm((f) => ({
                                  ...f,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="e.g. Introduction to Islamic Banking"
                              autoFocus
                            />
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Description</label>
                            <input
                              className={inputCls}
                              value={sectionForm.description}
                              onChange={(e) =>
                                setSectionForm((f) => ({
                                  ...f,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="What students will learn in this section"
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Sort Order</label>
                            <input
                              type="number"
                              min={1}
                              className={inputCls}
                              value={sectionForm.sortOrder}
                              onChange={(e) =>
                                setSectionForm((f) => ({
                                  ...f,
                                  sortOrder: e.target.value,
                                }))
                              }
                              placeholder={String(sections.length + 1)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500"
                            onClick={() => {
                              setShowAddSection(false);
                              setSectionForm(emptySectionForm);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => void handleAddSection()}
                            disabled={
                              !sectionForm.title.trim() ||
                              addSectionMutation.isPending
                            }
                            className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5"
                          >
                            {addSectionMutation.isPending ? (
                              <>
                                <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                Adding…
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" /> Add Section
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* ── Quiz Management ─────────────────────────────────── */}
                <div className="rounded-[22px] bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#D52B1E]" />
                      <h3 className="text-sm font-bold text-gray-800">
                        Quiz Management
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {courseQuizzes.length} quiz
                      {courseQuizzes.length !== 1 ? "zes" : ""}
                    </span>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    {!managingQuizId ? (
                      <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                        <HelpCircle className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-500">
                          No quiz selected
                        </p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                          Click the{" "}
                          <HelpCircle className="inline h-3 w-3 text-violet-400" />{" "}
                          icon on a lesson row above to attach a quiz or manage
                          an existing one.
                        </p>
                      </div>
                    ) : quizDetailsQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 rounded-full border-2 border-[#D52B1E] border-t-transparent animate-spin" />
                      </div>
                    ) : quizDetailsQuery.data ? (
                      (() => {
                        const quiz = quizDetailsQuery.data;
                        const questions = (quiz.questions ?? []) as Array<{
                          id?: string;
                          text?: string;
                          questionText?: string;
                          type?: string;
                          points?: number;
                          options?: Array<{
                            id?: string;
                            text?: string;
                            optionText?: string;
                            isCorrect?: boolean;
                          }>;
                        }>;
                        const attempts = quizAttemptsQuery.data ?? [];
                        return (
                          <div className="space-y-3">
                            {/* Quiz header */}
                            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-800 truncate">
                                    {quiz.title}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] font-semibold text-gray-500">
                                      {questions.length} question
                                      {questions.length !== 1 ? "s" : ""}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-[10px] font-semibold text-gray-500">
                                      Pass: {quiz.passPercentage ?? 70}%
                                    </span>
                                    {quiz.timeLimitMinutes && (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-[10px] font-semibold text-gray-500">
                                          {quiz.timeLimitMinutes} min
                                        </span>
                                      </>
                                    )}
                                    {quiz.maxAttempts != null ? (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0 rounded-full leading-5">
                                          Max {quiz.maxAttempts} attempt
                                          {quiz.maxAttempts !== 1 ? "s" : ""}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0 rounded-full leading-5">
                                          Unlimited attempts
                                        </span>
                                      </>
                                    )}
                                    {quiz.isPublished ? (
                                      <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-emerald-50 text-emerald-700 leading-5">
                                        Published
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-1.5 py-0 rounded-full bg-amber-50 text-amber-700 leading-5">
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  {!quiz.isPublished && (
                                    <button
                                      onClick={() =>
                                        void updateQuizMutation.mutateAsync({
                                          id: managingQuizId,
                                          payload: { isPublished: true },
                                        })
                                      }
                                      disabled={updateQuizMutation.isPending}
                                      className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-60"
                                      title="Publish this quiz"
                                    >
                                      Publish
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setShowEditQuizSettings(
                                        !showEditQuizSettings,
                                      );
                                      setEditQuizForm({
                                        title: quiz.title,
                                        description: quiz.description ?? "",
                                        passPercentage:
                                          quiz.passPercentage ?? 70,
                                        timeLimitMinutes: quiz.timeLimitMinutes
                                          ? String(quiz.timeLimitMinutes)
                                          : "",
                                        maxAttempts: quiz.maxAttempts
                                          ? String(quiz.maxAttempts)
                                          : "",
                                        isPublished: quiz.isPublished ?? false,
                                      });
                                    }}
                                    className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${showEditQuizSettings ? "bg-blue-100 text-blue-700" : "text-blue-600 hover:bg-blue-50"}`}
                                    title="Edit quiz settings"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Delete this quiz and all its contents? Students will no longer be required to complete it.",
                                        )
                                      )
                                        void deleteQuizMutation
                                          .mutateAsync(managingQuizId)
                                          .then(() => {
                                            setManagingQuizId(null);
                                            setShowEditQuizSettings(false);
                                          });
                                    }}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete quiz"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setManagingQuizId(null);
                                      setShowEditQuizSettings(false);
                                    }}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                    title="Close"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Edit settings form */}
                              {showEditQuizSettings && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-3 pt-3 border-t border-gray-100 space-y-3"
                                >
                                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Edit Quiz Settings
                                  </p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                      <label className={labelCls}>Title</label>
                                      <input
                                        className={inputCls}
                                        value={editQuizForm.title}
                                        onChange={(e) =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            title: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <label className={labelCls}>
                                        Description
                                      </label>
                                      <textarea
                                        rows={2}
                                        className={inputCls}
                                        value={editQuizForm.description}
                                        onChange={(e) =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className={labelCls}>
                                        Pass % *
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className={inputCls}
                                        value={editQuizForm.passPercentage}
                                        onChange={(e) =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            passPercentage:
                                              Number(e.target.value) || 70,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className={labelCls}>
                                        Time Limit (min)
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        className={inputCls}
                                        value={editQuizForm.timeLimitMinutes}
                                        onChange={(e) =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            timeLimitMinutes: e.target.value,
                                          }))
                                        }
                                        placeholder="None"
                                      />
                                    </div>
                                    <div>
                                      <label className={labelCls}>
                                        Max Attempts
                                      </label>
                                      <input
                                        type="number"
                                        min={1}
                                        className={inputCls}
                                        value={editQuizForm.maxAttempts}
                                        onChange={(e) =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            maxAttempts: e.target.value,
                                          }))
                                        }
                                        placeholder="Unlimited"
                                      />
                                      <p className="text-[10px] text-gray-400 mt-0.5">
                                        Leave blank for unlimited. Once passed,
                                        retake is blocked regardless.
                                      </p>
                                    </div>
                                    <div className="flex items-center pt-4">
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            isPublished: !f.isPublished,
                                          }))
                                        }
                                        onKeyDown={(e) =>
                                          (e.key === " " ||
                                            e.key === "Enter") &&
                                          setEditQuizForm((f) => ({
                                            ...f,
                                            isPublished: !f.isPublished,
                                          }))
                                        }
                                        className="flex items-center gap-2 cursor-pointer select-none"
                                      >
                                        <button
                                          type="button"
                                          role="switch"
                                          aria-checked={
                                            editQuizForm.isPublished
                                          }
                                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${editQuizForm.isPublished ? "bg-emerald-500" : "bg-gray-200"}`}
                                        >
                                          <span
                                            aria-hidden="true"
                                            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${editQuizForm.isPublished ? "translate-x-4" : "translate-x-0"}`}
                                          />
                                        </button>
                                        <span className="text-xs font-medium text-gray-700">
                                          Published
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setShowEditQuizSettings(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        void handleUpdateQuizSettings()
                                      }
                                      disabled={updateQuizMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                    >
                                      {updateQuizMutation.isPending ? (
                                        <>
                                          <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                          Saving…
                                        </>
                                      ) : (
                                        "Save Settings"
                                      )}
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Quiz attempts summary */}
                            {attempts.length > 0 && (
                              <div className="rounded-xl border border-gray-100 p-3">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <BarChart3 className="h-3 w-3" /> Recent
                                  Attempts
                                </p>
                                <div className="space-y-1">
                                  {attempts.slice(0, 5).map((att) => (
                                    <div
                                      key={att.id}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <span className="text-gray-600">
                                        {att.studentId
                                          ? att.studentId.slice(0, 8) + "…"
                                          : "Student"}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`font-bold ${att.status === "passed" ? "text-emerald-600" : "text-amber-600"}`}
                                        >
                                          {att.score}%
                                        </span>
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${att.status === "passed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                                        >
                                          {att.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Questions list */}
                            <div className="space-y-2">
                              {questions.map((q, qIdx) => (
                                <div
                                  key={String(q.id ?? qIdx)}
                                  className="rounded-xl border border-gray-100 p-3 space-y-2"
                                >
                                  {editingQuestionId === String(q.id) ? (
                                    <div className="space-y-2">
                                      <label className={labelCls}>
                                        Question text
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          className={`${inputCls} flex-1`}
                                          value={editingQuestionText}
                                          onChange={(e) =>
                                            setEditingQuestionText(
                                              e.target.value,
                                            )
                                          }
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              editingQuestionText.trim() &&
                                              q.id
                                            )
                                              void updateQuestionMutation
                                                .mutateAsync({
                                                  questionId: q.id,
                                                  payload: {
                                                    text: editingQuestionText,
                                                  },
                                                })
                                                .then(() =>
                                                  setEditingQuestionId(null),
                                                );
                                            if (e.key === "Escape")
                                              setEditingQuestionId(null);
                                          }}
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            if (
                                              editingQuestionText.trim() &&
                                              q.id
                                            )
                                              void updateQuestionMutation
                                                .mutateAsync({
                                                  questionId: q.id,
                                                  payload: {
                                                    text: editingQuestionText,
                                                  },
                                                })
                                                .then(() =>
                                                  setEditingQuestionId(null),
                                                );
                                          }}
                                          disabled={
                                            !editingQuestionText.trim() ||
                                            updateQuestionMutation.isPending
                                          }
                                          className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          {updateQuestionMutation.isPending
                                            ? "Saving…"
                                            : "Save"}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            setEditingQuestionId(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800">
                                          <span className="font-bold text-gray-400 mr-1.5">
                                            {qIdx + 1}.
                                          </span>
                                          {String(
                                            q.questionText ?? q.text ?? "",
                                          )}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                          {String(q.type ?? "mcq")} ·{" "}
                                          {q.points ?? 1} pt
                                          {(q.points ?? 1) !== 1 ? "s" : ""}
                                        </p>
                                      </div>
                                      {confirmDeleteQuestionId ===
                                      String(q.id) ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-xs text-red-600 font-medium">
                                            Delete this question?
                                          </span>
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              if (q.id)
                                                void deleteQuestionMutation
                                                  .mutateAsync(q.id)
                                                  .then(() =>
                                                    setConfirmDeleteQuestionId(
                                                      null,
                                                    ),
                                                  );
                                            }}
                                            disabled={
                                              deleteQuestionMutation.isPending
                                            }
                                            className="h-6 px-2 text-xs bg-red-500 hover:bg-red-600 text-white"
                                          >
                                            {deleteQuestionMutation.isPending
                                              ? "…"
                                              : "Delete"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              setConfirmDeleteQuestionId(null)
                                            }
                                            className="h-6 px-2 text-xs"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <button
                                            onClick={() => {
                                              setEditingQuestionId(
                                                String(q.id),
                                              );
                                              setEditingQuestionText(
                                                String(
                                                  q.questionText ??
                                                    q.text ??
                                                    "",
                                                ),
                                              );
                                            }}
                                            className="h-6 w-6 flex items-center justify-center rounded text-blue-500 hover:bg-blue-50"
                                            title="Edit question"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              setConfirmDeleteQuestionId(
                                                String(q.id),
                                              )
                                            }
                                            className="h-6 w-6 flex items-center justify-center rounded text-red-400 hover:bg-red-50"
                                            title="Delete question"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setAddingOptionToQId(
                                                addingOptionToQId ===
                                                  String(q.id)
                                                  ? null
                                                  : String(q.id ?? ""),
                                              );
                                              setOptionForm({
                                                text: "",
                                                isCorrect: false,
                                              });
                                            }}
                                            className="h-6 w-6 flex items-center justify-center rounded text-emerald-500 hover:bg-emerald-50"
                                            title="Add option"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {/* Options */}
                                  {(q.options ?? []).length > 0 && (
                                    <div className="space-y-1 pl-4 border-l-2 border-gray-100">
                                      {(q.options ?? []).map((opt, oIdx) => (
                                        <div key={String(opt.id ?? oIdx)}>
                                          {editingOptionId ===
                                          String(opt.id) ? (
                                            <div className="flex items-center gap-2">
                                              <input
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
                                                value={editingOptionText}
                                                onChange={(e) =>
                                                  setEditingOptionText(
                                                    e.target.value,
                                                  )
                                                }
                                                autoFocus
                                                onKeyDown={(e) => {
                                                  if (
                                                    e.key === "Enter" &&
                                                    editingOptionText.trim() &&
                                                    opt.id
                                                  )
                                                    void updateOptionMutation
                                                      .mutateAsync({
                                                        id: opt.id,
                                                        payload: {
                                                          text: editingOptionText,
                                                        },
                                                      })
                                                      .then(() =>
                                                        setEditingOptionId(
                                                          null,
                                                        ),
                                                      );
                                                  if (e.key === "Escape")
                                                    setEditingOptionId(null);
                                                }}
                                              />
                                              <button
                                                onClick={() => {
                                                  if (
                                                    editingOptionText.trim() &&
                                                    opt.id
                                                  )
                                                    void updateOptionMutation
                                                      .mutateAsync({
                                                        id: opt.id,
                                                        payload: {
                                                          text: editingOptionText,
                                                        },
                                                      })
                                                      .then(() =>
                                                        setEditingOptionId(
                                                          null,
                                                        ),
                                                      );
                                                }}
                                                disabled={
                                                  !editingOptionText.trim() ||
                                                  updateOptionMutation.isPending
                                                }
                                                className="text-[10px] font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded px-1.5 py-0.5 disabled:opacity-50"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setEditingOptionId(null)
                                                }
                                                className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 rounded px-1.5 py-0.5 border border-gray-200"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : confirmDeleteOptionId ===
                                            String(opt.id) ? (
                                            <div className="flex items-center gap-2 text-xs">
                                              <span className="text-red-600 font-medium flex-1 truncate">
                                                Delete "
                                                {String(
                                                  opt.optionText ??
                                                    opt.text ??
                                                    "",
                                                )}
                                                "?
                                              </span>
                                              <button
                                                onClick={() => {
                                                  if (opt.id)
                                                    void deleteOptionMutation
                                                      .mutateAsync(opt.id)
                                                      .then(() =>
                                                        setConfirmDeleteOptionId(
                                                          null,
                                                        ),
                                                      );
                                                }}
                                                disabled={
                                                  deleteOptionMutation.isPending
                                                }
                                                className="text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 disabled:opacity-50"
                                              >
                                                {deleteOptionMutation.isPending
                                                  ? "…"
                                                  : "Delete"}
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setConfirmDeleteOptionId(null)
                                                }
                                                className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 rounded px-1.5 py-0.5 border border-gray-200"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between text-xs">
                                              <span
                                                className={`flex items-center gap-1.5 ${opt.isCorrect ? "text-emerald-700 font-semibold" : "text-gray-500"}`}
                                              >
                                                <span
                                                  className={`h-2 w-2 rounded-full shrink-0 ${opt.isCorrect ? "bg-emerald-500" : "bg-gray-300"}`}
                                                />
                                                {String(
                                                  opt.optionText ??
                                                    opt.text ??
                                                    "",
                                                )}
                                              </span>
                                              <div className="flex items-center gap-0.5">
                                                <button
                                                  onClick={() => {
                                                    setEditingOptionId(
                                                      String(opt.id),
                                                    );
                                                    setEditingOptionText(
                                                      String(
                                                        opt.optionText ??
                                                          opt.text ??
                                                          "",
                                                      ),
                                                    );
                                                  }}
                                                  className="h-5 w-5 flex items-center justify-center rounded text-blue-400 hover:bg-blue-50"
                                                  title="Edit option"
                                                >
                                                  <Edit className="h-2.5 w-2.5" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    setConfirmDeleteOptionId(
                                                      String(opt.id),
                                                    )
                                                  }
                                                  className="h-5 w-5 flex items-center justify-center rounded text-red-400 hover:bg-red-50"
                                                  title="Delete option"
                                                >
                                                  <Trash2 className="h-2.5 w-2.5" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Add option inline */}
                                  {addingOptionToQId === String(q.id) && (
                                    <div className="space-y-1.5 border-t border-gray-100 pt-2">
                                      <label className={labelCls}>
                                        New option
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          className={`${inputCls} flex-1`}
                                          value={optionForm.text}
                                          onChange={(e) =>
                                            setOptionForm((f) => ({
                                              ...f,
                                              text: e.target.value,
                                            }))
                                          }
                                          placeholder="Option text"
                                          autoFocus
                                        />
                                        <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                                          <input
                                            type="checkbox"
                                            checked={optionForm.isCorrect}
                                            onChange={(e) =>
                                              setOptionForm((f) => ({
                                                ...f,
                                                isCorrect: e.target.checked,
                                              }))
                                            }
                                            className="rounded border-gray-300"
                                          />
                                          Correct answer
                                        </label>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            void handleAddOptionToQuestion()
                                          }
                                          disabled={
                                            !optionForm.text.trim() ||
                                            addOptionMutation.isPending
                                          }
                                          className="bg-[#D52B1E] hover:bg-[#b82319] text-white text-xs px-2 py-1 h-7"
                                        >
                                          {addOptionMutation.isPending
                                            ? "Adding…"
                                            : "Add"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add question */}
                            {showAddQuestion ? (
                              <div className="rounded-xl border border-[#D52B1E]/25 bg-[#D52B1E]/[0.03] p-4 space-y-3">
                                <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-wider">
                                  New Question
                                </p>
                                <div>
                                  <label className={labelCls}>
                                    Question text *
                                  </label>
                                  <input
                                    className={inputCls}
                                    value={questionForm.text}
                                    onChange={(e) =>
                                      setQuestionForm((f) => ({
                                        ...f,
                                        text: e.target.value,
                                      }))
                                    }
                                    placeholder="e.g. What is the definition of Murabaha?"
                                    autoFocus
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={labelCls}>
                                      Question type *
                                    </label>
                                    <select
                                      className={inputCls}
                                      value={questionForm.type}
                                      onChange={(e) =>
                                        setQuestionForm((f) => ({
                                          ...f,
                                          type: e.target.value,
                                        }))
                                      }
                                    >
                                      <option value="mcq">
                                        Multiple Choice (MCQ)
                                      </option>
                                      <option value="true_false">
                                        True / False
                                      </option>
                                      <option value="short_answer">
                                        Short Answer
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Points</label>
                                    <input
                                      type="number"
                                      min={1}
                                      className={inputCls}
                                      value={questionForm.points}
                                      onChange={(e) =>
                                        setQuestionForm((f) => ({
                                          ...f,
                                          points: Number(e.target.value) || 1,
                                        }))
                                      }
                                      placeholder="1"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowAddQuestion(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      void handleAddQuestionToQuiz()
                                    }
                                    disabled={
                                      !questionForm.text.trim() ||
                                      addQuestionMutation.isPending
                                    }
                                    className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5"
                                  >
                                    {addQuestionMutation.isPending ? (
                                      <>
                                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                                        Adding…
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3" /> Add
                                        Question
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAddQuestion(true)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D52B1E]/30 px-4 py-3 text-sm font-semibold text-[#D52B1E] hover:bg-[#D52B1E]/5 hover:border-[#D52B1E]/50 transition-colors"
                              >
                                <Plus className="h-4 w-4" /> Add Question
                              </button>
                            )}
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Add Quiz to Lesson Dialog ─────────────────────────────── */}
      {addingQuizToLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Attach Quiz to Lesson
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">
                  {addingQuizLessonTitle || "Selected lesson"}
                </p>
              </div>
              <button
                onClick={() => {
                  setAddingQuizToLessonId(null);
                  setAddingQuizLessonTitle("");
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Quiz Title *</label>
                <input
                  className={inputCls}
                  value={quizForm.title}
                  onChange={(e) =>
                    setQuizForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Module 1 Assessment"
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <div className="mt-1.5">
                  <RichTextEditor
                    value={quizForm.description}
                    onChange={(value) =>
                      setQuizForm((f) => ({ ...f, description: value }))
                    }
                    placeholder="Add quiz instructions, required topics, marking guidance, and any references. You can use headings, bullets, numbering, links, and emphasis."
                    minHeight="240px"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports rich formatting: headings, bullet/numbered lists,
                  bold/italic, links, and separators.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Pass % *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputCls}
                    value={quizForm.passPercentage}
                    onChange={(e) =>
                      setQuizForm((f) => ({
                        ...f,
                        passPercentage: Number(e.target.value) || 70,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Time Limit (min)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={quizForm.timeLimitMinutes}
                    onChange={(e) =>
                      setQuizForm((f) => ({
                        ...f,
                        timeLimitMinutes: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                The quiz will be attached to this lesson. Students must pass the
                quiz to complete the lesson. By default, attempts are unlimited;
                once passed, retake is blocked.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => {
                  setAddingQuizToLessonId(null);
                  setAddingQuizLessonTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleAddQuiz()}
                disabled={!quizForm.title.trim() || addQuizMutation.isPending}
                className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-2"
              >
                {addQuizMutation.isPending ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Quiz
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export function Academy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courseSearch, setCourseSearch] = useState("");
  const [coursesPage, setCoursesPage] = useState(1);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const coursesPerPage = 24;
  const enrollmentsPerPage = 9;
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "courses" ? tab : "my-learning";
  });
  const [selectedCourseId, setSelectedCourseId] = useState<
    string | number | null
  >(null);

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

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useAcademyDashboard();
  const {
    data: myEnrollments = [],
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useAcademyMyEnrollments({
    page: enrollmentsPage,
    perPage: enrollmentsPerPage,
  });
  const { data: myEnrollmentsMeta } = useAcademyMyEnrollmentsMeta({
    page: enrollmentsPage,
    perPage: enrollmentsPerPage,
  });
  const { data: upcoming = [], refetch: refetchUpcoming } =
    useAcademyUpcomingActivities();
  const {
    data: courseList,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useAcademyCourses({
    page: coursesPage,
    perPage: coursesPerPage,
    search: courseSearch || undefined,
  });
  const { data: coursesMeta } = useAcademyCoursesMeta({
    page: coursesPage,
    perPage: coursesPerPage,
    search: courseSearch || undefined,
  });

  const enrollMutation = useEnrollInAcademyCourse();
  const unenrollMutation = useUnenrollFromAcademyCourse();

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string | number>();
    for (const item of myEnrollments) {
      if (
        typeof item.currentCourseId === "number" ||
        typeof item.currentCourseId === "string"
      ) {
        ids.add(item.currentCourseId);
      }
      if (
        typeof item.courseId === "number" ||
        typeof item.courseId === "string"
      ) {
        ids.add(item.courseId);
      }
    }
    return ids;
  }, [myEnrollments]);

  const fullName = [me?.firstName, me?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const welcomeName = fullName || me?.username || "Learner";
  const selectedCourse = useMemo(() => {
    if (selectedCourseId === null || selectedCourseId === undefined) {
      return undefined;
    }

    const fromList = courseList?.find(
      (course) => String(course.id) === String(selectedCourseId),
    );
    if (fromList) return fromList;

    const enrollment = myEnrollments.find(
      (item) =>
        String(item.courseId) === String(selectedCourseId) ||
        String(item.currentCourseId) === String(selectedCourseId),
    );
    if (!enrollment) return undefined;

    return buildCourseStub(
      selectedCourseId,
      enrollment.course?.title ??
        (enrollment.programme as { title?: string } | null)?.title,
    );
  }, [courseList, myEnrollments, selectedCourseId]);

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
  const weeklyProgress = Number(dashboard?.weeklyProgress ?? 0) || 0;

  useEffect(() => {
    setCoursesPage(1);
  }, [courseSearch]);

  if (me?.role === "instructor") {
    return (
      <InstructorLearningWorkspace
        name={
          `${me.firstName || ""} ${me.lastName || ""}`.trim() || "Instructor"
        }
        educatorId={`${me?.id ?? ""}`}
      />
    );
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
                  {dashboard?.enrollments?.filter((e) => e.hasCertificate)
                    .length ?? 0}{" "}
                  Certificates
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-gray-600" />{" "}
                  {weeklyProgress}% Weekly Progress
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
                  {weeklyProgress}%
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
                : `${weeklyProgress}% weekly progress | ${dashboard?.completedCourses ?? 0} courses completed`}
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
            value: `${weeklyProgress}%`,
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
              <h2 className="text-xl font-semibold text-gray-900">
                My Learning
              </h2>
              <span className="text-sm text-gray-500">
                {enrollmentsLoading
                  ? "Loading..."
                  : `${myEnrollments.length} enrollments`}
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {enrollmentsLoading ? (
                <motion.div
                  key="my-learning-loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={pageSwapTransition}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`enrollment-skeleton-${i}`}
                      className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded mb-4" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </div>
                  ))}
                </motion.div>
              ) : myEnrollments.length === 0 ? (
                <motion.div
                  key="my-learning-empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={pageSwapTransition}
                >
                  <EmptyState
                    title="No enrollments yet"
                    description="Browse our academy courses and start your learning journey"
                    icon={BookOpen}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`my-learning-page-${myEnrollmentsMeta?.page ?? enrollmentsPage}`}
                  variants={containerVariants}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={pageSwapTransition}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {myEnrollments.map((enrollment) => (
                    <EnrollmentCard
                      key={enrollment.id}
                      item={enrollment}
                      courseTitle={
                        enrollment.course?.title ??
                        courseList?.find(
                          (c) => c.id === enrollment.currentCourseId,
                        )?.title
                      }
                      onContinue={() =>
                        setSelectedCourseId(
                          enrollment.currentCourseId ?? enrollment.courseId,
                        )
                      }
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {!enrollmentsLoading && myEnrollments.length > 0 && (
                <motion.div
                  key={`my-learning-pagination-${myEnrollmentsMeta?.page ?? enrollmentsPage}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={pageSwapTransition}
                >
                  <CreativePagination
                    currentPage={myEnrollmentsMeta?.page ?? enrollmentsPage}
                    pageCount={myEnrollmentsMeta?.pageCount ?? enrollmentsPage}
                    hasPreviousPage={Boolean(
                      myEnrollmentsMeta?.hasPreviousPage,
                    )}
                    hasNextPage={Boolean(myEnrollmentsMeta?.hasNextPage)}
                    itemCount={myEnrollmentsMeta?.itemCount}
                    entityLabel="enrollments"
                    onPageChange={(page) => setEnrollmentsPage(page)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upcoming Activities */}
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Activities
              </h2>
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
                        {activity.courseTitle && (
                          <p className="text-xs font-medium text-[#D52B1E] truncate mt-0.5">
                            {activity.courseTitle}
                          </p>
                        )}
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
          <AnimatePresence mode="wait" initial={false}>
            {coursesLoading ? (
              <motion.div
                key="courses-loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={pageSwapTransition}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`course-skeleton-${i}`}
                    className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </motion.div>
            ) : hasCourses === false ? (
              <motion.div
                key="courses-empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={pageSwapTransition}
              >
                <EmptyState
                  title="No courses available"
                  description="Check back later for new academy courses"
                  icon={BookOpen}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`courses-page-${coursesMeta?.page ?? coursesPage}`}
                variants={containerVariants}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={pageSwapTransition}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {(courseList ?? []).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourseIds.has(course.id)}
                    onEnroll={() => enrollMutation.mutate(course.id)}
                    onUnenroll={() => unenrollMutation.mutate(course.id)}
                    onExplore={() => setSelectedCourseId(course.id)}
                    onResume={() => setSelectedCourseId(course.id)}
                    mutating={
                      enrollMutation.isPending || unenrollMutation.isPending
                    }
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {!coursesLoading && hasCourses && (
              <motion.div
                key={`courses-pagination-${coursesMeta?.page ?? coursesPage}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={pageSwapTransition}
              >
                <CreativePagination
                  currentPage={coursesMeta?.page ?? coursesPage}
                  pageCount={coursesMeta?.pageCount ?? coursesPage}
                  hasPreviousPage={Boolean(coursesMeta?.hasPreviousPage)}
                  hasNextPage={Boolean(coursesMeta?.hasNextPage)}
                  itemCount={coursesMeta?.itemCount}
                  entityLabel="courses"
                  onPageChange={(page) => setCoursesPage(page)}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
