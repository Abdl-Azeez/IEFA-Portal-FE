import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BookOpen, Filter, GraduationCap, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  useEnrollInLearningCourse,
  useLearningCourseContent,
  useLearningCourses,
  useLearningLessonById,
  useLearningMyCourses,
  useLearningSectionContent,
  useUnenrollFromLearningCourse,
} from "@/hooks/useLearning";

function toNumericId(value: string | number | null | undefined): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export default function CourseResults() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data: myCourses = [] } = useLearningMyCourses();
  const {
    data: coursesResponse,
    isLoading,
    isError,
  } = useLearningCourses({ page, perPage: 12, search: search || undefined });
  const { data: courseSections = [], isLoading: courseSectionsLoading } = useLearningCourseContent(
    selectedCourseId ?? undefined,
  );
  const { data: sectionItems = [], isLoading: sectionItemsLoading } = useLearningSectionContent(
    selectedSectionId ?? undefined,
  );
  const { data: selectedLesson, isLoading: selectedLessonLoading } = useLearningLessonById(
    selectedLessonId ?? undefined,
  );

  const enrollMutation = useEnrollInLearningCourse();
  const unenrollMutation = useUnenrollFromLearningCourse();

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<number>();
    myCourses.forEach((item) => {
      if (typeof item.currentCourseId === "number") ids.add(item.currentCourseId);
      const idAsNum = Number(item.itemId);
      if (Number.isFinite(idAsNum)) ids.add(idAsNum);
    });
    return ids;
  }, [myCourses]);

  const courses = coursesResponse?.data ?? [];
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );
  const hasNext = coursesResponse?.meta?.hasNextPage ?? false;
  const hasPrev = coursesResponse?.meta?.hasPreviousPage ?? page > 1;

  useEffect(() => {
    setSelectedSectionId(null);
    setSelectedLessonId(null);
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSectionId !== null) return;
    if (courseSections.length === 0) return;

    const firstSectionId = courseSections
      .map((section) => toNumericId(section.id))
      .find((id): id is number => id !== null);

    if (firstSectionId !== undefined) {
      setSelectedSectionId(firstSectionId);
    }
  }, [courseSections, selectedSectionId]);

  useEffect(() => {
    if (selectedLessonId !== null) return;
    if (sectionItems.length === 0) return;

    const firstLessonId = sectionItems
      .map((itemData) => toNumericId(itemData.id))
      .find((id): id is number => id !== null);

    if (firstLessonId !== undefined) {
      setSelectedLessonId(firstLessonId);
    }
  }, [sectionItems, selectedLessonId]);

  let coursesContent: ReactNode;
  if (isLoading) {
    coursesContent = <Card><CardContent className="p-6 text-sm text-[#737692]">Loading courses...</CardContent></Card>;
  } else if (isError) {
    coursesContent = <Card><CardContent className="p-6"><EmptyState title="Unable to load courses" description="Check API availability and try again." /></CardContent></Card>;
  } else if (courses.length === 0) {
    coursesContent = <Card><CardContent className="p-6"><EmptyState title="No courses found" description="Try another search term." /></CardContent></Card>;
  } else {
    coursesContent = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course, index) => {
          const isEnrolled = enrolledCourseIds.has(course.id);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">{course.status}</Badge>
                    <Badge variant="outline">{course.isFree ? "Free" : `$${course.priceUsd}`}</Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between text-xs text-[#737692]">
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {course.level}</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.videoCount} videos</span>
                  </div>
                  <p className="text-xs text-[#737692]">Educator: {course.educator?.name ?? "-"}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setSelectedSectionId(null);
                      setSelectedLessonId(null);
                    }}
                  >
                    View Outline
                  </Button>
                  <Button
                    className="w-full"
                    variant={isEnrolled ? "outline" : "default"}
                    onClick={() => {
                      if (isEnrolled) {
                        unenrollMutation.mutate(course.id);
                      } else {
                        enrollMutation.mutate(course.id);
                      }
                    }}
                    disabled={enrollMutation.isPending || unenrollMutation.isPending}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="bg-gradient-to-r from-[#D52B1E] to-[#8B1E1E] text-white py-10 px-4 sm:px-6 rounded-xl">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Learning Catalogue</h1>
          <p className="text-sm opacity-95">Integrated with GET /learning/courses and enroll endpoints from the current API contract.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:max-w-sm w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search courses"
              className="pl-9"
            />
          </div>
          <div className="text-xs text-[#737692] flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            API supports `search`, `page`, `perPage`, `categoryId`.
          </div>
        </CardContent>
      </Card>

      {coursesContent}

      {!isLoading && !isError && courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Flow Explorer</CardTitle>
            <CardDescription>
              Flow: course to course sections to section lessons to lesson content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-slate-200 p-3 bg-slate-50/60">
              <p className="text-sm font-medium text-slate-900">
                {selectedCourse ? selectedCourse.title : "Select a course using View Outline"}
              </p>
              {selectedCourse && (
                <p className="text-xs text-slate-500 mt-1">Course ID: {selectedCourse.id}</p>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">1. Sections</p>
                {selectedCourseId === null && (
                  <p className="text-xs text-slate-400">Choose a course first.</p>
                )}
                {selectedCourseId !== null && courseSectionsLoading && (
                  <p className="text-xs text-slate-500">Loading sections...</p>
                )}
                {selectedCourseId !== null && !courseSectionsLoading && courseSections.length === 0 && (
                  <p className="text-xs text-slate-400">No sections returned.</p>
                )}
                {courseSections.map((section) => {
                  const sectionId = toNumericId(section.id);
                  const isSelected = sectionId !== null && sectionId === selectedSectionId;

                  return (
                    <button
                      key={`${section.id}-${section.order}`}
                      disabled={sectionId === null}
                      onClick={() => {
                        if (sectionId === null) return;
                        setSelectedSectionId(sectionId);
                        setSelectedLessonId(null);
                      }}
                      className={`w-full text-left rounded border px-2 py-1.5 text-xs transition-colors ${
                        isSelected ? "border-[#D52B1E]/40 bg-[#D52B1E]/5" : "border-slate-200 hover:bg-slate-50"
                      } ${sectionId === null ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <p className="font-medium text-slate-800 line-clamp-1">{section.title}</p>
                      <p className="text-slate-500">Section ID: {section.id}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">2. Lessons</p>
                {selectedSectionId === null && (
                  <p className="text-xs text-slate-400">Choose a section first.</p>
                )}
                {selectedSectionId !== null && sectionItemsLoading && (
                  <p className="text-xs text-slate-500">Loading section lessons...</p>
                )}
                {selectedSectionId !== null && !sectionItemsLoading && sectionItems.length === 0 && (
                  <p className="text-xs text-slate-400">No lessons returned.</p>
                )}
                {sectionItems.map((itemData) => {
                  const lessonId = toNumericId(itemData.id);
                  const isSelected = lessonId !== null && lessonId === selectedLessonId;

                  return (
                    <button
                      key={`${itemData.id}-${itemData.order}`}
                      disabled={lessonId === null}
                      onClick={() => {
                        if (lessonId === null) return;
                        setSelectedLessonId(lessonId);
                      }}
                      className={`w-full text-left rounded border px-2 py-1.5 text-xs transition-colors ${
                        isSelected ? "border-[#D52B1E]/40 bg-[#D52B1E]/5" : "border-slate-200 hover:bg-slate-50"
                      } ${lessonId === null ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <p className="font-medium text-slate-800 line-clamp-1">{itemData.title}</p>
                      <p className="text-slate-500">Lesson ID: {itemData.id}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">3. Lesson Content</p>
                {selectedLessonId === null && (
                  <p className="text-xs text-slate-400">Choose a lesson first.</p>
                )}
                {selectedLessonId !== null && selectedLessonLoading && (
                  <p className="text-xs text-slate-500">Loading lesson detail...</p>
                )}
                {selectedLessonId !== null && !selectedLessonLoading && !selectedLesson && (
                  <p className="text-xs text-slate-400">Lesson content not returned.</p>
                )}
                {selectedLesson && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="text-sm font-semibold text-slate-900">{selectedLesson.title}</p>
                    <p>Lesson ID: {selectedLesson.id}</p>
                    <p>Course ID: {selectedLesson.courseId}</p>
                    <p>Status: {selectedLesson.status}</p>
                    <p>Duration: {Math.max(1, Math.round((selectedLesson.durationSeconds ?? 0) / 60))} min</p>
                    {selectedLesson.description && (
                      <p className="pt-1 leading-relaxed text-slate-700">{selectedLesson.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!hasPrev}>
            Previous
          </Button>
          <p className="text-sm text-[#737692]">Page {coursesResponse?.meta?.page ?? page}</p>
          <Button onClick={() => setPage((prev) => prev + 1)} disabled={!hasNext}>
            Next
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
