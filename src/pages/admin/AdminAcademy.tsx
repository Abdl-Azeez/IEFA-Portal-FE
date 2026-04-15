import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  useAcademyCourses,
  useInstructorAcademyCourses,
  useInstructorCreateCourse,
  useInstructorUpdateCourse,
  useInstructorSuspendCourse,
} from "@/hooks/useAcademy";
import type {
  AcademyCourseDetailsDto,
  AcademyInstructorCourseDto,
  AcademyInstructorCreateCourseDto,
  AcademyInstructorCourseUpdateDto,
} from "@/types/learning";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { y: 12, opacity: 0 }, show: { y: 0, opacity: 1 } };

type Tab = "courses" | "analytics" | "enrollments" | "content";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "courses", label: "Academy Courses", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "content", label: "Content Management", icon: FileText },
];

const VALID_TABS = new Set<Tab>(["courses", "analytics", "enrollments", "content"]);

const emptyAcademyCourse: AcademyInstructorCreateCourseDto = {
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

export default function AdminAcademy() { // NOSONAR
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AcademyInstructorCourseDto | null>(null);
  const [courseForm, setCourseForm] = useState<AcademyInstructorCreateCourseDto>(emptyAcademyCourse);

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
  const { data: academyCourses = [], isLoading: coursesLoading } = useAcademyCourses();
  const { data: instructorCourses = [], isLoading: instructorCoursesLoading } = useInstructorAcademyCourses();
  const createCourseMutation = useInstructorCreateCourse();
  const updateCourseMutation = useInstructorUpdateCourse();
  const suspendCourseMutation = useInstructorSuspendCourse();

  // Combined courses for admin view
  const allCourses = useMemo(() => {
    const courseMap = new Map<string, AcademyCourseDetailsDto | AcademyInstructorCourseDto>();

    // Add public academy courses
    if (academyCourses) {
      academyCourses.forEach((course: AcademyCourseDetailsDto) => courseMap.set(String(course.id), course));
    }

    // Add instructor courses (may include unpublished ones)
    if (instructorCourses) {
      instructorCourses.forEach((course: AcademyInstructorCourseDto) => courseMap.set(String(course.id), course));
    }

    return Array.from(courseMap.values());
  }, [academyCourses, instructorCourses]);

  // Filtered courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return allCourses;
    const query = searchQuery.toLowerCase();
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.level?.toLowerCase().includes(query)
    );
  }, [allCourses, searchQuery]);

  // Handle course creation
  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) {
      toast({ title: "Error", description: "Course title is required", variant: "destructive" });
      return;
    }

    try {
      const slug = courseForm.title
        .trim()
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/(^-|-$)/g, "");

      await createCourseMutation.mutateAsync({
        ...courseForm,
        slug,
        educatorId: courseForm.educatorId || "admin", // Default to admin for now
      });

      setShowCreateModal(false);
      setCourseForm(emptyAcademyCourse);
      toast({ title: "Success", description: "Course created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    }
  };

  // Handle course update
  const handleUpdateCourse = async () => {
    if (!editingCourse || !courseForm.title.trim()) return;

    try {
      await updateCourseMutation.mutateAsync({
        id: editingCourse.id,
        payload: courseForm as AcademyInstructorCourseUpdateDto,
      });

      setEditingCourse(null);
      setCourseForm(emptyAcademyCourse);
      toast({ title: "Success", description: "Course updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
    }
  };

  // Handle course suspension
  const handleSuspendCourse = async (courseId: string | number) => {
    try {
      await suspendCourseMutation.mutateAsync(courseId);
      toast({ title: "Success", description: "Course suspended successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to suspend course", variant: "destructive" });
    }
  };

  // Open edit modal
  const handleEditCourse = (course: AcademyInstructorCourseDto) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug || "",
      description: course.description || "",
      coverImageUrl: course.coverImageUrl || "",
      previewVideoUrl: course.previewVideoUrl || null,
      educatorId: course.educatorId?.toString() || "",
      programmeId: course.programmeId || null,
      level: course.level || "beginner",
      priceUsd: course.priceUsd || 0,
      isFree: course.isFree || false,
      status: course.status || "draft",
      tags: course.tags || [],
    });
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalCourses = allCourses.length;
    const publishedCourses = allCourses.filter(c => c.status === "published").length;
    const totalEnrollments = allCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const totalRevenue = allCourses.reduce((sum, c) => sum + ((c.priceUsd || 0) * (c.enrolledCount || 0)), 0);

    return { totalCourses, publishedCourses, totalEnrollments, totalRevenue };
  }, [allCourses]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academy Management</h1>
          <p className="text-sm text-gray-600">Manage academy courses, enrollments, and analytics</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "#3b82f6" },
          { label: "Published", value: stats.publishedCourses, icon: Eye, color: "#10b981" },
          { label: "Enrollments", value: stats.totalEnrollments, icon: Users, color: "#f59e0b" },
          { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: CreditCard, color: "#ef4444" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

            {/* Courses Grid */}
            {coursesLoading || instructorCoursesLoading ? (
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
                description={searchQuery ? "Try adjusting your search terms" : "Create your first academy course"}
                icon={BookOpen}
              />
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Level</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Enrolled</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredCourses.map((course) => (
                      <tr key={String(course.id)} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{course.description || "No description"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600 capitalize">{course.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">{course.enrolledCount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-semibold text-gray-900">{course.isFree ? "Free" : `$${course.priceUsd}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm">
                          <Badge variant={course.status === "published" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium text-gray-900">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course as AcademyInstructorCourseDto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspendCourse(course.id)}
                              disabled={suspendCourseMutation.isPending}
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
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academy Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "enrollments" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Management</CardTitle>
                <CardDescription>Manage student enrollments and access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Enrollment management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage course content, sections, and lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Content management interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Course Modal */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCourse(null);
                  setCourseForm(emptyAcademyCourse);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Course description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <Input
                    type="number"
                    value={courseForm.priceUsd}
                    onChange={(e) => setCourseForm({
                      ...courseForm,
                      priceUsd: Number(e.target.value),
                      isFree: Number(e.target.value) === 0
                    })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCourse(null);
                  setCourseForm(emptyAcademyCourse);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}