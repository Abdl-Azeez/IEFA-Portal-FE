import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  FileText,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  useAcademyCategoryTypes,
  useAcademyQuizTypes,
  useAdminAcademyDashboard,
  useAdminAcademyInstructors,
  useAdminAcademyCourses,
  useAdminAcademyCoursesMeta,
  useAdminCourseEnrollments,
  useAdminCourseEnrollmentsMeta,
  useAdminCreateCourse,
  useAdminDeleteCourse,
  useAdminPublishCourse,
  useAdminSuspendCourse,
  useAdminUnsuspendCourse,
  useAdminUpdateCourse,
  useInstructorAddQuiz,
  useInstructorAddQuestion,
  useInstructorAddOption,
  useInstructorQuizDetails,
  useInstructorCourseDetails,
} from "@/hooks/useAcademy";
import type {
  AcademyInstructorCourseDto,
  AcademyInstructorCreateCourseDto,
  AcademyInstructorCourseUpdateDto,
} from "@/types/learning";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } };

type Tab = "courses" | "enrollments" | "content";

type CourseColumnKey =
  | "level"
  | "instructor"
  | "category"
  | "enrolled"
  | "price"
  | "lessons"
  | "status";

const COURSE_COLUMN_OPTIONS: Array<{ key: CourseColumnKey; label: string }> = [
  { key: "level", label: "Level" },
  { key: "instructor", label: "Instructor" },
  { key: "category", label: "Category" },
  { key: "enrolled", label: "Enrolled" },
  { key: "price", label: "Price" },
  { key: "lessons", label: "Lessons" },
  { key: "status", label: "Status" },
];

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "courses", label: "All Courses", icon: BookOpen },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "content", label: "Content Management", icon: FileText },
];

const VALID_TABS = new Set<Tab>(["courses", "enrollments", "content"]);

const emptyAcademyCourse: AcademyInstructorCreateCourseDto = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  categoryId: "",
  thumbnailUrl: "",
  level: "beginner",
  price: 0,
  isFree: false,
};

export default function AdminAcademy() {
  // NOSONAR
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] =
    useState<AcademyInstructorCourseDto | null>(null);
  const [courseForm, setCourseForm] =
    useState<AcademyInstructorCreateCourseDto>(emptyAcademyCourse);
  const [quizCourseIdInput, setQuizCourseIdInput] = useState("");
  const [quizTitleInput, setQuizTitleInput] = useState("");
  const [quizIdInput, setQuizIdInput] = useState("");
  const [questionTextInput, setQuestionTextInput] = useState("");
  const [questionTypeInput, setQuestionTypeInput] = useState("mcq");
  const [questionIdInput, setQuestionIdInput] = useState("");
  const [optionTextInput, setOptionTextInput] = useState("");
  const [optionCorrectInput, setOptionCorrectInput] = useState(false);
  const [enrollmentCourseId, setEnrollmentCourseId] = useState("");
  const [addQCourseId, setAddQCourseId] = useState("");
  const [assignInstructorId, setAssignInstructorId] = useState("");
  const [viewingCourse, setViewingCourse] = useState<
    AcademyInstructorCourseDto | null
  >(null);
  const [courseStatusFilter, setCourseStatusFilter] = useState("");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState("");
  const [courseInstructorFilter, setCourseInstructorFilter] = useState("");
  const [courseOrder, setCourseOrder] = useState<"ASC" | "DESC">("ASC");
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<CourseColumnKey, boolean>>({
    level: true,
    instructor: false,
    category: false,
    enrolled: true,
    price: true,
    lessons: false,
    status: true,
  });
  const [coursesPage, setCoursesPage] = useState(1);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(10);
  const enrollmentsPerPage = 20;

  // Parse tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as Tab;
    if (tab && VALID_TABS.has(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Update URL when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/admin/academy?tab=${tab}`, { replace: true });
  };

  // Academy data hooks
  const { data: allCourses = [], isLoading: coursesLoading } =
    useAdminAcademyCourses({
      page: coursesPage,
      perPage: coursesPerPage,
      search: searchQuery.trim() || undefined,
      categoryId: courseCategoryFilter || undefined,
      instructorId: courseInstructorFilter || undefined,
      status:
        (courseStatusFilter as
          | "draft"
          | "review"
          | "published"
          | "archived"
          | "suspended") || undefined,
      order: courseOrder,
    });
  const { data: allCoursesMeta } = useAdminAcademyCoursesMeta({
    page: coursesPage,
    perPage: coursesPerPage,
    search: searchQuery.trim() || undefined,
    categoryId: courseCategoryFilter || undefined,
    instructorId: courseInstructorFilter || undefined,
    status:
      (courseStatusFilter as
        | "draft"
        | "review"
        | "published"
        | "archived"
        | "suspended") || undefined,
    order: courseOrder,
  });
  const { data: adminDashboard } = useAdminAcademyDashboard();
  const categoryTypesQuery = useAcademyCategoryTypes();
  const instructorsQuery = useAdminAcademyInstructors({ page: 1, perPage: 100 });
  const { data: courseEnrollments = [], isLoading: enrollmentsLoading } =
    useAdminCourseEnrollments(enrollmentCourseId || undefined, {
      page: enrollmentsPage,
      perPage: enrollmentsPerPage,
    });
  const { data: courseEnrollmentsMeta } = useAdminCourseEnrollmentsMeta(
    enrollmentCourseId || undefined,
    {
      page: enrollmentsPage,
      perPage: enrollmentsPerPage,
    },
  );
  const adminCreateCourseMutation = useAdminCreateCourse();
  const updateCourseMutation = useAdminUpdateCourse();
  const publishCourseMutation = useAdminPublishCourse();
  const suspendCourseMutation = useAdminSuspendCourse();
  const unsuspendCourseMutation = useAdminUnsuspendCourse();
  const deleteCourseMutation = useAdminDeleteCourse();
  const addQuizMutation = useInstructorAddQuiz();
  const addQuestionMutation = useInstructorAddQuestion();
  const addOptionMutation = useInstructorAddOption();
  const quizTypesQuery = useAcademyQuizTypes();
  const quizDetailsQuery = useInstructorQuizDetails(quizIdInput || undefined);
  const courseForQuizzes = useInstructorCourseDetails(
    addQCourseId || undefined,
  );

  const courseQuizList = useMemo(
    () =>
      (courseForQuizzes.data?.sections ?? []).flatMap((s) =>
        (s.lessons ?? [])
          .filter((l) => l.quizId != null)
          .map((l) => ({
            id: String(l.quizId as string | number),
            label: l.title,
          })),
      ),
    [courseForQuizzes.data],
  );

  const filteredCourses = allCourses;

  useEffect(() => {
    setCoursesPage(1);
  }, [searchQuery, courseCategoryFilter, courseInstructorFilter, courseStatusFilter, courseOrder]);

  useEffect(() => {
    setEnrollmentsPage(1);
  }, [enrollmentCourseId]);

  // Handle course creation
  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) {
      toast({
        title: "Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = courseForm.title
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/(^-|-$)/g, "");

      await adminCreateCourseMutation.mutateAsync({
        ...courseForm,
        slug,
        ...(assignInstructorId ? { instructorId: assignInstructorId } : {}),
      });

      setShowCreateModal(false);
      setCourseForm(emptyAcademyCourse);
      setAssignInstructorId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  // Handle course update
  const handleUpdateCourse = async () => {
    if (!editingCourse || !courseForm.title.trim()) return;

    try {
      await updateCourseMutation.mutateAsync({
        courseId: editingCourse.id,
        payload: {
          ...(courseForm as AcademyInstructorCourseUpdateDto),
          ...(assignInstructorId ? { instructorId: assignInstructorId } : {}),
        },
      });

      setEditingCourse(null);
      setCourseForm(emptyAcademyCourse);
      toast({ title: "Success", description: "Course updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    }
  };

  // Handle course suspension / unsuspend (admin API)
  const handleSuspendCourse = async (courseId: string | number) => {
    try {
      await suspendCourseMutation.mutateAsync(courseId);
    } catch {
      toast({
        title: "Error",
        description: "Failed to suspend course",
        variant: "destructive",
      });
    }
  };

  const handleUnsuspendCourse = async (courseId: string | number) => {
    try {
      await unsuspendCourseMutation.mutateAsync(courseId);
    } catch {
      toast({
        title: "Error",
        description: "Failed to unsuspend course",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async (courseId: string | number) => {
    try {
      await publishCourseMutation.mutateAsync(courseId);
    } catch {
      toast({
        title: "Error",
        description: "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    const confirmed = window.confirm(
      "This will permanently delete the course. Continue?",
    );
    if (!confirmed) return;

    try {
      await deleteCourseMutation.mutateAsync(courseId);
      if (editingCourse && String(editingCourse.id) === String(courseId)) {
        setEditingCourse(null);
        setCourseForm(emptyAcademyCourse);
        setAssignInstructorId("");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  // Open edit modal
  const handleEditCourse = (course: AcademyInstructorCourseDto) => {
    setEditingCourse(course);
    setAssignInstructorId(course.educatorId ? String(course.educatorId) : "");
    setCourseForm({
      title: course.title,
      slug: course.slug || "",
      subtitle: "",
      description: course.description || "",
      categoryId: "",
      thumbnailUrl: course.coverImageUrl || "",
      level: (course.level || "beginner") as
        | "beginner"
        | "intermediate"
        | "advanced",
      price: course.priceUsd || 0,
      isFree: course.isFree || false,
    });
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalCourses =
      Number(adminDashboard?.totalCourses ?? allCourses.length) || 0;
    const publishedCourses =
      Number(
        adminDashboard?.publishedCourses ??
          allCourses.filter((c) => c.status === "published").length,
      ) || 0;
    const suspendedCourses =
      Number(
        adminDashboard?.suspendedCourses ??
          allCourses.filter((c) => c.status === "suspended").length,
      ) || 0;
    const totalEnrollments =
      Number(adminDashboard?.totalEnrollments ?? 0) ||
      allCourses.reduce(
      (sum, c) => sum + ((c as AcademyInstructorCourseDto).enrolledCount || 0),
      0,
    );

    return {
      totalCourses,
      publishedCourses,
      suspendedCourses,
      totalEnrollments,
    };
  }, [allCourses, adminDashboard]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Academy Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage academy courses, enrollments, and analytics
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Courses",
            value: stats.totalCourses,
            icon: BookOpen,
            color: "#3b82f6",
          },
          {
            label: "Published",
            value: stats.publishedCourses,
            icon: Eye,
            color: "#10b981",
          },
          {
            label: "Suspended",
            value: stats.suspendedCourses,
            icon: PauseCircle,
            color: "#ef4444",
          },
          {
            label: "Total Enrollments",
            value: stats.totalEnrollments,
            icon: Users,
            color: "#f59e0b",
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabChange(tab.id)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={item}>
        {activeTab === "courses" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Backend filters */}
            <div className="grid gap-3 md:grid-cols-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Status
                </label>
                <Select
                  value={courseStatusFilter}
                  onChange={(e) => setCourseStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Category
                </label>
                <Select
                  value={courseCategoryFilter}
                  onChange={(e) => setCourseCategoryFilter(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categoryTypesQuery.data?.map((cat) => (
                    <option key={String(cat.id)} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Instructor
                </label>
                <Select
                  value={courseInstructorFilter}
                  onChange={(e) => setCourseInstructorFilter(e.target.value)}
                >
                  <option value="">All instructors</option>
                  {(instructorsQuery.data ?? []).map((u) => {
                    const fullName = [u.firstName, u.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim();
                    const label = fullName || u.username || u.email || "Instructor";
                    return (
                      <option key={u.id} value={u.id}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Order
                </label>
                <Select
                  value={courseOrder}
                  onChange={(e) =>
                    setCourseOrder((e.target.value as "ASC" | "DESC") || "ASC")
                  }
                >
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Per page
                </label>
                <Select
                  value={String(coursesPerPage)}
                  onChange={(e) => {
                    const next = Number(e.target.value) || 10;
                    setCoursesPerPage(next);
                    setCoursesPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Columns
                </label>
                <button
                  type="button"
                  onClick={() => setShowColumnPicker((v) => !v)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:border-gray-300 inline-flex items-center justify-between"
                >
                  <span>Choose columns</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showColumnPicker ? "rotate-180" : ""}`} />
                </button>
                {showColumnPicker && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg p-2 space-y-1">
                    {COURSE_COLUMN_OPTIONS.map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#D52B1E] focus:ring-[#D52B1E]"
                          checked={visibleColumns[option.key]}
                          onChange={(e) =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [option.key]: e.target.checked,
                            }))
                          }
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Table */}
            {coursesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded mb-4" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState
                title="No courses found"
                description={
                  searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first academy course"
                }
                icon={BookOpen}
              />
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Course
                      </th>
                      {visibleColumns.level && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Level
                        </th>
                      )}
                      {visibleColumns.instructor && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Instructor
                        </th>
                      )}
                      {visibleColumns.category && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Category
                        </th>
                      )}
                      {visibleColumns.enrolled && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Enrolled
                        </th>
                      )}
                      {visibleColumns.price && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Price
                        </th>
                      )}
                      {visibleColumns.lessons && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Lessons
                        </th>
                      )}
                      {visibleColumns.status && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                      )}
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredCourses.map((course) => (
                      <tr key={String(course.id)} className="hover:bg-gray-50">
                        <td className="px-6 py-4 align-top w-[280px] max-w-[280px]">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[260px]">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-[260px]">
                            {course.description || "No description"}
                          </div>
                        </td>
                        {visibleColumns.level && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600 capitalize">
                            {course.level}
                          </td>
                        )}
                        {visibleColumns.instructor && (
                          <td className="px-6 py-4 align-top text-sm text-gray-600">
                            <p className="font-medium text-gray-800">
                              {course.educator?.name || "-"}
                            </p>
                            {course.educator?.email && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {course.educator.email}
                              </p>
                            )}
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                            {course.programme?.title || "-"}
                          </td>
                        )}
                        {visibleColumns.enrolled && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                            {course.enrolledCount || 0}
                          </td>
                        )}
                        {visibleColumns.price && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-semibold text-gray-900">
                            {course.isFree ? "Free" : `$${course.priceUsd}`}
                          </td>
                        )}
                        {visibleColumns.lessons && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                            {course.lessonCount ?? course.videoCount ?? 0}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4 whitespace-nowrap align-top text-sm">
                            <Badge
                              variant={
                                course.status === "published"
                                  ? "default"
                                  : course.status === "suspended"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {course.status}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium text-gray-900">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              title="View more"
                              onClick={() =>
                                setViewingCourse(
                                  course as AcademyInstructorCourseDto,
                                )
                              }
                              className="gap-1.5"
                            >
                              <Eye className="h-4 w-4" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit"
                              onClick={() =>
                                handleEditCourse(
                                  course as AcademyInstructorCourseDto,
                                )
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {course.status !== "published" && (
                              <Button
                                variant="outline"
                                size="sm"
                                title={
                                  course.status === "suspended"
                                    ? "Re-publish"
                                    : "Publish"
                                }
                                onClick={() =>
                                  void handlePublishCourse(course.id)
                                }
                                disabled={publishCourseMutation.isPending}
                                className="text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {course.status === "suspended" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Unsuspend"
                                onClick={() =>
                                  void handleUnsuspendCourse(course.id)
                                }
                                disabled={unsuspendCourseMutation.isPending}
                                className="text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                title="Suspend"
                                onClick={() =>
                                  void handleSuspendCourse(course.id)
                                }
                                disabled={suspendCourseMutation.isPending}
                                className="text-red-500 hover:text-red-600 hover:border-red-300"
                              >
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete permanently"
                              onClick={() => void handleDeleteCourse(course.id)}
                              disabled={deleteCourseMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!coursesLoading && filteredCourses.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoursesPage((p) => Math.max(1, p - 1))}
                    disabled={!allCoursesMeta?.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <p className="text-xs text-gray-500">
                    Page {allCoursesMeta?.page ?? coursesPage} of {allCoursesMeta?.pageCount ?? coursesPage}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setCoursesPage((p) => p + 1)}
                    disabled={!allCoursesMeta?.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "enrollments" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollments</CardTitle>
                <CardDescription>
                  Select a course to view all enrolled students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <Select
                    value={enrollmentCourseId}
                    onChange={(e) => setEnrollmentCourseId(e.target.value)}
                  >
                    <option value="">— Select a course —</option>
                    {allCourses.map((c) => (
                      <option key={String(c.id)} value={String(c.id)}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                </div>

                {!enrollmentCourseId ? (
                  <EmptyState
                    title="No course selected"
                    description="Choose a course above to see its enrolled students"
                    icon={Users}
                  />
                ) : enrollmentsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : courseEnrollments.length === 0 ? (
                  <EmptyState
                    title="No enrollments"
                    description="No students are enrolled in this course yet"
                    icon={Users}
                  />
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            User
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Progress
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Lessons Done
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Enrolled
                          </th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Completed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {courseEnrollments.map((enrollment) => {
                          const name = enrollment.user
                            ? [
                                enrollment.user.firstName,
                                enrollment.user.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                              enrollment.user.username ||
                              enrollment.user.email ||
                              enrollment.userName ||
                              "Unknown user"
                            : enrollment.userName || "Unknown user";
                          const email =
                            enrollment.user?.email || enrollment.userEmail;
                          return (
                            <tr
                              key={enrollment.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-5 py-3">
                                <div className="font-medium text-gray-900">
                                  {name}
                                </div>
                                {email && (
                                  <div className="text-xs text-gray-400">
                                    {email}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <Badge
                                  variant={
                                    enrollment.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {enrollment.status}
                                </Badge>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                      className="h-full bg-[#D52B1E] rounded-full"
                                      style={{
                                        width: `${enrollment.progressPercent ?? 0}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {enrollment.progressPercent ?? 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-gray-600 font-medium">
                                {Number(enrollment.completedLessonsCount ?? 0)}
                              </td>
                              <td className="px-5 py-3 text-gray-500">
                                {enrollment.enrolledAt
                                  ? new Date(
                                      enrollment.enrolledAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td className="px-5 py-3 text-gray-500">
                                {enrollment.completedAt
                                  ? new Date(
                                      enrollment.completedAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!enrollmentsLoading && (courseEnrollmentsMeta?.pageCount ?? 1) > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEnrollmentsPage((p) => Math.max(1, p - 1))
                      }
                      disabled={!courseEnrollmentsMeta?.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <p className="text-xs text-gray-500">
                      Page {courseEnrollmentsMeta?.page ?? enrollmentsPage} of {courseEnrollmentsMeta?.pageCount ?? enrollmentsPage}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setEnrollmentsPage((p) => p + 1)}
                      disabled={!courseEnrollmentsMeta?.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Manage course content, sections, and lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Create Quiz
                    </p>
                    <select
                      value={quizCourseIdInput}
                      onChange={(e) => setQuizCourseIdInput(e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 focus:border-[#D52B1E]"
                    >
                      <option value="">Select a course…</option>
                      {allCourses.map((c) => (
                        <option key={String(c.id)} value={String(c.id)}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Quiz title"
                      value={quizTitleInput}
                      onChange={(e) => setQuizTitleInput(e.target.value)}
                    />
                    <Button
                      onClick={async () => {
                        if (!quizCourseIdInput || !quizTitleInput.trim())
                          return;
                        await addQuizMutation.mutateAsync({
                          courseId: quizCourseIdInput,
                          payload: {
                            title: quizTitleInput.trim(),
                            passPercentage: 70,
                          },
                        });
                        setQuizTitleInput("");
                      }}
                      disabled={addQuizMutation.isPending}
                    >
                      Add Quiz
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Add Question to Quiz
                    </p>
                    <select
                      value={addQCourseId}
                      onChange={(e) => {
                        setAddQCourseId(e.target.value);
                        setQuizIdInput("");
                        setQuestionIdInput("");
                      }}
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 focus:border-[#D52B1E]"
                    >
                      <option value="">Select a course…</option>
                      {allCourses.map((c) => (
                        <option key={String(c.id)} value={String(c.id)}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <select
                      value={quizIdInput}
                      onChange={(e) => setQuizIdInput(e.target.value)}
                      disabled={!addQCourseId || courseForQuizzes.isLoading}
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 focus:border-[#D52B1E] disabled:opacity-50"
                    >
                      <option value="">
                        {!addQCourseId
                          ? "Select a course first"
                          : courseForQuizzes.isLoading
                            ? "Loading quizzes…"
                            : courseQuizList.length === 0
                              ? "No quizzes found for this course"
                              : "Select a quiz…"}
                      </option>
                      {courseQuizList.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Question text"
                      value={questionTextInput}
                      onChange={(e) => setQuestionTextInput(e.target.value)}
                    />
                    <select
                      value={questionTypeInput}
                      onChange={(e) => setQuestionTypeInput(e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 focus:border-[#D52B1E]"
                    >
                      {quizTypesQuery.data && quizTypesQuery.data.length > 0 ? (
                        quizTypesQuery.data.map((qt) => (
                          <option key={String(qt.id)} value={qt.name}>
                            {qt.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="mcq">MCQ</option>
                          <option value="true_false">True / False</option>
                          <option value="short_answer">Short Answer</option>
                        </>
                      )}
                    </select>
                    <Button
                      onClick={async () => {
                        if (!quizIdInput || !questionTextInput.trim()) return;
                        await addQuestionMutation.mutateAsync({
                          quizId: quizIdInput,
                          payload: {
                            text: questionTextInput.trim(),
                            type: questionTypeInput,
                            points: 1,
                          },
                        });
                        setQuestionTextInput("");
                      }}
                      disabled={addQuestionMutation.isPending}
                    >
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Add Option to Question
                    </p>
                    <select
                      value={questionIdInput}
                      onChange={(e) => setQuestionIdInput(e.target.value)}
                      disabled={!quizIdInput || quizDetailsQuery.isLoading}
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30 focus:border-[#D52B1E] disabled:opacity-50"
                    >
                      <option value="">
                        {!quizIdInput
                          ? "Select a quiz first (in Add Question panel)"
                          : quizDetailsQuery.isLoading
                            ? "Loading questions…"
                            : (quizDetailsQuery.data?.questions?.length ??
                                  0) === 0
                              ? "No questions found"
                              : "Select a question…"}
                      </option>
                      {(quizDetailsQuery.data?.questions ?? []).map((q) => (
                        <option
                          key={String(q.id ?? "")}
                          value={String(q.id ?? "")}
                        >
                          {String(q.text ?? "Unnamed question")}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Option text"
                      value={optionTextInput}
                      onChange={(e) => setOptionTextInput(e.target.value)}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOptionCorrectInput((v) => !v)}
                      onKeyDown={(e) =>
                        (e.key === " " || e.key === "Enter") &&
                        setOptionCorrectInput((v) => !v)
                      }
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                    >
                      <span className="text-sm text-gray-700">
                        Correct option
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={optionCorrectInput}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          optionCorrectInput ? "bg-[#D52B1E]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                            optionCorrectInput
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!questionIdInput || !optionTextInput.trim()) return;
                        await addOptionMutation.mutateAsync({
                          questionId: questionIdInput,
                          payload: {
                            text: optionTextInput.trim(),
                            isCorrect: optionCorrectInput,
                          },
                        });
                        setOptionTextInput("");
                      }}
                      disabled={addOptionMutation.isPending}
                    >
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Quiz Details Inspector
                    </p>
                    <p className="text-xs text-gray-500">
                      Select a quiz in the "Add Question" panel to inspect its
                      questions and options.
                    </p>
                    <div className="text-xs rounded-lg bg-gray-50 p-3 border border-gray-100">
                      {quizIdInput
                        ? quizDetailsQuery.isLoading
                          ? "Loading quiz details..."
                          : quizDetailsQuery.data
                            ? `Quiz: ${quizDetailsQuery.data.title} | Questions: ${quizDetailsQuery.data.questions?.length ?? 0}`
                            : "Quiz not found or unavailable"
                        : "Select a quiz above to inspect details"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      <Dialog
        open={viewingCourse !== null}
        onClose={() => setViewingCourse(null)}
        title={viewingCourse?.title ?? "Course details"}
        maxWidth="max-w-3xl"
      >
        {viewingCourse && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Slug</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{viewingCourse.slug || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Status</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{viewingCourse.status || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Category</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.programme?.title || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Instructor</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.educator?.name || "-"}</p>
              {viewingCourse.educator?.email && (
                <p className="text-xs text-gray-500 mt-0.5">{viewingCourse.educator.email}</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Level</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{viewingCourse.level || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Language</p>
              <p className="text-sm font-semibold text-gray-800 uppercase">{viewingCourse.language || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Price</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.isFree ? "Free" : `$${viewingCourse.priceUsd} USD`}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Enrollments</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.enrolledCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Lessons</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.lessonCount ?? viewingCourse.videoCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Duration</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.totalDurationMinutes ?? 0} minutes</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Shariah Compliant</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.shariahCompliant ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Certificate Issued</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.certificateIssued ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wider text-gray-400">Description</p>
              <p className="text-sm text-gray-700 mt-1">{viewingCourse.description || "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Published At</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.publishedAt ? new Date(viewingCourse.publishedAt).toLocaleString() : "-"}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Updated At</p>
              <p className="text-sm font-semibold text-gray-800">{viewingCourse.updatedAt ? new Date(viewingCourse.updatedAt).toLocaleString() : "-"}</p>
            </div>
          </div>
        )}
      </Dialog>

      {/* Create/Edit Course Modal */}
      {(showCreateModal || editingCourse) &&
        (() => {
          const inputCls =
            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#D52B1E] focus:outline-none focus:ring-1 focus:ring-[#D52B1E] placeholder:text-gray-400";
          const labelCls =
            "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5";
          const closeModal = () => {
            setShowCreateModal(false);
            setEditingCourse(null);
            setCourseForm(emptyAcademyCourse);
            setAssignInstructorId("");
          };
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingCourse ? "Edit Course" : "Create New Course"}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {editingCourse
                        ? "Update the course details below"
                        : "Fill in the details to create a course"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className={labelCls}>Course Title *</label>
                    <input
                      className={inputCls}
                      value={courseForm.title}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, title: e.target.value })
                      }
                      placeholder="e.g. Islamic Finance Foundations"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Subtitle</label>
                    <input
                      className={inputCls}
                      value={courseForm.subtitle ?? ""}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Brief tagline that sells the course"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={courseForm.description ?? ""}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="What will students learn in this course?"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      {editingCourse ? "Change Instructor" : "Assign Instructor"}
                    </label>
                    <select
                      className={inputCls}
                      value={assignInstructorId}
                      onChange={(e) => setAssignInstructorId(e.target.value)}
                    >
                      <option value="">
                        {instructorsQuery.isLoading
                          ? "Loading instructors…"
                          : "— Select an instructor —"}
                      </option>
                      {(instructorsQuery.data ?? []).map((u) => {
                        const fullName = [u.firstName, u.lastName]
                          .filter(Boolean)
                          .join(" ")
                          .trim();
                        const label =
                          fullName || u.username || u.email || "Instructor";
                        return (
                          <option key={u.id} value={u.id}>
                            {u.email ? `${label} (${u.email})` : label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      className={inputCls}
                      value={courseForm.categoryId ?? ""}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        {categoryTypesQuery.isLoading
                          ? "Loading categories…"
                          : "— Select a category —"}
                      </option>
                      {categoryTypesQuery.data?.map((cat) => (
                        <option key={String(cat.id)} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Level *</label>
                      <select
                        className={inputCls}
                        value={courseForm.level}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            level: e.target.value as
                              | "beginner"
                              | "intermediate"
                              | "advanced",
                          })
                        }
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
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
                          setCourseForm({
                            ...courseForm,
                            price: Number(e.target.value),
                            isFree: Number(e.target.value) === 0,
                          })
                        }
                        placeholder="49.99"
                      />
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setCourseForm({
                        ...courseForm,
                        isFree: !courseForm.isFree,
                        price: !courseForm.isFree ? 0 : courseForm.price,
                      })
                    }
                    onKeyDown={(e) =>
                      (e.key === " " || e.key === "Enter") &&
                      setCourseForm({
                        ...courseForm,
                        isFree: !courseForm.isFree,
                        price: !courseForm.isFree ? 0 : courseForm.price,
                      })
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
                        setCourseForm({ ...courseForm, thumbnailUrl: url })
                      }
                      previewHeight="h-32"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button
                      onClick={
                        editingCourse ? handleUpdateCourse : handleCreateCourse
                      }
                      disabled={
                        !courseForm.title.trim() ||
                        (editingCourse
                          ? updateCourseMutation.isPending
                          : adminCreateCourseMutation.isPending)
                      }
                      className="bg-[#D52B1E] hover:bg-[#b82319] text-white gap-2"
                    >
                      {(
                        editingCourse
                          ? updateCourseMutation.isPending
                          : adminCreateCourseMutation.isPending
                      ) ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {editingCourse ? "Updating…" : "Creating…"}
                        </>
                      ) : (
                        <>
                          {editingCourse ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {editingCourse ? "Update Course" : "Create Course"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
    </motion.div>
  );
}