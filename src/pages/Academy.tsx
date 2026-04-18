import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseExplorerDialog } from "@/components/learning/CourseExplorerDialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress, getProgressGradient } from "@/components/ui/progress";
import { useMe } from "@/hooks/useAuth";
import {
  useAcademyCourses,
  useAcademyMyEnrollments,
  useAcademyDashboard,
  useAcademyUpcomingActivities,
  useEnrollInAcademyCourse,
  useAcademyCategoryTypes,
  useAcademyQuizTypes,
  useInstructorAcademyCourses,
  useInstructorCreateCourse,
  useInstructorUpdateCourse,
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
            {item.completedLessonIds?.length ?? 0} lessons done
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
              <PlayCircle className="h-3 w-3" /> {course.videoCount} lessons
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
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: "", passPercentage: 70 });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({ text: "", type: "mcq", points: 1 });
  const [addingOptionToQId, setAddingOptionToQId] = useState<string | null>(null);
  const [optionForm, setOptionForm] = useState({ text: "", isCorrect: false });
  const [viewingLessonId, setViewingLessonId] = useState<string | null>(null);

  const categoryTypesQuery = useAcademyCategoryTypes();
  const quizTypesQuery = useAcademyQuizTypes();
  const coursesQuery = useInstructorAcademyCourses();
  const createCourseMutation = useInstructorCreateCourse();
  const updateCourseMutation = useInstructorUpdateCourse();
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
  const quizDetailsQuery = useInstructorQuizDetails(managingQuizId ?? undefined);
  const quizAttemptsQuery = useInstructorQuizAttempts(managingQuizId ?? undefined);
  const lessonDetailQuery = useInstructorLessonDetails(viewingLessonId ?? undefined);
  const sectionDetailQuery = useInstructorSectionDetails(expandedSectionId ?? undefined);

  const courseQuizzes = useMemo(
    () =>
      (sections ?? []).flatMap((s) =>
        (s.lessons ?? [])
          .filter((l) => l.quizId != null)
          .map((l) => ({
            id: String(l.quizId as string | number),
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

  const handleAddQuiz = async () => {
    if (!quizForm.title.trim() || selectedCourseId === "") return;
    await addQuizMutation.mutateAsync({
      courseId: selectedCourseId,
      payload: { title: quizForm.title, passPercentage: quizForm.passPercentage },
    });
    setShowAddQuiz(false);
    setQuizForm({ title: "", passPercentage: 70 });
  };

  const handleAddQuestionToQuiz = async () => {
    if (!managingQuizId || !questionForm.text.trim()) return;
    await addQuestionMutation.mutateAsync({
      quizId: managingQuizId,
      payload: { text: questionForm.text.trim(), type: questionForm.type, points: questionForm.points },
    });
    setQuestionForm({ text: "", type: "mcq", points: 1 });
    setShowAddQuestion(false);
  };

  const handleAddOptionToQuestion = async () => {
    if (!addingOptionToQId || !optionForm.text.trim()) return;
    await addOptionMutation.mutateAsync({
      questionId: addingOptionToQId,
      payload: { text: optionForm.text.trim(), isCorrect: optionForm.isCorrect },
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
                  {isEditingCourse ? "Update your course details" : "Fill in the details to publish your course"}
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
                  onClick={() => void (isEditingCourse ? handleUpdateCourse() : handleCreateCourse())}
                  disabled={
                    !courseForm.title.trim() || createCourseMutation.isPending || updateCourseMutation.isPending
                  }
                  className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-2"
                >
                  {(createCourseMutation.isPending || updateCourseMutation.isPending) ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      {isEditingCourse ? "Updating…" : "Creating…"}
                    </>
                  ) : (
                    <>
                      {isEditingCourse ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{" "}
                      {isEditingCourse ? "Update Course" : "Create Course"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
          <div className="lg:col-span-1 space-y-3">
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

            {coursesQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white border border-gray-100 p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            ) : !coursesQuery.data || coursesQuery.data.length === 0 ? (
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
            ) : (
              <div className="space-y-2">
                {coursesQuery.data.map((course, idx) => {
                  const isSelected = selectedCourseId === course.id;
                  const levelMeta = LEVEL_META[
                    course.level as keyof typeof LEVEL_META
                  ] ?? {
                    label: course.level,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                  };
                  const levelColors = [
                    "border-t-blue-400",
                    "border-t-violet-400",
                    "border-t-emerald-400",
                    "border-t-amber-400",
                    "border-t-rose-400",
                  ];
                  const accentColor = levelColors[idx % levelColors.length];
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setExpandedSectionId(null);
                        setShowAddSection(false);
                        setAddingLessonSectionId(null);
                      }}
                      className={`w-full text-left rounded-2xl border-t-[3px] bg-white border border-gray-100 p-4 hover:shadow-md transition-all duration-200 ${accentColor} ${isSelected ? "ring-2 ring-[#D52B1E]/30 shadow-md" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug flex-1">
                          {course.title}
                        </p>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${course.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          {course.status ?? "draft"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${levelMeta.bg} ${levelMeta.color}`}
                        >
                          {levelMeta.label}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {course.isFree ? "Free" : `$${course.priceUsd}`}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-[11px] font-bold text-[#D52B1E] flex items-center gap-0.5">
                            Selected <ChevronRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
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
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#D52B1E] via-red-400 to-orange-400" />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                          {courseDetails?.title}
                        </h2>
                        {courseDetails?.description && (
                          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {courseDetails.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-[#D52B1E]/15 to-red-50 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-[#D52B1E]" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_META[courseDetails?.level as keyof typeof LEVEL_META]?.bg ?? "bg-gray-100"} ${LEVEL_META[courseDetails?.level as keyof typeof LEVEL_META]?.color ?? "text-gray-600"}`}
                      >
                        {courseDetails?.level}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {courseDetails?.isFree
                          ? "Free"
                          : `$${courseDetails?.priceUsd}`}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {sections.length} section
                        {sections.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />{" "}
                        {courseDetails?.lessonCount ?? 0} lesson
                        {(courseDetails?.lessonCount ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />{" "}
                        {courseDetails?.enrolledCount ?? 0} enrolled
                      </span>
                    </div>
                    {/* Course actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCourseForm({
                            title: courseDetails?.title ?? "",
                            subtitle: "",
                            description: courseDetails?.description ?? "",
                            categoryId: "",
                            level: (courseDetails?.level ?? "beginner") as "beginner" | "intermediate" | "advanced",
                            thumbnailUrl: courseDetails?.coverImageUrl ?? "",
                            price: courseDetails?.priceUsd ?? 0,
                            isFree: courseDetails?.isFree ?? false,
                          });
                          setIsEditingCourse(true);
                          setShowCreateCourse(true);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="h-3 w-3" /> Edit Course
                      </button>
                      <button
                        onClick={() => void handleSuspendCourse()}
                        disabled={suspendCourseMutation.isPending}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          courseDetails?.status === "suspended"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        <PauseCircle className="h-3 w-3" />
                        {suspendCourseMutation.isPending
                          ? "Processing…"
                          : courseDetails?.status === "suspended"
                            ? "Suspended"
                            : "Suspend Course"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections & Lessons */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#D52B1E]" />
                      <h3 className="text-sm font-bold text-gray-800">
                        Course Curriculum
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {sections.length} section
                      {sections.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {sections.length === 0 && !showAddSection && (
                    <div className="py-12 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Layers className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">
                        No sections yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Add sections to organize your course content
                      </p>
                    </div>
                  )}

                  {sections.map((section, sIdx) => {
                    const isExpanded = expandedSectionId === section.id;
                    const lessonCount = section.lessons?.length ?? 0;
                    return (
                      <div
                        key={section.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        {/* Section header row */}
                        <div
                          className={`flex items-center gap-3 px-6 py-4 transition-colors ${isExpanded ? "bg-gray-50/80" : "hover:bg-gray-50/50"}`}
                        >
                          {/* Number badge */}
                          <div className="shrink-0 h-7 w-7 rounded-lg bg-[#D52B1E]/10 text-[#D52B1E] flex items-center justify-center text-xs font-bold">
                            {sIdx + 1}
                          </div>

                          {/* Title + stats */}
                          <button
                            className="flex-1 min-w-0 text-left flex items-center gap-2"
                            onClick={() =>
                              setExpandedSectionId(
                                isExpanded ? null : String(section.id),
                              )
                            }
                          >
                            <span className="text-sm font-bold text-gray-800 truncate">
                              {section.title}
                            </span>
                            <span className="shrink-0 text-xs text-gray-400 font-medium">
                              {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                            </span>
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
                          <div className="bg-gray-50/40 px-6 pb-5 pt-1">
                            {/* Section description from detail endpoint */}
                            {sectionDetailQuery.data?.id === section.id && section.description && (
                              <p className="text-xs text-gray-500 italic mb-3">{section.description}</p>
                            )}
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
                                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm hover:shadow transition-shadow"
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
                                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                                        {lesson.title}
                                      </span>
                                      <button
                                        onClick={() => setViewingLessonId(viewingLessonId === String(lesson.id) ? null : String(lesson.id))}
                                        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                        title="View lesson details"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </button>
                                      <span
                                        className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}
                                      >
                                        {meta.label}
                                      </span>
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

                  {/* Add section area */}
                  <div className="px-6 py-4 bg-gray-50/40 border-t border-gray-100">
                    {showAddSection ? (
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
                    ) : (
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#D52B1E]/40 hover:text-[#D52B1E] hover:bg-[#D52B1E]/3 transition-all"
                      >
                        <Plus className="h-4 w-4" /> Add Section
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Quiz Management ─────────────────────────────────── */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#D52B1E]" />
                      <h3 className="text-sm font-bold text-gray-800">Quiz Management</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {courseQuizzes.length} quiz{courseQuizzes.length !== 1 ? "zes" : ""}
                    </span>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    {/* Quiz selector */}
                    {courseQuizzes.length > 0 && (
                      <select
                        value={managingQuizId ?? ""}
                        onChange={(e) => {
                          setManagingQuizId(e.target.value || null);
                          setShowAddQuestion(false);
                          setAddingOptionToQId(null);
                        }}
                        className={inputCls}
                      >
                        <option value="">Select a quiz to manage…</option>
                        {courseQuizzes.map((q) => (
                          <option key={q.id} value={q.id}>{q.label}</option>
                        ))}
                      </select>
                    )}

                    {/* Selected quiz details */}
                    {managingQuizId && quizDetailsQuery.data && (() => {
                      const quiz = quizDetailsQuery.data;
                      const questions = (quiz.questions ?? []) as Array<{
                        id?: string; text?: string; type?: string; points?: number;
                        options?: Array<{ id?: string; text?: string; isCorrect?: boolean }>;
                      }>;
                      const attempts = quizAttemptsQuery.data ?? [];
                      return (
                        <div className="space-y-3">
                          {/* Quiz header */}
                          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div>
                              <p className="text-sm font-bold text-gray-800">{quiz.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {questions.length} question{questions.length !== 1 ? "s" : ""} · {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const newTitle = window.prompt("Quiz title:", quiz.title);
                                  if (newTitle && newTitle !== quiz.title)
                                    void updateQuizMutation.mutateAsync({ id: managingQuizId, payload: { title: newTitle } });
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit quiz"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this quiz and all its contents?"))
                                    void deleteQuizMutation.mutateAsync(managingQuizId).then(() => setManagingQuizId(null));
                                }}
                                className="h-7 w-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete quiz"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quiz attempts summary */}
                          {attempts.length > 0 && (
                            <div className="rounded-xl border border-gray-100 p-3">
                              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <BarChart3 className="h-3 w-3" /> Recent Attempts
                              </p>
                              <div className="space-y-1">
                                {attempts.slice(0, 5).map((att) => (
                                  <div key={att.id} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">{att.studentId.slice(0, 8)}…</span>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${att.status === "passed" ? "text-emerald-600" : "text-amber-600"}`}>
                                        {att.score}%
                                      </span>
                                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${att.status === "passed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
                              <div key={String(q.id ?? qIdx)} className="rounded-xl border border-gray-100 p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800">
                                      <span className="font-bold text-gray-400 mr-1.5">{qIdx + 1}.</span>
                                      {String(q.text ?? "")}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      {String(q.type ?? "mcq")} · {q.points ?? 1} pt{(q.points ?? 1) !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        const newText = window.prompt("Question text:", String(q.text ?? ""));
                                        if (newText && q.id)
                                          void updateQuestionMutation.mutateAsync({ questionId: q.id, payload: { text: newText } });
                                      }}
                                      className="h-6 w-6 flex items-center justify-center rounded text-blue-500 hover:bg-blue-50"
                                      title="Edit question"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (q.id && window.confirm("Delete this question?"))
                                          void deleteQuestionMutation.mutateAsync(q.id);
                                      }}
                                      className="h-6 w-6 flex items-center justify-center rounded text-red-400 hover:bg-red-50"
                                      title="Delete question"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAddingOptionToQId(addingOptionToQId === String(q.id) ? null : String(q.id ?? ""));
                                        setOptionForm({ text: "", isCorrect: false });
                                      }}
                                      className="h-6 w-6 flex items-center justify-center rounded text-emerald-500 hover:bg-emerald-50"
                                      title="Add option"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                {/* Options */}
                                {(q.options ?? []).length > 0 && (
                                  <div className="mt-2 space-y-1 pl-4">
                                    {(q.options ?? []).map((opt, oIdx) => (
                                      <div key={String(opt.id ?? oIdx)} className="flex items-center justify-between text-xs">
                                        <span className={`flex items-center gap-1.5 ${opt.isCorrect ? "text-emerald-700 font-semibold" : "text-gray-500"}`}>
                                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.isCorrect ? "bg-emerald-500" : "bg-gray-300"}`} />
                                          {String(opt.text ?? "")}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                          <button
                                            onClick={() => {
                                              const newText = window.prompt("Option text:", String(opt.text ?? ""));
                                              if (newText && opt.id)
                                                void updateOptionMutation.mutateAsync({ id: opt.id, payload: { text: newText } });
                                            }}
                                            className="h-5 w-5 flex items-center justify-center rounded text-blue-400 hover:bg-blue-50"
                                          >
                                            <Edit className="h-2.5 w-2.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (opt.id && window.confirm("Delete this option?"))
                                                void deleteOptionMutation.mutateAsync(opt.id);
                                            }}
                                            className="h-5 w-5 flex items-center justify-center rounded text-red-400 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Add option inline */}
                                {addingOptionToQId === String(q.id) && (
                                  <div className="mt-2 pl-4 flex items-center gap-2">
                                    <input
                                      className={`${inputCls} flex-1`}
                                      value={optionForm.text}
                                      onChange={(e) => setOptionForm((f) => ({ ...f, text: e.target.value }))}
                                      placeholder="Option text"
                                      autoFocus
                                    />
                                    <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                                      <input
                                        type="checkbox"
                                        checked={optionForm.isCorrect}
                                        onChange={(e) => setOptionForm((f) => ({ ...f, isCorrect: e.target.checked }))}
                                        className="rounded border-gray-300"
                                      />
                                      Correct
                                    </label>
                                    <Button size="sm" onClick={() => void handleAddOptionToQuestion()} disabled={!optionForm.text.trim() || addOptionMutation.isPending} className="bg-[#D52B1E] hover:bg-[#b82319] text-white text-xs px-2 py-1 h-7">
                                      Add
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Add question */}
                          {showAddQuestion ? (
                            <div className="rounded-xl border border-[#D52B1E]/20 bg-white p-3 space-y-2">
                              <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-wider">Add Question</p>
                              <input className={inputCls} value={questionForm.text} onChange={(e) => setQuestionForm((f) => ({ ...f, text: e.target.value }))} placeholder="Question text" autoFocus />
                              <div className="flex gap-2">
                                <select className={`${inputCls} flex-1`} value={questionForm.type} onChange={(e) => setQuestionForm((f) => ({ ...f, type: e.target.value }))}>
                                  {quizTypesQuery.data && quizTypesQuery.data.length > 0 ? (
                                    quizTypesQuery.data.map((qt) => (
                                      <option key={String(qt.id)} value={qt.name}>{qt.name}</option>
                                    ))
                                  ) : (
                                    <>
                                      <option value="mcq">MCQ</option>
                                      <option value="true_false">True / False</option>
                                      <option value="short_answer">Short Answer</option>
                                    </>
                                  )}
                                </select>
                                <input type="number" min={1} className={`${inputCls} w-20`} value={questionForm.points} onChange={(e) => setQuestionForm((f) => ({ ...f, points: Number(e.target.value) || 1 }))} placeholder="Pts" />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
                                <Button size="sm" onClick={() => void handleAddQuestionToQuiz()} disabled={!questionForm.text.trim() || addQuestionMutation.isPending} className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5">
                                  <Plus className="h-3 w-3" /> Add
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setShowAddQuestion(true)} className="text-xs font-semibold text-[#D52B1E] flex items-center gap-1 hover:gap-1.5 transition-all">
                              <Plus className="h-3 w-3" /> Add question
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Add quiz form */}
                    {showAddQuiz ? (
                      <div className="rounded-xl border border-[#D52B1E]/20 bg-white p-3 space-y-2">
                        <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-wider">New Quiz</p>
                        <input className={inputCls} value={quizForm.title} onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))} placeholder="Quiz title" autoFocus />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 shrink-0">Pass %</label>
                          <input type="number" min={0} max={100} className={`${inputCls} w-20`} value={quizForm.passPercentage} onChange={(e) => setQuizForm((f) => ({ ...f, passPercentage: Number(e.target.value) || 70 }))} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setShowAddQuiz(false)}>Cancel</Button>
                          <Button size="sm" onClick={() => void handleAddQuiz()} disabled={!quizForm.title.trim() || addQuizMutation.isPending} className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-1.5">
                            <Plus className="h-3 w-3" /> Create Quiz
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddQuiz(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-[#D52B1E]/40 hover:text-[#D52B1E] transition-all">
                        <Plus className="h-3.5 w-3.5" /> Add Quiz
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Lesson Detail Viewer ────────────────────────────── */}
                {viewingLessonId && lessonDetailQuery.data && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-[#D52B1E]" />
                        <h3 className="text-sm font-bold text-gray-800">Lesson Details</h3>
                      </div>
                      <button
                        onClick={() => setViewingLessonId(null)}
                        className="h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="px-6 py-4 space-y-2 text-sm">
                      <p><span className="font-semibold text-gray-600">Title:</span> {lessonDetailQuery.data.title}</p>
                      <p><span className="font-semibold text-gray-600">Type:</span> {lessonDetailQuery.data.type}</p>
                      {lessonDetailQuery.data.contentUrl && (
                        <p><span className="font-semibold text-gray-600">URL:</span> <a href={lessonDetailQuery.data.contentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{lessonDetailQuery.data.contentUrl}</a></p>
                      )}
                      {lessonDetailQuery.data.contentText && (
                        <p className="text-gray-600 whitespace-pre-wrap">{lessonDetailQuery.data.contentText}</p>
                      )}
                      {lessonDetailQuery.data.durationSeconds != null && (
                        <p><span className="font-semibold text-gray-600">Duration:</span> {Math.round((lessonDetailQuery.data.durationSeconds ?? 0) / 60)}m</p>
                      )}
                      {lessonDetailQuery.data.meetingLink && (
                        <p><span className="font-semibold text-gray-600">Meeting:</span> <a href={lessonDetailQuery.data.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">{lessonDetailQuery.data.meetingLink}</a></p>
                      )}
                      {lessonDetailQuery.data.scheduledAt && (
                        <p><span className="font-semibold text-gray-600">Scheduled:</span> {new Date(lessonDetailQuery.data.scheduledAt).toLocaleString()}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
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
  } = useAcademyMyEnrollments();
  const { data: upcoming = [], refetch: refetchUpcoming } =
    useAcademyUpcomingActivities();
  const {
    data: courseList,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useAcademyCourses({
    page: 1,
    perPage: 24,
    search: courseSearch || undefined,
  });

  const enrollMutation = useEnrollInAcademyCourse();

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
                  <BarChart3 className="h-4 w-4 text-gray-600" /> {0}% Weekly
                  Progress
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
                <p className="text-2xl font-bold text-emerald-400">{0}%</p>
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
              <h2 className="text-xl font-semibold text-gray-900">
                My Learning
              </h2>
              <span className="text-sm text-gray-500">
                {enrollmentsLoading
                  ? "Loading..."
                  : `${myEnrollments.length} enrollments`}
              </span>
            </div>

            {(() => {
              if (enrollmentsLoading) {
                return (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                );
              }
            })()}
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
          {(() => {
            if (coursesLoading) {
              return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      onResume={() => setSelectedCourseId(course.id)}
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
