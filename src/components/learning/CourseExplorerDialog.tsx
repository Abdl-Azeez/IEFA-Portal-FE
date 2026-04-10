import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  ListTree,
  NotepadText,
  PlayCircle,
  Sparkles,
  Tag,
  UserRound,
  Users,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useLearningCourseContent,
  useLearningLessonById,
  useLearningSectionContent,
} from "@/hooks/useLearning";
import type { LearningOutlineItemDto, StudentCourseDto, StudentLessonDto } from "@/types/learning";

function stripHtml(value: string): string {
  if (!value) return "";
  if (typeof document === "undefined") {
    return value.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = value;
  return (element.textContent ?? "").replaceAll(/\s+/g, " ").trim();
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCourseDuration(totalDurationMinutes?: number): string {
  if (!totalDurationMinutes || totalDurationMinutes <= 0) return "Self-paced";
  if (totalDurationMinutes < 60) return `${totalDurationMinutes} min`;

  const hours = Math.floor(totalDurationMinutes / 60);
  const minutes = totalDurationMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatLessonDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) return "Self-paced";

  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatPrice(priceUsd?: number): string {
  if (!priceUsd || priceUsd <= 0) return "$0";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(priceUsd);
}

function getYouTubeEmbedUrl(videoUrl?: string | null): string | null {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replaceAll("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getEmbeddableVideoUrl(videoUrl?: string | null): string | null {
  return getYouTubeEmbedUrl(videoUrl) ?? videoUrl ?? null;
}

function extractLessonContent(description?: string) {
  if (!description) {
    return { summary: "", paragraphs: [] as string[], quizUrl: null as string | null };
  }

  if (typeof document === "undefined") {
    const text = stripHtml(description);
    return {
      summary: text,
      paragraphs: text ? [text] : [],
      quizUrl: null,
    };
  }

  const root = document.createElement("div");
  root.innerHTML = description;

  root
    .querySelectorAll(
      ".llms-parent-course-link, .llms-favorite-wrapper, .llms-course-navigation, .llms-lesson-button-wrapper .llms-button-action.auto",
    )
    .forEach((node) => node.remove());

  const quizAnchor = root.querySelector<HTMLAnchorElement>("#llms_start_quiz, a[href*='llms_quiz']");
  const paragraphs = Array.from(root.querySelectorAll("p, li, h1, h2, h3, h4"))
    .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((text) => text.toLowerCase() !== "back to course");

  const uniqueParagraphs = paragraphs.filter(
    (paragraph, index) => paragraphs.indexOf(paragraph) === index,
  );

  return {
    summary: uniqueParagraphs[0] ?? stripHtml(description),
    paragraphs: uniqueParagraphs,
    quizUrl: quizAnchor?.href ?? null,
  };
}

function extractCourseDescriptionData(description?: string) {
  if (!description) {
    return {
      summary: "",
      imageUrl: null as string | null,
      imageCaption: null as string | null,
      instructors: [] as string[],
      accessPlans: [] as string[],
      syllabusSectionTitles: [] as string[],
      syllabusLessonTitles: [] as string[],
      syllabusNotice: null as string | null,
      renderedHtml: "",
    };
  }

  if (typeof document === "undefined") {
    const text = stripHtml(description);
    return {
      summary: text,
      imageUrl: null,
      imageCaption: null,
      instructors: [],
      accessPlans: [],
      syllabusSectionTitles: [],
      syllabusLessonTitles: [],
      syllabusNotice: null,
      renderedHtml: description,
    };
  }

  const root = document.createElement("div");
  root.innerHTML = description;

  const summary =
    Array.from(root.querySelectorAll("p"))
      .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
      .find((text) => text.length > 20) ?? stripHtml(description);

  const image = root.querySelector("img");
  const caption = root.querySelector("figcaption");
  const instructors = Array.from(root.querySelectorAll(".llms-author-info.name"))
    .map((node) => (node.textContent ?? "").trim())
    .filter(Boolean);
  const accessPlans = Array.from(root.querySelectorAll(".llms-access-plan-title"))
    .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
    .filter(Boolean);
  const syllabusSectionTitles = Array.from(root.querySelectorAll(".llms-section-title"))
    .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
    .filter(Boolean);
  const syllabusLessonTitles = Array.from(root.querySelectorAll(".llms-lesson-title"))
    .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
    .filter(Boolean);
  const syllabusNotice = Array.from(root.querySelectorAll("p"))
    .map((node) => (node.textContent ?? "").replaceAll(/\s+/g, " ").trim())
    .find((text) => text.toLowerCase().includes("does not have any sections")) ?? null;

  root
    .querySelectorAll(
      "form, input, button, script, style, .clear, .llms-favorite-wrapper, .screen-reader-text",
    )
    .forEach((node) => node.remove());

  return {
    summary,
    imageUrl: image?.getAttribute("src") ?? null,
    imageCaption: (caption?.textContent ?? "").trim() || null,
    instructors,
    accessPlans,
    syllabusSectionTitles,
    syllabusLessonTitles,
    syllabusNotice,
    renderedHtml: root.innerHTML,
  };
}

function buildCourseFieldCards(course: StudentCourseDto | null) {
  return [
    { label: "Instructor", value: course?.educator?.name || "Unknown educator", icon: UserRound },
    {
      label: "Programme",
      value: course?.programme?.title || "Independent course",
      icon: BookOpen,
    },
    { label: "Duration", value: formatCourseDuration(course?.totalDurationMinutes), icon: Clock3 },
    { label: "Lessons", value: `${course?.videoCount ?? 0} lessons`, icon: PlayCircle },
    { label: "Students Enrolled", value: `${course?.enrolledCount ?? 0} students`, icon: Users },
    { label: "Level", value: course?.level || "Not specified", icon: Sparkles },
    { label: "Price", value: course?.isFree ? "Free" : formatPrice(course?.priceUsd), icon: Tag },
    {
      label: "Rating",
      value: course?.rating ? `${course.rating.toFixed(1)} / 5 (${course?.reviewCount ?? 0} reviews)` : "Not yet rated",
      icon: Sparkles,
    },
    { label: "Topics", value: course?.tags?.length ? course.tags.join(", ") : "General", icon: Tag },
    { label: "Published", value: formatDate(course?.publishedAt), icon: CalendarDays },
    {
      label: "Your Progress",
      value: course?.progressPercent ? `${course.progressPercent}%` : "Not started",
      icon: Eye,
    },
    {
      label: "Completion",
      value: course?.isCompleted
        ? course.completedAt
          ? `Completed on ${formatDate(course.completedAt)}`
          : "Completed"
        : "In progress",
      icon: Eye,
    },
  ];
}

function CourseHero({
  course,
  sectionCount,
  lessonCount,
}: Readonly<{
  course: StudentCourseDto | null;
  sectionCount: number;
  lessonCount: number;
}>) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-950 via-slate-900 to-[#280909] p-5 text-white">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D52B1E]/25 blur-3xl" />
      <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-orange-300/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="mt-2 text-2xl font-bold">{course?.title || "Select a course"}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            {course?.educator?.name ? `Taught by ${course.educator.name}` : "Browse sections and lessons below."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {course?.level && (
              <Badge className="border-transparent bg-white/10 text-white">{course.level}</Badge>
            )}
            <Badge className="border-transparent bg-white/10 text-white">
              {course?.isFree ? "Free" : formatPrice(course?.priceUsd)}
            </Badge>
            {(course?.rating ?? 0) > 0 && (
              <Badge className="border-transparent bg-white/10 text-white">★ {course?.rating?.toFixed(1)}</Badge>
            )}
            {(course?.reviewCount ?? 0) > 0 && (
              <Badge className="border-transparent bg-white/10 text-white">{course?.reviewCount} reviews</Badge>
            )}
            {(course?.progressPercent ?? 0) > 0 && (
              <Badge className="border-transparent bg-white/10 text-white">{course?.progressPercent}% complete</Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
          <StatCard label="Sections" value={sectionCount} />
          <StatCard label="Lessons" value={lessonCount} />
          <StatCard label="Level" value={course?.level || "Unknown"} compact />
          <StatCard label="Access" value={course?.isFree ? "Free" : "Enrollment required"} compact />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  compact = false,
}: Readonly<{ label: string; value: string | number; compact?: boolean }>) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-1 font-bold ${compact ? "text-sm" : "text-xl"}`}>{value}</p>
    </div>
  );
}

function CourseStoryPanel({
  course,
  previewEmbedUrl,
  courseDescriptionData,
}: Readonly<{
  course: StudentCourseDto | null;
  previewEmbedUrl: string | null;
  courseDescriptionData: ReturnType<typeof extractCourseDescriptionData>;
}>) {
  const artworkAlt = course?.title || "Course artwork";
  const artworkSrc = course?.coverImageUrl || courseDescriptionData.imageUrl;
  const instructors =
    courseDescriptionData.instructors.length > 0
      ? courseDescriptionData.instructors
      : [course?.educator?.name || "Unknown educator"];
  const accessPlans =
    courseDescriptionData.accessPlans.length > 0
      ? courseDescriptionData.accessPlans
      : [course?.isFree ? "Free access" : "Paid access"];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex items-center gap-2">
          <NotepadText className="h-4 w-4 text-[#D52B1E]" />
          <h3 className="font-semibold text-gray-900">About This Course</h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Learn what this course covers, who teaches it, and what to expect.
        </p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            {artworkSrc ? (
              <img src={artworkSrc} alt={artworkAlt} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-gray-400">
                No course image available
              </div>
            )}
          </div>

          {courseDescriptionData.imageCaption && (
            <p className="text-xs text-gray-500">Image caption: {courseDescriptionData.imageCaption}</p>
          )}

          {previewEmbedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-black shadow-sm">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={previewEmbedUrl}
                  title={`${artworkAlt} preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
            <h4 className="font-semibold text-gray-900">Course Summary</h4>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {courseDescriptionData.summary || stripHtml(course?.description || "") || "No course description available."}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoListCard title="Instructors" items={instructors} itemClassName="bg-gray-50 text-gray-700" />
            <InfoListCard title="Access Plans" items={accessPlans} itemClassName="bg-orange-50 text-orange-700" />
          </div>

          <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-900">Course Syllabus</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <BadgeCluster
                title="Sections"
                items={courseDescriptionData.syllabusSectionTitles}
                emptyText="No sections listed."
                variant="outline"
              />
              <BadgeCluster
                title="Lessons"
                items={courseDescriptionData.syllabusLessonTitles.slice(0, 8)}
                emptyText="No lessons listed."
                className="bg-[#D52B1E]/10 text-[#D52B1E] border-transparent"
              />
            </div>
            {courseDescriptionData.syllabusNotice && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {courseDescriptionData.syllabusNotice}
              </p>
            )}
          </div>

          {courseDescriptionData.renderedHtml && (
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900">Full Description</h4>
              <div
                className="prose prose-sm mt-3 max-w-none overflow-hidden text-gray-700 prose-img:rounded-xl prose-figure:my-4 prose-a:text-[#D52B1E]"
                dangerouslySetInnerHTML={{ __html: courseDescriptionData.renderedHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoListCard({
  title,
  items,
  itemClassName,
}: Readonly<{ title: string; items: string[]; itemClassName: string }>) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className={`rounded-xl px-3 py-2 text-sm ${itemClassName}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeCluster({
  title,
  items,
  emptyText,
  variant,
  className,
}: Readonly<{
  title: string;
  items: string[];
  emptyText: string;
  variant?: "outline";
  className?: string;
}>) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Badge key={`${item}-${index}`} variant={variant} className={className}>
              {item}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-gray-400">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function PayloadAtlas({ course }: Readonly<{ course: StudentCourseDto | null }>) {
  const courseFieldCards = useMemo(() => buildCourseFieldCards(course), [course]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#D52B1E]" />
        <h3 className="font-semibold text-gray-900">Course Details</h3>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Key information about this course at a glance.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {courseFieldCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Icon className="h-4 w-4 text-[#D52B1E]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            </div>
            <p className="mt-2 break-words text-sm text-gray-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutlineColumn({
  sections,
  sectionsLoading,
  selectedSectionId,
  onSelectSection,
}: Readonly<{
  sections: LearningOutlineItemDto[];
  sectionsLoading: boolean;
  selectedSectionId: number | null;
  onSelectSection: (sectionId: number) => void;
}>) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D52B1E]/10 text-[#D52B1E]">
          <ListTree className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Course Sections</p>
          <p className="text-xs text-gray-500">Select a section to browse its lessons</p>
        </div>
      </div>

      <div className="space-y-2">
        {sectionsLoading && <p className="text-sm text-gray-500">Loading sections...</p>}
        {!sectionsLoading && sections.length === 0 && (
          <p className="text-sm text-gray-400">No sections are available for this course yet.</p>
        )}
        {sections.map((section) => {
          const active = section.id === selectedSectionId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                active
                  ? "border-[#D52B1E]/30 bg-[#D52B1E]/5 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{section.title}</p>
                </div>
                <Badge variant="outline">#{section.order}</Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LessonsColumn({
  selectedSectionId,
  lessons,
  lessonsLoading,
  selectedLessonId,
  onSelectLesson,
}: Readonly<{
  selectedSectionId: number | null;
  lessons: LearningOutlineItemDto[];
  lessonsLoading: boolean;
  selectedLessonId: number | null;
  onSelectLesson: (lessonId: number) => void;
}>) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Section Lessons</p>
          <p className="text-xs text-gray-500">
            {selectedSectionId ? "Select a lesson to view its content" : "Choose a section first"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {selectedSectionId === null && (
          <p className="text-sm text-gray-400">Select a section to see its lessons.</p>
        )}
        {selectedSectionId !== null && lessonsLoading && (
          <p className="text-sm text-gray-500">Loading lessons...</p>
        )}
        {selectedSectionId !== null && !lessonsLoading && lessons.length === 0 && (
          <p className="text-sm text-gray-400">No lessons are available in this section yet.</p>
        )}
        {lessons.map((lessonItem) => {
          const active = lessonItem.id === selectedLessonId;

          return (
            <button
              key={lessonItem.id}
              type="button"
              onClick={() => onSelectLesson(lessonItem.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                active
                  ? "border-orange-300 bg-orange-50 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700 shadow-sm">
                  {lessonItem.order}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{lessonItem.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize tracking-wide">
                      {lessonItem.type}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LessonPanel({
  lesson,
  selectedLessonId,
  lessonLoading,
  lessonIndex,
  lessonCount,
  hasPreviousLesson,
  hasNextLesson,
  onPreviousLesson,
  onNextLesson,
  content,
  embedUrl,
}: Readonly<{
  lesson: StudentLessonDto | undefined;
  selectedLessonId: number | null;
  lessonLoading: boolean;
  lessonIndex: number;
  lessonCount: number;
  hasPreviousLesson: boolean;
  hasNextLesson: boolean;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  content: ReturnType<typeof extractLessonContent>;
  embedUrl: string | null;
}>) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900">
              {lesson?.title || "Select a lesson"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {lesson?.course?.title || "Lesson details will appear here."}
            </p>
          </div>
          {lesson && <Badge variant="outline">{lesson.status}</Badge>}
        </div>

        {lesson && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-transparent">
              <Clock3 className="mr-1 h-3 w-3" /> {formatLessonDuration(lesson.durationSeconds)}
            </Badge>
            <Badge variant="outline">{lesson.isFree ? "Free Preview" : "Enrolled Access"}</Badge>
            {lesson.quizId && <Badge variant="outline">Includes Quiz</Badge>}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasPreviousLesson}
            onClick={onPreviousLesson}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" /> Previous lesson
          </Button>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lesson navigation</p>
            <p className="text-sm font-medium text-gray-900">
              {lessonIndex >= 0 ? `${lessonIndex + 1} of ${lessonCount}` : "No lesson selected"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasNextLesson}
            onClick={onNextLesson}
            className="rounded-xl"
          >
            Next lesson <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {selectedLessonId === null && (
          <p className="text-sm text-gray-400">Choose a lesson from the section list to begin.</p>
        )}
        {selectedLessonId !== null && lessonLoading && (
          <p className="text-sm text-gray-500">Loading lesson content...</p>
        )}
        {selectedLessonId !== null && !lessonLoading && !lesson && (
          <p className="text-sm text-gray-400">This lesson's details could not be loaded.</p>
        )}

        {lesson && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-4">
              {embedUrl ? (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-black shadow-sm">
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No video is available for this lesson.
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-900">
                  <Sparkles className="h-4 w-4 text-[#D52B1E]" />
                  <h4 className="font-semibold">Lesson Summary</h4>
                </div>
                <p className="text-sm leading-6 text-gray-700">
                  {content.summary || "No description is available for this lesson."}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <h4 className="font-semibold text-gray-900">Content Highlights</h4>
                <div className="mt-3 space-y-3">
                  {content.paragraphs.length > 0 ? (
                    content.paragraphs.slice(0, 8).map((paragraph) => (
                      <div
                        key={paragraph}
                        className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
                      >
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D52B1E]" />
                        <p className="text-sm leading-6 text-gray-700">{paragraph}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No additional content is available for this lesson.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                <div className="mt-3 space-y-2">
                  {lesson.videoUrl && (
                    <Button asChild className="w-full justify-between bg-[#D52B1E] hover:bg-[#B8241B]">
                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                        Open lesson video <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {content.quizUrl && (
                    <Button asChild variant="outline" className="w-full justify-between">
                      <a href={content.quizUrl} target="_blank" rel="noreferrer">
                        Open quiz <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {!lesson.videoUrl && !content.quizUrl && (
                    <p className="text-sm text-gray-400">No video or quiz is available for this lesson.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#D52B1E]/5 to-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-[#D52B1E]" />
                  <h4 className="font-semibold text-gray-900">Lesson Info</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {lesson?.course?.title && (
                    <p><span className="font-semibold text-gray-900">Course:</span> {lesson.course.title}</p>
                  )}
                  <p><span className="font-semibold text-gray-900">Duration:</span> {formatLessonDuration(lesson?.durationSeconds)}</p>
                  <p><span className="font-semibold text-gray-900">Access:</span> {lesson?.isFree ? "Free preview" : "Available after enrollment"}</p>
                  {lesson?.quizId && (
                    <p><span className="font-semibold text-gray-900">Assessment:</span> Quiz included</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CourseExplorerDialogProps {
  readonly course: StudentCourseDto | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CourseExplorerDialog({
  course,
  open,
  onClose,
}: CourseExplorerDialogProps) {
  const courseId = course?.id;
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const { data: sections = [], isLoading: sectionsLoading } = useLearningCourseContent(
    open ? courseId : undefined,
  );
  const { data: lessons = [], isLoading: lessonsLoading } = useLearningSectionContent(
    open ? selectedSectionId ?? undefined : undefined,
  );
  const { data: lesson, isLoading: lessonLoading } = useLearningLessonById(
    open ? selectedLessonId ?? undefined : undefined,
  );

  useEffect(() => {
    if (!open) return;
    setSelectedSectionId(null);
    setSelectedLessonId(null);
  }, [courseId, open]);

  useEffect(() => {
    if (selectedSectionId !== null || sections.length === 0) return;
    setSelectedSectionId(sections[0].id);
  }, [sections, selectedSectionId]);

  useEffect(() => {
    if (selectedLessonId !== null || lessons.length === 0) return;
    setSelectedLessonId(lessons[0].id);
  }, [lessons, selectedLessonId]);

  const content = useMemo(() => extractLessonContent(lesson?.description), [lesson?.description]);
  const courseDescriptionData = useMemo(
    () => extractCourseDescriptionData(course?.description),
    [course?.description],
  );
  const previewEmbedUrl = useMemo(
    () => getEmbeddableVideoUrl(course?.previewVideoUrl),
    [course?.previewVideoUrl],
  );
  const lessonEmbedUrl = useMemo(() => getEmbeddableVideoUrl(lesson?.videoUrl), [lesson?.videoUrl]);
  const selectedLessonIndex = useMemo(
    () => lessons.findIndex((lessonItem) => lessonItem.id === selectedLessonId),
    [lessons, selectedLessonId],
  );
  const hasPreviousLesson = selectedLessonIndex > 0;
  const hasNextLesson = selectedLessonIndex >= 0 && selectedLessonIndex < lessons.length - 1;

  const handlePreviousLesson = () => {
    if (!hasPreviousLesson) return;
    const previousLesson = lessons[selectedLessonIndex - 1];
    if (previousLesson) setSelectedLessonId(previousLesson.id);
  };

  const handleNextLesson = () => {
    if (!hasNextLesson) return;
    const nextLesson = lessons[selectedLessonIndex + 1];
    if (nextLesson) setSelectedLessonId(nextLesson.id);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={course?.title || "Course Explorer"}
      maxWidth="max-w-7xl"
    >
      <div className="space-y-5">
        <CourseHero course={course} sectionCount={sections.length} lessonCount={lessons.length} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          <CourseStoryPanel
            course={course}
            previewEmbedUrl={previewEmbedUrl}
            courseDescriptionData={courseDescriptionData}
          />
          <PayloadAtlas course={course} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_320px_minmax(0,1fr)]">
          <OutlineColumn
            sections={sections}
            sectionsLoading={sectionsLoading}
            selectedSectionId={selectedSectionId}
            onSelectSection={(sectionId) => {
              setSelectedSectionId(sectionId);
              setSelectedLessonId(null);
            }}
          />
          <LessonsColumn
            selectedSectionId={selectedSectionId}
            lessons={lessons}
            lessonsLoading={lessonsLoading}
            selectedLessonId={selectedLessonId}
            onSelectLesson={setSelectedLessonId}
          />
          <LessonPanel
            lesson={lesson}
            selectedLessonId={selectedLessonId}
            lessonLoading={lessonLoading}
            lessonIndex={selectedLessonIndex}
            lessonCount={lessons.length}
            hasPreviousLesson={hasPreviousLesson}
            hasNextLesson={hasNextLesson}
            onPreviousLesson={handlePreviousLesson}
            onNextLesson={handleNextLesson}
            content={content}
            embedUrl={lessonEmbedUrl}
          />
        </div>
      </div>
    </Dialog>
  );
}
