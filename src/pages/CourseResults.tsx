import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Filter, GraduationCap, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  useEnrollInLearningCourse,
  useLearningCourses,
  useLearningMyCourses,
  useUnenrollFromLearningCourse,
} from "@/hooks/useLearning";

export default function CourseResults() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data: myCourses = [] } = useLearningMyCourses();
  const {
    data: coursesResponse,
    isLoading,
    isError,
  } = useLearningCourses({ page, perPage: 12, search: search || undefined });

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
  const hasNext = coursesResponse?.meta?.hasNextPage ?? false;
  const hasPrev = coursesResponse?.meta?.hasPreviousPage ?? page > 1;

  let coursesContent: JSX.Element;
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
