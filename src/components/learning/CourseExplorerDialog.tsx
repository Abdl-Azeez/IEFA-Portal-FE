import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Globe,
  HelpCircle,
  Lock,
  Play,
  PlayCircle,
  Star,
  Users,
  Video,
  Volume2,
  VolumeX,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useAcademyCourseDetails,
  useAcademyCourseWithProgress,
  useAcademyQuiz,
  useCompleteAcademyLesson,
  useStartAcademyQuiz,
  useSubmitAcademyAttempt,
} from "@/hooks/useAcademy";
import { useUser } from "@/hooks/useAuth";
import { Progress, getProgressGradient } from "@/components/ui/progress";
import type {
  AcademyLessonDto,
  AcademySectionDto,
  StudentCourseDto,
} from "@/types/learning";

// -- Helpers --

function fmtDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "---";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtTotalSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

function fmtPrice(priceUsd?: number, isFree?: boolean): string {
  if (isFree || !priceUsd) return "Free";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(priceUsd);
}

// -- Lesson type metadata --

const LESSON_TYPE = {
  video: {
    Icon: PlayCircle,
    label: "Video",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  article: {
    Icon: FileText,
    label: "Article",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  quiz: {
    Icon: HelpCircle,
    label: "Quiz",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  assignment: {
    Icon: ClipboardList,
    label: "Assignment",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  live_session: {
    Icon: Video,
    label: "Live",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
} as const;

function getLessonMeta(type?: string) {
  return LESSON_TYPE[type as keyof typeof LESSON_TYPE] ?? LESSON_TYPE.video;
}

// -- Video Player --

function VideoPlayer({
  src,
  title,
}: Readonly<{ src: string | null | undefined; title: string }>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <PlayCircle className="h-8 w-8 text-white/40" />
          </div>
          <p className="text-sm font-medium text-white/40">
            No video available for this lesson
          </p>
        </div>
      </div>
    );
  }

  const ytMatch = src.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (ytMatch) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        key={src}
        controls
        className="h-full w-full"
        muted={muted}
        preload="metadata"
      >
        <source src={src} />
        Your browser does not support HTML5 video.
      </video>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-3 hidden rounded-full bg-black/50 p-2 text-white group-hover:flex"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

// -- Curriculum Sidebar --

function CurriculumSidebar({
  sections,
  activeLesson,
  expandedIds,
  onToggleSection,
  onSelectLesson,
  onCompleteLesson,
  allLessons,
  hasFullAccess,
  lockedLessonIds,
  completedLessonIds,
  completingLessonId,
}: Readonly<{
  sections: AcademySectionDto[];
  activeLesson: AcademyLessonDto | null;
  expandedIds: Set<string>;
  onToggleSection: (id: string) => void;
  onSelectLesson: (lesson: AcademyLessonDto) => void;
  onCompleteLesson: (lessonId: string | number) => void;
  allLessons: AcademyLessonDto[];
  hasFullAccess: boolean;
  lockedLessonIds: Set<string>;
  completedLessonIds: Set<string>;
  completingLessonId: string | null;
}>) {
  const totalSections = sections.length;
  const totalLessons = allLessons.length;
  const totalSeconds = allLessons.reduce(
    (acc, l) => acc + (l.durationSeconds ?? 0),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">Course Content</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {totalSections} section{totalSections !== 1 ? "s" : ""} &middot;{" "}
          {totalLessons} lesson{totalLessons !== 1 ? "s" : ""} &middot;{" "}
          {fmtTotalSeconds(totalSeconds)}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sections.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No sections available.</p>
        )}
        {sections.map((section, sIdx) => {
          const sectionId = String(section.id);
          const isExpanded = expandedIds.has(sectionId);
          const sectionLessons = [...(section.lessons ?? [])].sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
          );
          const sectionSeconds = sectionLessons.reduce(
            (acc, l) => acc + (l.durationSeconds ?? 0),
            0,
          );

          return (
            <div
              key={sectionId}
              className="border-b border-gray-100 last:border-0"
            >
              <button
                type="button"
                onClick={() => onToggleSection(sectionId)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="shrink-0 h-6 w-6 rounded-md bg-[#D52B1E]/10 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-[#D52B1E]">
                    {sIdx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {section.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {sectionLessons.length} lesson
                    {sectionLessons.length !== 1 ? "s" : ""} &middot;{" "}
                    {fmtTotalSeconds(sectionSeconds)}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="lessons"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    {sectionLessons.map((lesson) => {
                      const meta = getLessonMeta(lesson.type);
                      const LIcon = meta.Icon;
                      const isActive =
                        String(lesson.id) === String(activeLesson?.id);
                      const lessonId = String(lesson.id);
                      const isLocked = lockedLessonIds.has(lessonId);
                      const isCompleted = completedLessonIds.has(lessonId);
                      const canMarkComplete =
                        hasFullAccess && !isLocked && !isCompleted;
                      const isMarkingComplete = completingLessonId === lessonId;

                      return (
                        <div
                          key={lessonId}
                          className={`w-full pl-10 pr-4 py-2.5 transition-colors ${
                            isLocked
                              ? "opacity-60"
                              : isActive
                                ? "bg-[#D52B1E]/8 border-r-[3px] border-[#D52B1E]"
                                : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                !isLocked && onSelectLesson(lesson)
                              }
                              disabled={isLocked}
                              className={`flex-1 min-w-0 flex items-start gap-3 text-left ${isLocked ? "cursor-not-allowed" : ""}`}
                            >
                              {isLocked ? (
                                <div className="shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                                  <Lock className="h-3 w-3 text-gray-400" />
                                </div>
                              ) : isCompleted ? (
                                <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                              ) : isActive ? (
                                <div className="shrink-0 h-6 w-6 rounded-full bg-[#D52B1E] flex items-center justify-center mt-0.5">
                                  <Play className="h-3 w-3 text-white fill-white" />
                                </div>
                              ) : (
                                <div
                                  className={`shrink-0 h-6 w-6 rounded-full ${meta.bg} flex items-center justify-center mt-0.5`}
                                >
                                  <LIcon className={`h-3 w-3 ${meta.color}`} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs leading-snug line-clamp-2 ${isLocked ? "text-gray-400" : isActive ? "font-semibold text-[#D52B1E]" : "text-gray-700"}`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-gray-400">
                                    {fmtDuration(lesson.durationSeconds)}
                                  </span>
                                  {isCompleted && (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                  {lesson.isFreePreview && (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                      Preview
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                      Enroll to unlock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>

                            {canMarkComplete && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => onCompleteLesson(lesson.id)}
                                disabled={isMarkingComplete}
                                className="h-7 px-2.5 text-[10px] bg-[#D52B1E] hover:bg-[#b92418] text-white"
                              >
                                {isMarkingComplete
                                  ? "Saving..."
                                  : "Mark complete"}
                              </Button>
                            )}
                            {isLocked && (
                              <Lock className="h-3 w-3 text-gray-300 shrink-0 mt-1.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Course Stats Bar --

function CourseStatsBar({
  course,
  totalLessons,
  totalSeconds,
}: Readonly<{
  course: StudentCourseDto;
  totalLessons: number;
  totalSeconds: number;
}>) {
  const stats = [
    {
      Icon: Star,
      value: course.rating ? course.rating.toFixed(1) : "---",
      label: "Rating",
    },
    { Icon: Users, value: `${course.enrolledCount ?? 0}`, label: "Students" },
    { Icon: BookOpen, value: `${totalLessons}`, label: "Lessons" },
    { Icon: Clock, value: fmtTotalSeconds(totalSeconds), label: "Duration" },
    { Icon: Globe, value: "English", label: "Language" },
    {
      Icon: GraduationCap,
      value: course.level ?? "All levels",
      label: "Level",
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
      {stats.map(({ Icon, value, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-white/80">
          <Icon className="h-3.5 w-3.5 text-[#D52B1E]" />
          <span className="text-sm font-semibold">{value}</span>
          <span className="text-xs text-white/50">{label}</span>
        </div>
      ))}
    </div>
  );
}

// -- Main Dialog --

interface CourseExplorerDialogProps {
  readonly course: StudentCourseDto | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

interface QuizOptionView {
  id: string;
  text: string;
}

interface QuizQuestionView {
  id: string;
  text: string;
  type: string;
  options: QuizOptionView[];
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeQuizQuestions(payload: unknown): QuizQuestionView[] {
  if (!payload || typeof payload !== "object") return [];
  const quiz = payload as { questions?: unknown[] };
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  return questions
    .map((rawQuestion, index) => {
      if (!rawQuestion || typeof rawQuestion !== "object") return null;
      const questionRecord = rawQuestion as Record<string, unknown>;
      const questionId =
        pickString(questionRecord, ["id", "questionId"]) || `q-${index}`;
      const text =
        pickString(questionRecord, ["text", "question", "title"]) ||
        `Question ${index + 1}`;
      const type = pickString(questionRecord, ["type"]).toLowerCase() || "mcq";

      const rawOptions = (
        Array.isArray(questionRecord.options)
          ? questionRecord.options
          : Array.isArray(questionRecord.answers)
            ? questionRecord.answers
            : []
      ) as unknown[];

      const options = rawOptions
        .map((rawOption, optionIndex) => {
          if (!rawOption || typeof rawOption !== "object") return null;
          const optionRecord = rawOption as Record<string, unknown>;
          const optionId =
            pickString(optionRecord, ["id", "optionId"]) ||
            `${questionId}-o-${optionIndex}`;
          const optionText =
            pickString(optionRecord, ["text", "label", "value"]) ||
            `Option ${optionIndex + 1}`;
          return { id: optionId, text: optionText };
        })
        .filter((option): option is QuizOptionView => Boolean(option));

      return {
        id: questionId,
        text,
        type,
        options,
      };
    })
    .filter((question): question is QuizQuestionView => Boolean(question));
}

function getQuizIdFromLesson(
  lesson: AcademyLessonDto | null,
): string | number | undefined {
  if (!lesson) return undefined;
  if (lesson.quizId !== undefined && lesson.quizId !== null)
    return lesson.quizId;

  const firstQuiz = lesson.quizzes?.[0];
  if (!firstQuiz) return undefined;
  if (typeof firstQuiz === "string" || typeof firstQuiz === "number") {
    return firstQuiz;
  }
  if (typeof firstQuiz === "object") {
    const id = (firstQuiz as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }

  return undefined;
}

function getAttemptId(payload: unknown): string | number | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const candidate = payload as {
    id?: unknown;
    attemptId?: unknown;
    data?: { id?: unknown; attemptId?: unknown };
  };

  const direct = candidate.attemptId ?? candidate.id;
  if (typeof direct === "string" || typeof direct === "number") return direct;

  const nested = candidate.data?.attemptId ?? candidate.data?.id;
  if (typeof nested === "string" || typeof nested === "number") return nested;

  return undefined;
}

export function CourseExplorerDialog({
  course,
  open,
  onClose,
}: CourseExplorerDialogProps) {
  const courseId = course?.id !== undefined ? String(course.id) : undefined;

  const [activeLesson, setActiveLesson] = useState<AcademyLessonDto | null>(
    null,
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeAttemptId, setActiveAttemptId] = useState<
    string | number | undefined
  >(undefined);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(
    null,
  );
  const [localCompletedLessonIds, setLocalCompletedLessonIds] = useState<
    Set<string>
  >(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const { data: courseDetails, isLoading } = useAcademyCourseDetails(
    open ? courseId : undefined,
  );
  const { data: courseWithProgress } = useAcademyCourseWithProgress(
    open ? courseId : undefined,
  );
  const completeLessonMutation = useCompleteAcademyLesson();
  const startQuizMutation = useStartAcademyQuiz();
  const submitAttemptMutation = useSubmitAcademyAttempt();

  const sortedSections: AcademySectionDto[] = useMemo(
    () =>
      [...(courseDetails?.sections ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
    [courseDetails?.sections],
  );

  const allLessons: AcademyLessonDto[] = useMemo(
    () =>
      sortedSections.flatMap((s) =>
        [...(s.lessons ?? [])].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
      ),
    [sortedSections],
  );

  const totalSeconds = useMemo(
    () => allLessons.reduce((acc, l) => acc + (l.durationSeconds ?? 0), 0),
    [allLessons],
  );

  const activeQuizId = useMemo(
    () => getQuizIdFromLesson(activeLesson),
    [activeLesson],
  );
  const { data: activeQuiz } = useAcademyQuiz(activeQuizId);
  const quizQuestions = useMemo(
    () => normalizeQuizQuestions(activeQuiz),
    [activeQuiz],
  );

  useEffect(() => {
    if (allLessons.length === 0) return;
    setActiveLesson((prev) => prev ?? allLessons[0] ?? null);
    setExpandedIds((prev) => {
      if (prev.size > 0) return prev;
      const first = sortedSections[0];
      return first ? new Set([String(first.id)]) : prev;
    });
  }, [allLessons, sortedSections]);

  useEffect(() => {
    if (!open) {
      setActiveLesson(null);
      setExpandedIds(new Set());
      setActiveAttemptId(undefined);
      setCompletingLessonId(null);
      setLocalCompletedLessonIds(new Set());
      setSelectedAnswers({});
    }
  }, [open, courseId]);

  useEffect(() => {
    setSelectedAnswers({});
  }, [activeQuizId]);

  const activeMeta = getLessonMeta(activeLesson?.type);
  const ActiveIcon = activeMeta.Icon;

  const displayCourse = courseDetails ?? course;
  const progressPercent =
    courseWithProgress?.progressPercent ?? displayCourse?.progressPercent ?? 0;
  const completedModules = courseWithProgress?.completedModules ?? 0;
  const totalModules =
    courseWithProgress?.totalModules ?? sortedSections.length;
  const isEnrolled = Boolean(courseWithProgress?.courseProgress?.enrolledAt);
  const hasFullAccess = isEnrolled;

  // Track completed lesson IDs from the progress API
  const completedLessonIdSet = useMemo(() => {
    const ids = new Set<string>();

    (courseWithProgress?.completedLessonIds ?? []).forEach((id) => {
      ids.add(String(id));
    });

    (courseWithProgress?.sections ?? []).forEach((section) => {
      (section.lessons ?? []).forEach((lesson) => {
        if (lesson.isCompleted) ids.add(String(lesson.id));
      });
    });

    localCompletedLessonIds.forEach((id) => {
      ids.add(String(id));
    });

    return ids;
  }, [
    courseWithProgress?.completedLessonIds,
    courseWithProgress?.sections,
    localCompletedLessonIds,
  ]);

  // If user is NOT enrolled, only the first lesson is accessible; all others are locked
  const lockedLessonIds = useMemo(() => {
    if (hasFullAccess) return new Set<string>();
    const ids = new Set<string>();
    allLessons.forEach((lesson, index) => {
      if (index > 0) ids.add(String(lesson.id));
    });
    return ids;
  }, [hasFullAccess, allLessons]);

  const activeLessonIndex = activeLesson
    ? allLessons.findIndex((l) => String(l.id) === String(activeLesson.id))
    : -1;
  const hasPrev =
    activeLessonIndex > 0 &&
    !lockedLessonIds.has(String(allLessons[activeLessonIndex - 1]?.id));
  const hasNext =
    activeLessonIndex >= 0 &&
    activeLessonIndex < allLessons.length - 1 &&
    !lockedLessonIds.has(String(allLessons[activeLessonIndex + 1]?.id));

  const handlePrev = () => {
    if (!hasPrev) return;
    const prev = allLessons[activeLessonIndex - 1];
    if (prev && !lockedLessonIds.has(String(prev.id))) setActiveLesson(prev);
  };

  const handleNext = () => {
    if (!hasNext) return;
    const next = allLessons[activeLessonIndex + 1];
    if (next && !lockedLessonIds.has(String(next.id))) setActiveLesson(next);
  };

  const handleSelectLesson = (lesson: AcademyLessonDto) => {
    if (lockedLessonIds.has(String(lesson.id))) return;
    setActiveLesson(lesson);
    if (lesson.sectionId) {
      setExpandedIds((prev) => new Set([...prev, String(lesson.sectionId)]));
    }
  };

  const handleToggleSection = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const instructorUserId = displayCourse?.educator?.id
    ? String(displayCourse.educator.id)
    : "";
  const { data: instructorUser } = useUser(instructorUserId);
  const instructorFullName = [
    instructorUser?.firstName,
    instructorUser?.lastName,
  ]
    .filter(
      (part): part is string =>
        typeof part === "string" && part.trim().length > 0,
    )
    .join(" ")
    .trim();
  const instructorDisplayName =
    instructorFullName ||
    instructorUser?.username ||
    displayCourse?.educator?.name ||
    "IEFA Educator";
  const instructorPhoto =
    instructorUser?.profilePhotoUrl ||
    displayCourse?.educator?.profilePhotoUrl ||
    "";

  const handleCompleteLesson = async (lessonId: string | number) => {
    const normalizedLessonId = String(lessonId);
    if (completedLessonIdSet.has(normalizedLessonId)) return;
    setCompletingLessonId(normalizedLessonId);
    try {
      await completeLessonMutation.mutateAsync(lessonId);
      setLocalCompletedLessonIds(
        (prev) => new Set([...Array.from(prev), normalizedLessonId]),
      );
    } finally {
      setCompletingLessonId(null);
    }
  };

  const handleStartQuiz = async () => {
    if (!activeQuizId) return;
    const response = await startQuizMutation.mutateAsync(activeQuizId);
    setActiveAttemptId(getAttemptId(response));
  };

  const handleSubmitAttempt = async () => {
    if (!activeAttemptId) return;
    const answers = quizQuestions
      .map((question) => {
        const value = selectedAnswers[question.id];
        if (!value) return null;

        if (question.type === "short_answer") {
          return {
            questionId: question.id,
            answerText: value,
            answer: value,
          };
        }

        if (question.type === "true_false") {
          const boolValue = value === "true";
          return {
            questionId: question.id,
            answerBoolean: boolValue,
            answer: boolValue,
          };
        }

        return {
          questionId: question.id,
          selectedOptionId: value,
          optionId: value,
          answer: value,
        };
      })
      .filter((entry) => entry !== null);

    await submitAttemptMutation.mutateAsync({
      attemptId: activeAttemptId,
      payload: { answers },
    });
    setActiveAttemptId(undefined);
    setSelectedAnswers({});
  };

  const answeredQuestions = quizQuestions.filter((q) => {
    const value = selectedAnswers[q.id];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
  const hasRequiredAnswers =
    quizQuestions.length === 0 || answeredQuestions === quizQuestions.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={displayCourse?.title ?? "Course"}
      maxWidth="max-w-[1400px]"
    >
      {isLoading && !courseDetails ? (
        <div className="flex flex-col gap-4">
          <div className="aspect-video w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-6 w-1/2 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-4 w-1/3 rounded-full bg-gray-100 animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-0 -m-6">
          {/* Left: Player + Info */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {/* Dark hero banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#1a0404] to-gray-900 px-6 py-6">
              <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#D52B1E]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 left-0 h-32 w-32 rounded-full bg-orange-600/10 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  {displayCourse?.isFree ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                      Free Course
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#D52B1E] bg-[#D52B1E]/15 px-2.5 py-1 rounded-full border border-[#D52B1E]/25">
                      {fmtPrice(displayCourse?.priceUsd, displayCourse?.isFree)}
                    </span>
                  )}
                  {displayCourse?.level && (
                    <span className="text-xs font-semibold text-white/60 bg-white/8 px-2.5 py-1 rounded-full capitalize border border-white/10">
                      {displayCourse.level}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {displayCourse?.title}
                </h2>
                {displayCourse?.description && (
                  <p className="mt-1.5 text-sm text-gray-400 line-clamp-2">
                    {displayCourse.description}
                  </p>
                )}
                {displayCourse && (
                  <CourseStatsBar
                    course={displayCourse}
                    totalLessons={allLessons.length}
                    totalSeconds={totalSeconds}
                  />
                )}
                {hasFullAccess ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 max-w-xl">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/70 font-semibold">
                        Your progress
                      </span>
                      <span className="text-white font-bold">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, progressPercent))}
                      className="h-2 bg-white/15"
                      indicatorStyle={getProgressGradient(progressPercent)}
                    />
                    <p className="text-[11px] text-white/50 mt-2">
                      {completedModules} of {totalModules} modules completed
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-400" />
                      <p className="text-sm font-semibold text-amber-300">
                        Enroll to unlock all lessons
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-400/70 mt-1">
                      Only the first lesson is available as a preview
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video player */}
            <div className="bg-black">
              <VideoPlayer
                src={activeLesson?.contentUrl}
                title={activeLesson?.title ?? ""}
              />
            </div>

            {/* Lesson navigation bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-950 border-b border-gray-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasPrev}
                onClick={handlePrev}
                className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <p className="text-[11px] text-white/40 uppercase tracking-wider">
                {activeLessonIndex >= 0
                  ? `Lesson ${activeLessonIndex + 1} of ${allLessons.length}`
                  : "No lesson selected"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasNext}
                onClick={handleNext}
                className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Lesson details */}
            <div className="p-6 space-y-5">
              {activeLesson ? (
                <>
                  <div>
                    <div className="flex items-start gap-3 justify-between">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1 min-w-0">
                        {activeLesson.title}
                      </h3>
                      <div
                        className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${activeMeta.bg}`}
                      >
                        <ActiveIcon className={`h-5 w-5 ${activeMeta.color}`} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${activeMeta.bg} ${activeMeta.color} ${activeMeta.border}`}
                      >
                        <ActiveIcon className="h-3 w-3" /> {activeMeta.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Clock className="h-3 w-3" />{" "}
                        {fmtDuration(activeLesson.durationSeconds)}
                      </span>
                      {activeLesson.isFreePreview && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Free Preview
                        </span>
                      )}
                    </div>
                  </div>

                  {activeLesson.contentText && (
                    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-[#D52B1E]" />
                        <h4 className="text-sm font-bold text-gray-800">
                          Lesson Overview
                        </h4>
                      </div>
                      <p className="text-sm leading-7 text-gray-700">
                        {activeLesson.contentText}
                      </p>
                    </div>
                  )}

                  {activeLesson.meetingLink && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                        <Video className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-rose-800">
                          Live Session
                        </p>
                        {activeLesson.scheduledAt && (
                          <p className="text-xs text-rose-600 mt-0.5">
                            Scheduled:{" "}
                            {new Date(
                              activeLesson.scheduledAt,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={activeLesson.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        Join Now
                      </a>
                    </div>
                  )}

                  {activeLesson.contentUrl && activeLesson.type === "video" && (
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                        <span>Video source available</span>
                      </div>
                      <a
                        href={activeLesson.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Open externally
                      </a>
                    </div>
                  )}

                  {activeQuizId && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                      <h4 className="text-sm font-bold text-gray-800">
                        Quiz Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleStartQuiz}
                          disabled={startQuizMutation.isPending}
                        >
                          {startQuizMutation.isPending
                            ? "Starting..."
                            : "Start Quiz"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleSubmitAttempt}
                          disabled={
                            !activeAttemptId ||
                            submitAttemptMutation.isPending ||
                            !hasRequiredAnswers
                          }
                        >
                          {submitAttemptMutation.isPending
                            ? "Submitting..."
                            : "Submit Attempt"}
                        </Button>
                      </div>
                      <div className="rounded-xl bg-violet-50 border border-violet-100 px-3 py-2">
                        <p className="text-xs font-semibold text-violet-700">
                          Quiz Details
                        </p>
                        <p className="text-xs text-violet-600 mt-0.5">
                          {activeQuiz?.title ?? "Quiz"} ·{" "}
                          {activeQuiz?.questions?.length ?? 0} questions
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">
                          Assessment Checklist
                        </p>
                        <p className="text-xs text-gray-600">
                          {activeAttemptId
                            ? "1. Attempt started"
                            : "1. Start quiz attempt"}
                        </p>
                        <p className="text-xs text-gray-600">
                          2. Answer all questions ({answeredQuestions}/
                          {quizQuestions.length})
                        </p>
                        <p className="text-xs text-gray-600">
                          3. Submit attempt
                        </p>
                      </div>
                      {quizQuestions.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
                          <h5 className="text-sm font-bold text-gray-800">
                            Answer Quiz Questions
                          </h5>
                          {!activeAttemptId && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              Start the quiz attempt first, then select your
                              answers.
                            </p>
                          )}
                          {quizQuestions.map((question, index) => {
                            const selectedValue =
                              selectedAnswers[question.id] ?? "";
                            const canAnswer = Boolean(activeAttemptId);
                            return (
                              <div
                                key={question.id}
                                className="rounded-xl border border-gray-100 p-3 space-y-2"
                              >
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Question {index + 1}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {question.text}
                                </p>

                                {question.type === "short_answer" ? (
                                  <textarea
                                    value={selectedValue}
                                    onChange={(e) =>
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [question.id]: e.target.value,
                                      }))
                                    }
                                    disabled={!canAnswer}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="Type your answer"
                                  />
                                ) : question.type === "true_false" ? (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {["true", "false"].map((value) => (
                                      <button
                                        key={value}
                                        type="button"
                                        disabled={!canAnswer}
                                        onClick={() =>
                                          setSelectedAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: value,
                                          }))
                                        }
                                        className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                          selectedValue === value
                                            ? "border-[#D52B1E] bg-[#D52B1E]/5 text-[#D52B1E]"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                      >
                                        {value === "true" ? "True" : "False"}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {question.options.map((option) => (
                                      <button
                                        key={option.id}
                                        type="button"
                                        disabled={!canAnswer}
                                        onClick={() =>
                                          setSelectedAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: option.id,
                                          }))
                                        }
                                        className={`w-full rounded-lg border px-3 py-2 text-sm text-left transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                          selectedValue === option.id
                                            ? "border-[#D52B1E] bg-[#D52B1E]/5 text-[#D52B1E]"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                      >
                                        {option.text}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <PlayCircle className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Select a lesson to start learning
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose from the curriculum on the right
                  </p>
                </div>
              )}

              {/* Course info */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#D52B1E]" />
                  <h4 className="text-sm font-bold text-gray-800">
                    About This Course
                  </h4>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: "Instructor",
                      value: instructorDisplayName,
                    },
                    {
                      label: "Category",
                      value: displayCourse?.programme?.title ?? "---",
                    },
                    { label: "Level", value: displayCourse?.level ?? "---" },
                    {
                      label: "Price",
                      value: fmtPrice(
                        displayCourse?.priceUsd,
                        displayCourse?.isFree,
                      ),
                    },
                    {
                      label: "Rating",
                      value: displayCourse?.rating
                        ? `${displayCourse.rating.toFixed(2)} / 5`
                        : "Not rated",
                    },
                    {
                      label: "Students",
                      value: `${displayCourse?.enrolledCount ?? 0} enrolled`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 shrink-0 pt-0.5">
                        {label}
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-start gap-3">
                  {instructorPhoto ? (
                    <img
                      src={instructorPhoto}
                      alt={instructorDisplayName}
                      className="h-14 w-14 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-[#D52B1E]/10 text-[#D52B1E] flex items-center justify-center font-bold">
                      {instructorDisplayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {instructorDisplayName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {displayCourse?.educator?.title ?? "Instructor"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {displayCourse?.educator?.specialization ||
                        "Islamic finance educator"}
                    </p>
                    {displayCourse?.educator?.qualifications && (
                      <p className="text-xs text-gray-500 mt-1">
                        Qualifications: {displayCourse.educator.qualifications}
                      </p>
                    )}
                    {displayCourse?.educator?.bioLong && (
                      <p className="text-sm text-gray-700 mt-2 leading-6 line-clamp-4">
                        {displayCourse.educator.bioLong}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Curriculum sidebar */}
          <div className="lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col bg-white">
            <CurriculumSidebar
              sections={sortedSections}
              activeLesson={activeLesson}
              expandedIds={expandedIds}
              onToggleSection={handleToggleSection}
              onSelectLesson={handleSelectLesson}
              onCompleteLesson={handleCompleteLesson}
              allLessons={allLessons}
              hasFullAccess={hasFullAccess}
              lockedLessonIds={lockedLessonIds}
              completedLessonIds={completedLessonIdSet}
              completingLessonId={completingLessonId}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
