import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CreditCard,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  useAdminCreateCourse,
  useCreateLearningCourse,
  useCreateLearningLesson,
  useCreateLearningSection,
  useDeleteLearningCourse,
  useDeleteLearningLesson,
  useDeleteLearningSection,
  useEnrollOnboarding,
  useLearningCourseById,
  useLearningCourseContent,
  useLearningCourseStudents,
  useLearningCourses,
  useLearningLessonById,
  useLearningMyCourseProgress,
  useLearningSectionContent,
  useLearningStudentProgress,
  useUpdateLearningCourse,
  useUpdateLearningLesson,
  useUpdateLearningSection,
} from "@/hooks/useLearning";
import type { AdminCreateCourseDto, UpdateCourseDto } from "@/types/learning";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } };

type Tab =
  | "courses"
  | "educators"
  | "videos"
  | "programmes"
  | "certificates"
  | "payments"
  | "paths"
  | "assessments"
  | "results";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "educators", label: "Educators", icon: UserCheck },
  { id: "videos", label: "Course Videos", icon: Video },
  { id: "programmes", label: "Programmes", icon: Award },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "paths", label: "Learning Paths", icon: TrendingUp },
  { id: "assessments", label: "Assessments", icon: FileText },
  { id: "results", label: "Results", icon: BarChart3 },
];

const VALID_TABS = new Set<Tab>([
  "courses",
  "educators",
  "videos",
  "programmes",
  "certificates",
  "payments",
  "paths",
  "assessments",
  "results",
]);

const emptyAdminCourse: AdminCreateCourseDto = {
  title: "",
  slug: "",
  description: "",
  coverImageUrl: "",
  previewVideoUrl: null,
  educatorId: "",
  programmeId: null,
  level: "beginner",
  priceUsd: 0,
  isFree: false,
  status: "draft",
  tags: [],
};

function toNumber(value: string): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function UnsupportedTabNotice({ label }: { readonly label: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <EmptyState
          icon={AlertCircle}
          title={`${label} API not in current contract`}
          description="This admin view is intentionally left as a placeholder until the backend endpoint is added to the API doc."
        />
      </CardContent>
    </Card>
  );
}

export default function AdminLearning() { // NOSONAR
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [newCourse, setNewCourse] = useState<AdminCreateCourseDto>(emptyAdminCourse);
  const [newCourseTags, setNewCourseTags] = useState<string[]>([]);
  const [newCourseTagInput, setNewCourseTagInput] = useState("");

  const [updateCourseId, setUpdateCourseId] = useState("");
  const [updateCourseTitle, setUpdateCourseTitle] = useState("");
  const [updateCourseSlug, setUpdateCourseSlug] = useState("");
  const [updateCourseDescription, setUpdateCourseDescription] = useState("");
  const [updateCourseEducatorId, setUpdateCourseEducatorId] = useState("");
  const [updateCourseLevel, setUpdateCourseLevel] = useState("");
  const [updateCoursePrice, setUpdateCoursePrice] = useState("");
  const [updateCourseCoverImageUrl, setUpdateCourseCoverImageUrl] = useState("");
  const [updateCoursePreviewVideoUrl, setUpdateCoursePreviewVideoUrl] = useState("");
  const [updateCourseProgrammeId, setUpdateCourseProgrammeId] = useState("");
  const [updateCourseIsFree, setUpdateCourseIsFree] = useState(false);
  const [updateCourseStatus, setUpdateCourseStatus] = useState<"draft" | "publish">("draft");
  const [updateCourseTags, setUpdateCourseTags] = useState<string[]>([]);
  const [updateCourseTagInput, setUpdateCourseTagInput] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseByIdInput, setCourseByIdInput] = useState("");
  const [myProgressCourseIdInput, setMyProgressCourseIdInput] = useState("");

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionParentId, setSectionParentId] = useState("");
  const [sectionOrder, setSectionOrder] = useState("");
  const [updateSectionId, setUpdateSectionId] = useState("");
  const [updateSectionTitle, setUpdateSectionTitle] = useState("");
  const [updateSectionOrder, setUpdateSectionOrder] = useState("");
  const [deleteSectionId, setDeleteSectionId] = useState("");

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonParentId, setLessonParentId] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [updateLessonId, setUpdateLessonId] = useState("");
  const [updateLessonTitle, setUpdateLessonTitle] = useState("");
  const [updateLessonContent, setUpdateLessonContent] = useState("");
  const [updateLessonOrder, setUpdateLessonOrder] = useState("");
  const [deleteLessonId, setDeleteLessonId] = useState("");

  const pathSegment = location.pathname.split("/").pop() as Tab;
  const activeTab: Tab = VALID_TABS.has(pathSegment) ? pathSegment : "courses";

  useEffect(() => {
    setSearch("");
    setPage(1);
  }, [activeTab]);

  const coursesQuery = useLearningCourses({ page, perPage: 12, search: search || undefined });
  const selectedCourseNum = toNumber(selectedCourseId);
  const selectedSectionNum = toNumber(selectedSectionId);
  const selectedLessonNum = toNumber(selectedLessonId);

  const courseContentQuery = useLearningCourseContent(selectedCourseNum);
  const courseStudentsQuery = useLearningCourseStudents(selectedCourseNum);
  const sectionContentQuery = useLearningSectionContent(selectedSectionNum);
  const lessonQuery = useLearningLessonById(selectedLessonNum);
  const studentProgressQuery = useLearningStudentProgress(selectedCourseNum, studentId || undefined);
  const courseByIdQuery = useLearningCourseById(toNumber(courseByIdInput));
  const myCourseProgressQuery = useLearningMyCourseProgress(toNumber(myProgressCourseIdInput));

  const createCourseMutation = useAdminCreateCourse();
  const createCourseViaLearningMutation = useCreateLearningCourse();
  const updateCourseMutation = useUpdateLearningCourse();
  const deleteCourseMutation = useDeleteLearningCourse();
  const enrollOnboardingMutation = useEnrollOnboarding();
  const createSectionMutation = useCreateLearningSection();
  const updateSectionMutation = useUpdateLearningSection();
  const deleteSectionMutation = useDeleteLearningSection();
  const createLessonMutation = useCreateLearningLesson();
  const updateLessonMutation = useUpdateLearningLesson();
  const deleteLessonMutation = useDeleteLearningLesson();

  const courseData = coursesQuery.data?.data ?? [];
  const pageMeta = coursesQuery.data?.meta;
  const hasNext = pageMeta?.hasNextPage ?? false;
  const hasPrev = pageMeta?.hasPreviousPage ?? page > 1;

  const stats = useMemo(() => {
    const total = pageMeta?.itemCount ?? courseData.length;
    const active = courseData.filter((course) => course.status === "active").length;
    const free = courseData.filter((course) => course.isFree).length;
    const paid = courseData.filter((course) => !course.isFree).length;
    return { total, active, free, paid };
  }, [courseData, pageMeta?.itemCount]);

  function handleSetTab(tab: Tab) {
    navigate(`/admin/learning/${tab}`);
  }

  async function handleCreateCourse() {
    if (!newCourse.title || !newCourse.slug || !newCourse.description || !newCourse.educatorId) {
      toast.error("Title, slug, description and educatorId are required.");
      return;
    }

    if (newCourseTags.length === 0) {
      toast.error("Add at least one tag.");
      return;
    }

    await createCourseMutation.mutateAsync({
      ...newCourse,
      tags: newCourseTags,
      coverImageUrl: newCourse.coverImageUrl?.trim() || undefined,
      previewVideoUrl: newCourse.previewVideoUrl?.trim() || null,
      programmeId: newCourse.programmeId?.trim() || null,
    });

    toast.success("Course created successfully.");
    setNewCourse(emptyAdminCourse);
    setNewCourseTags([]);
    setNewCourseTagInput("");
  }

  async function handleCreateCourseViaLearning() {
    if (!newCourse.title || !newCourse.slug || !newCourse.description || !newCourse.educatorId) {
      toast.error("Title, slug, description and educatorId are required.");
      return;
    }

    if (newCourseTags.length === 0) {
      toast.error("Add at least one tag.");
      return;
    }

    await createCourseViaLearningMutation.mutateAsync({
      ...newCourse,
      tags: newCourseTags,
      coverImageUrl: newCourse.coverImageUrl?.trim() || undefined,
      previewVideoUrl: newCourse.previewVideoUrl?.trim() || null,
      programmeId: newCourse.programmeId?.trim() || null,
    });

    toast.success("Course created via /learning/courses.");
    setNewCourse(emptyAdminCourse);
    setNewCourseTags([]);
    setNewCourseTagInput("");
  }

  async function handleUpdateCourse() {
    const id = toNumber(updateCourseId);
    if (!id) {
      toast.error("Enter a valid course id.");
      return;
    }

    const payload: UpdateCourseDto = { status: updateCourseStatus, isFree: updateCourseIsFree };
    if (updateCourseTitle.trim()) payload.title = updateCourseTitle.trim();
    if (updateCourseSlug.trim()) payload.slug = updateCourseSlug.trim();
    if (updateCourseDescription.trim()) payload.description = updateCourseDescription.trim();
    if (updateCourseEducatorId.trim()) payload.educatorId = updateCourseEducatorId.trim();
    if (updateCourseLevel.trim()) payload.level = updateCourseLevel.trim();
    const parsedPrice = toNumber(updateCoursePrice);
    if (parsedPrice !== undefined) payload.priceUsd = parsedPrice;
    if (updateCourseCoverImageUrl.trim()) payload.coverImageUrl = updateCourseCoverImageUrl.trim();
    if (updateCoursePreviewVideoUrl.trim()) payload.previewVideoUrl = updateCoursePreviewVideoUrl.trim();
    if (updateCourseProgrammeId.trim()) payload.programmeId = updateCourseProgrammeId.trim();
    if (updateCourseTags.length > 0) payload.tags = updateCourseTags;

    await updateCourseMutation.mutateAsync({ id, payload });
    toast.success("Course updated.");
  }

  function addCreateTag() {
    const nextTag = normalizeTag(newCourseTagInput);
    if (!nextTag) return;
    if (!newCourseTags.includes(nextTag)) {
      setNewCourseTags((prev) => [...prev, nextTag]);
    }
    setNewCourseTagInput("");
  }

  function addUpdateTag() {
    const nextTag = normalizeTag(updateCourseTagInput);
    if (!nextTag) return;
    if (!updateCourseTags.includes(nextTag)) {
      setUpdateCourseTags((prev) => [...prev, nextTag]);
    }
    setUpdateCourseTagInput("");
  }

  function removeCreateTag(tag: string) {
    setNewCourseTags((prev) => prev.filter((value) => value !== tag));
  }

  function removeUpdateTag(tag: string) {
    setUpdateCourseTags((prev) => prev.filter((value) => value !== tag));
  }

  function onCreateTagInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    addCreateTag();
  }

  function onUpdateTagInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    addUpdateTag();
  }

  async function handleCreateSection() {
    const parent_id = toNumber(sectionParentId);
    if (!sectionTitle.trim() || !parent_id) {
      toast.error("Section title and parent course id are required.");
      return;
    }

    await createSectionMutation.mutateAsync({
      title: sectionTitle.trim(),
      parent_id,
      order: toNumber(sectionOrder),
    });

    toast.success("Section created.");
    setSectionTitle("");
    setSectionOrder("");
  }

  async function handleUpdateSection() {
    const id = toNumber(updateSectionId);
    if (!id) {
      toast.error("Enter a valid section id.");
      return;
    }

    await updateSectionMutation.mutateAsync({
      id,
      payload: {
        title: updateSectionTitle.trim() || undefined,
        order: toNumber(updateSectionOrder),
      },
    });

    toast.success("Section updated.");
  }

  async function handleDeleteSection() {
    const id = toNumber(deleteSectionId);
    if (!id) {
      toast.error("Enter a valid section id.");
      return;
    }

    await deleteSectionMutation.mutateAsync(id);
    toast.success("Section deleted.");
  }

  async function handleCreateLesson() {
    const parent_id = toNumber(lessonParentId);
    if (!lessonTitle.trim() || !parent_id) {
      toast.error("Lesson title and parent section id are required.");
      return;
    }

    await createLessonMutation.mutateAsync({
      title: lessonTitle.trim(),
      parent_id,
      content: lessonContent || undefined,
      order: toNumber(lessonOrder),
    });

    toast.success("Lesson created.");
    setLessonTitle("");
    setLessonContent("");
    setLessonOrder("");
  }

  async function handleUpdateLesson() {
    const id = toNumber(updateLessonId);
    if (!id) {
      toast.error("Enter a valid lesson id.");
      return;
    }

    await updateLessonMutation.mutateAsync({
      id,
      payload: {
        title: updateLessonTitle.trim() || undefined,
        content: updateLessonContent.trim() || undefined,
        order: toNumber(updateLessonOrder),
      },
    });

    toast.success("Lesson updated.");
  }

  async function handleDeleteLesson() {
    const id = toNumber(deleteLessonId);
    if (!id) {
      toast.error("Enter a valid lesson id.");
      return;
    }

    await deleteLessonMutation.mutateAsync(id);
    toast.success("Lesson deleted.");
  }

  const isCoursesTab = activeTab === "courses";

  let courseRows: JSX.Element;
  if (coursesQuery.isLoading) {
    courseRows = <tr><td className="px-4 py-5 text-sm text-slate-500" colSpan={6}>Loading courses...</td></tr>;
  } else if (courseData.length === 0) {
    courseRows = <tr><td colSpan={6}><EmptyState title="No courses found" description="No records for this search." /></td></tr>;
  } else {
    courseRows = (
      <>
        {courseData.map((course) => (
          <tr key={course.id} className="border-t">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-800 line-clamp-1">{course.title}</p>
              <p className="text-xs text-slate-400">ID: {course.id}</p>
            </td>
            <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">{course.educator?.name ?? course.educatorId}</td>
            <td className="px-4 py-3 hidden md:table-cell text-xs">{course.isFree ? "Free" : `$${course.priceUsd}`}</td>
            <td className="px-4 py-3 hidden lg:table-cell text-xs">{course.enrolledCount}</td>
            <td className="px-4 py-3"><Badge variant="outline">{course.status}</Badge></td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"
                  onClick={() => {
                    if (deleteCourseMutation.isPending) return;
                    deleteCourseMutation.mutate(course.id, {
                      onSuccess: () => toast.success("Course deleted."),
                      onError: () => toast.error("Unable to delete course."),
                    });
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                  onClick={() => setSelectedCourseId(String(course.id))}
                  title="Load content"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600"
                  onClick={() => {
                    setUpdateCourseId(String(course.id));
                    setUpdateCourseTitle(course.title);
                    setUpdateCourseSlug(course.slug);
                    setUpdateCourseDescription(course.description);
                    setUpdateCourseEducatorId(course.educatorId);
                    setUpdateCourseLevel(course.level);
                    setUpdateCoursePrice(String(course.priceUsd));
                    setUpdateCourseCoverImageUrl(course.coverImageUrl ?? "");
                    setUpdateCoursePreviewVideoUrl(course.previewVideoUrl ?? "");
                    setUpdateCourseProgrammeId(course.programmeId ?? "");
                    setUpdateCourseIsFree(course.isFree);
                    setUpdateCourseStatus(course.status === "publish" ? "publish" : "draft");
                    setUpdateCourseTags(course.tags ?? []);
                    setUpdateCourseTagInput("");
                  }}
                  title="Prepare update"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  let courseContentBlock: JSX.Element;
  if (courseContentQuery.isLoading) {
    courseContentBlock = <p className="text-sm text-slate-500">Loading course content...</p>;
  } else if ((courseContentQuery.data?.length ?? 0) > 0) {
    courseContentBlock = (
      <div className="space-y-2">
        {courseContentQuery.data?.map((section) => (
          <div key={section.id} className="rounded border px-2 py-1">
            <p className="text-sm font-medium">{section.title}</p>
            <p className="text-xs text-slate-500">ID: {section.id} - Order: {section.order}</p>
          </div>
        ))}
      </div>
    );
  } else {
    courseContentBlock = <p className="text-sm text-slate-400">No course content loaded.</p>;
  }

  let sectionContentBlock: JSX.Element;
  if (sectionContentQuery.isLoading) {
    sectionContentBlock = <p className="text-sm text-slate-500">Loading section content...</p>;
  } else if ((sectionContentQuery.data?.length ?? 0) === 0) {
    sectionContentBlock = <p className="text-sm text-slate-400">No section content loaded.</p>;
  } else {
    sectionContentBlock = (
      <div className="space-y-2">
        {sectionContentQuery.data?.map((itemData) => (
          <div key={itemData.id} className="rounded border px-2 py-1">
            <p className="text-sm font-medium">{itemData.title}</p>
            <p className="text-xs text-slate-500">ID: {itemData.id} - Type: {itemData.type}</p>
          </div>
        ))}
      </div>
    );
  }

  let lessonBlock: JSX.Element;
  if (lessonQuery.isLoading) {
    lessonBlock = <p className="text-sm text-slate-500">Loading lesson...</p>;
  } else if (lessonQuery.data) {
    lessonBlock = (
      <div className="space-y-1">
        <p className="text-sm font-medium">{lessonQuery.data.title}</p>
        <p className="text-xs text-slate-500">Course ID: {lessonQuery.data.courseId}</p>
        <p className="text-xs text-slate-500">Duration: {lessonQuery.data.durationSeconds}s</p>
        <p className="text-xs text-slate-500">Status: {lessonQuery.data.status}</p>
      </div>
    );
  } else {
    lessonBlock = <p className="text-sm text-slate-400">No lesson loaded.</p>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learning Management</h1>
          <p className="text-slate-500 text-sm">Integrated with currently documented Learning and Admin endpoints only.</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={() => navigate("/admin/learning/courses")}>
          <Plus className="h-3.5 w-3.5" /> Add New
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-[#D52B1E]">{stats.total}</p><p className="text-xs text-slate-500">Total Courses</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-slate-500">Active on Page</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-blue-600">{stats.free}</p><p className="text-xs text-slate-500">Free on Page</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-amber-600">{stats.paid}</p><p className="text-xs text-slate-500">Paid on Page</p></CardContent></Card>
      </motion.div>

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSetTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/5"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {isCoursesTab ? (
          <div className="space-y-6 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9 h-9" />
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Educator</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Price</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Enrolled</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>{courseRows}</tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" disabled={!hasPrev} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
              <p className="text-xs text-slate-500">Page {pageMeta?.page ?? page}</p>
              <Button disabled={!hasNext} onClick={() => setPage((prev) => prev + 1)}>Next</Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create Course (POST /admin/courses)</CardTitle>
                  <CardDescription>Required fields are enforced from the API doc.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Input placeholder="Title" value={newCourse.title} onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))} />
                  <Input placeholder="Slug" value={newCourse.slug} onChange={(e) => setNewCourse((prev) => ({ ...prev, slug: e.target.value }))} />
                  <Input placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))} />
                  <Input placeholder="Educator ID" value={newCourse.educatorId} onChange={(e) => setNewCourse((prev) => ({ ...prev, educatorId: e.target.value }))} />
                  <Input placeholder="Programme ID (optional)" value={newCourse.programmeId ?? ""} onChange={(e) => setNewCourse((prev) => ({ ...prev, programmeId: e.target.value }))} />
                  <Input placeholder="Level (e.g. beginner)" value={newCourse.level} onChange={(e) => setNewCourse((prev) => ({ ...prev, level: e.target.value }))} />
                  <Input placeholder="Price USD" value={String(newCourse.priceUsd)} onChange={(e) => setNewCourse((prev) => ({ ...prev, priceUsd: Number(e.target.value) || 0 }))} />
                  <Input placeholder="Cover image URL (optional)" value={newCourse.coverImageUrl ?? ""} onChange={(e) => setNewCourse((prev) => ({ ...prev, coverImageUrl: e.target.value }))} />
                  <Input placeholder="Preview video URL (optional)" value={newCourse.previewVideoUrl ?? ""} onChange={(e) => setNewCourse((prev) => ({ ...prev, previewVideoUrl: e.target.value }))} />
                  <div className="space-y-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={newCourseTagInput}
                      onChange={(e) => setNewCourseTagInput(e.target.value)}
                      onKeyDown={onCreateTagInputKeyDown}
                    />
                    <div className="flex flex-wrap gap-2">
                      {newCourseTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            className="inline-flex"
                            onClick={() => removeCreateTag(tag)}
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant={newCourse.status === "draft" ? "default" : "outline"} onClick={() => setNewCourse((prev) => ({ ...prev, status: "draft" }))}>Draft</Button>
                    <Button size="sm" variant={newCourse.status === "publish" ? "default" : "outline"} onClick={() => setNewCourse((prev) => ({ ...prev, status: "publish" }))}>Publish</Button>
                    <Button size="sm" variant={newCourse.isFree ? "default" : "outline"} onClick={() => setNewCourse((prev) => ({ ...prev, isFree: !prev.isFree }))}>{newCourse.isFree ? "Free" : "Paid"}</Button>
                    <Button size="sm" className="ml-auto" onClick={() => void handleCreateCourse()} disabled={createCourseMutation.isPending}>Create via Admin</Button>
                    <Button size="sm" variant="outline" onClick={() => void handleCreateCourseViaLearning()} disabled={createCourseViaLearningMutation.isPending}>Create via Learning</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Update Course (PATCH /learning/courses/{id})</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Input placeholder="Course ID" value={updateCourseId} onChange={(e) => setUpdateCourseId(e.target.value)} />
                  <Input placeholder="Title (optional)" value={updateCourseTitle} onChange={(e) => setUpdateCourseTitle(e.target.value)} />
                  <Input placeholder="Slug (optional)" value={updateCourseSlug} onChange={(e) => setUpdateCourseSlug(e.target.value)} />
                  <Input placeholder="Description (optional)" value={updateCourseDescription} onChange={(e) => setUpdateCourseDescription(e.target.value)} />
                  <Input placeholder="Educator ID (optional)" value={updateCourseEducatorId} onChange={(e) => setUpdateCourseEducatorId(e.target.value)} />
                  <Input placeholder="Programme ID (optional)" value={updateCourseProgrammeId} onChange={(e) => setUpdateCourseProgrammeId(e.target.value)} />
                  <Input placeholder="Level (optional)" value={updateCourseLevel} onChange={(e) => setUpdateCourseLevel(e.target.value)} />
                  <Input placeholder="Price USD (optional)" value={updateCoursePrice} onChange={(e) => setUpdateCoursePrice(e.target.value)} />
                  <Input placeholder="Cover image URL (optional)" value={updateCourseCoverImageUrl} onChange={(e) => setUpdateCourseCoverImageUrl(e.target.value)} />
                  <Input placeholder="Preview video URL (optional)" value={updateCoursePreviewVideoUrl} onChange={(e) => setUpdateCoursePreviewVideoUrl(e.target.value)} />
                  <div className="space-y-2">
                    <Input
                      placeholder="Add update tag and press Enter"
                      value={updateCourseTagInput}
                      onChange={(e) => setUpdateCourseTagInput(e.target.value)}
                      onKeyDown={onUpdateTagInputKeyDown}
                    />
                    <div className="flex flex-wrap gap-2">
                      {updateCourseTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            className="inline-flex"
                            onClick={() => removeUpdateTag(tag)}
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={updateCourseStatus === "draft" ? "default" : "outline"} onClick={() => setUpdateCourseStatus("draft")}>Draft</Button>
                    <Button size="sm" variant={updateCourseStatus === "publish" ? "default" : "outline"} onClick={() => setUpdateCourseStatus("publish")}>Publish</Button>
                    <Button size="sm" variant={updateCourseIsFree ? "default" : "outline"} onClick={() => setUpdateCourseIsFree((prev) => !prev)}>{updateCourseIsFree ? "Free" : "Paid"}</Button>
                    <Button size="sm" className="ml-auto" onClick={() => void handleUpdateCourse()} disabled={updateCourseMutation.isPending}>Update</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sections Management</CardTitle>
                  <CardDescription>Create, update and delete sections with available endpoints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Input placeholder="Create section: title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} />
                    <Input placeholder="Parent course ID" value={sectionParentId} onChange={(e) => setSectionParentId(e.target.value)} />
                    <Input placeholder="Order (optional)" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)} />
                    <Button size="sm" onClick={() => void handleCreateSection()} disabled={createSectionMutation.isPending}>Create Section</Button>
                  </div>
                  <div className="grid gap-2 border-t pt-3">
                    <Input placeholder="Update section ID" value={updateSectionId} onChange={(e) => setUpdateSectionId(e.target.value)} />
                    <Input placeholder="Update title" value={updateSectionTitle} onChange={(e) => setUpdateSectionTitle(e.target.value)} />
                    <Input placeholder="Update order" value={updateSectionOrder} onChange={(e) => setUpdateSectionOrder(e.target.value)} />
                    <Button size="sm" variant="outline" onClick={() => void handleUpdateSection()} disabled={updateSectionMutation.isPending}>Update Section</Button>
                  </div>
                  <div className="flex gap-2 border-t pt-3">
                    <Input placeholder="Delete section ID" value={deleteSectionId} onChange={(e) => setDeleteSectionId(e.target.value)} />
                    <Button size="sm" variant="destructive" onClick={() => void handleDeleteSection()} disabled={deleteSectionMutation.isPending}>Delete</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lessons Management</CardTitle>
                  <CardDescription>Create, update and delete lessons with available endpoints.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Input placeholder="Create lesson: title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                    <Input placeholder="Parent section ID" value={lessonParentId} onChange={(e) => setLessonParentId(e.target.value)} />
                    <Input placeholder="Order (optional)" value={lessonOrder} onChange={(e) => setLessonOrder(e.target.value)} />
                    <Input placeholder="Content (optional)" value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} />
                    <Button size="sm" onClick={() => void handleCreateLesson()} disabled={createLessonMutation.isPending}>Create Lesson</Button>
                  </div>
                  <div className="grid gap-2 border-t pt-3">
                    <Input placeholder="Update lesson ID" value={updateLessonId} onChange={(e) => setUpdateLessonId(e.target.value)} />
                    <Input placeholder="Update title" value={updateLessonTitle} onChange={(e) => setUpdateLessonTitle(e.target.value)} />
                    <Input placeholder="Update content" value={updateLessonContent} onChange={(e) => setUpdateLessonContent(e.target.value)} />
                    <Input placeholder="Update order" value={updateLessonOrder} onChange={(e) => setUpdateLessonOrder(e.target.value)} />
                    <Button size="sm" variant="outline" onClick={() => void handleUpdateLesson()} disabled={updateLessonMutation.isPending}>Update Lesson</Button>
                  </div>
                  <div className="flex gap-2 border-t pt-3">
                    <Input placeholder="Delete lesson ID" value={deleteLessonId} onChange={(e) => setDeleteLessonId(e.target.value)} />
                    <Button size="sm" variant="destructive" onClick={() => void handleDeleteLesson()} disabled={deleteLessonMutation.isPending}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Content and Student Progress</CardTitle>
                <CardDescription>Read endpoints: course content, section content, lesson detail, course students, student progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-4">
                  <Input placeholder="Course ID" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} />
                  <Input placeholder="Section ID" value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} />
                  <Input placeholder="Lesson ID" value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} />
                  <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">GET /learning/courses/{`{id}`}/content</p>
                    {courseContentBlock}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">GET /learning/sections/{`{id}`}/content</p>
                    {sectionContentBlock}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">GET /learning/lessons/{`{id}`}</p>
                    {lessonBlock}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">Course students and student progress</p>
                    {courseStudentsQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Loading students...</p>
                    ) : (
                      <p className="text-xs text-slate-500">Students returned: {courseStudentsQuery.data?.length ?? 0}</p>
                    )}
                    {studentProgressQuery.data ? (
                      <pre className="mt-2 text-[11px] bg-slate-50 p-2 rounded overflow-auto max-h-44">{JSON.stringify(studentProgressQuery.data, null, 2)}</pre>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">Enter both course id and student id to load progress.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Learning Endpoints</CardTitle>
                <CardDescription>Direct test UI for course-by-id, my progress and onboarding enrollment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <Input
                    placeholder="Course ID for GET /learning/courses/{id}"
                    value={courseByIdInput}
                    onChange={(e) => setCourseByIdInput(e.target.value)}
                  />
                  <Input
                    placeholder="Course ID for GET /learning/my-courses/{id}/progress"
                    value={myProgressCourseIdInput}
                    onChange={(e) => setMyProgressCourseIdInput(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => enrollOnboardingMutation.mutate(undefined, {
                      onSuccess: () => toast.success("Onboarding enrollment created."),
                      onError: () => toast.error("Failed to enroll onboarding."),
                    })}
                    disabled={enrollOnboardingMutation.isPending}
                  >
                    POST /learning/onboarding/enroll
                  </Button>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">GET /learning/courses/{`{id}`}</p>
                    {courseByIdQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Loading course...</p>
                    ) : courseByIdQuery.data ? (
                      <pre className="text-[11px] bg-slate-50 p-2 rounded overflow-auto max-h-56">{JSON.stringify(courseByIdQuery.data, null, 2)}</pre>
                    ) : (
                      <p className="text-sm text-slate-400">Enter a course id to load details.</p>
                    )}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500 mb-2">GET /learning/my-courses/{`{id}`}/progress</p>
                    {myCourseProgressQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Loading progress...</p>
                    ) : myCourseProgressQuery.data ? (
                      <pre className="text-[11px] bg-slate-50 p-2 rounded overflow-auto max-h-56">{JSON.stringify(myCourseProgressQuery.data, null, 2)}</pre>
                    ) : (
                      <p className="text-sm text-slate-400">Enter an enrolled course id to load progress.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-4">
            <UnsupportedTabNotice label={TABS.find((tab) => tab.id === activeTab)?.label ?? "Selected"} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
