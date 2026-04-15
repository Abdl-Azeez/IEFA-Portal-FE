import api from "@/lib/api";
import type {
  AcademyCourseFilters,
  AcademyCategoryTypeDto,
  AcademyQuizTypeDto,
  AcademyCourseDetailsDto,
  AcademyCourseWithProgressDto,
  AcademyDashboardDto,
  AcademyQuizDto,
  AcademyLessonDto,
  AcademySectionDto,
  ProgrammeSummaryDto,
  AcademyInstructorCourseDto,
  AcademyInstructorCreateCourseDto,
  AcademyInstructorCreateSectionDto,
  AcademyInstructorCreateLessonDto,
  AcademyInstructorCreateQuizDto,
  AcademyInstructorUpdateQuizDto,
  AcademyInstructorUpdateQuestionDto,
  AcademyInstructorUpdateOptionDto,
  AcademyQuizAttemptDto,
  AcademyInstructorCourseUpdateDto,
  AcademyQuizDetailsDto,
  AcademySectionDetailsDto,
  AcademyLessonDetailsDto,
} from "@/types/learning";

interface AcademyCourseApiResponse {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  };
  categoryId: string;
  instructor: {
    id: string;
    userId: string;
    title: string;
    specialization: string;
    qualifications: string;
    bioLong: string;
    ratingAvg: string;
    totalStudents: number;
    isFeatured: boolean;
    approvedAt: string;
    approvedBy: string | null;
  };
  instructorId: string;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  price: string;
  currency: string;
  discountPrice: string | null;
  isFree: boolean;
  durationHours: string;
  status: string;
  isFeatured: boolean;
  shariahCompliant: boolean;
  certificateIssued: boolean;
  maxStudents: number | null;
  ratingAvg: string;
  totalEnrollments: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

function mapAcademyCourseApiResponse(course: AcademyCourseApiResponse): AcademyCourseDetailsDto {
  const durationMinutes = Number(course.durationHours) * 60 || 0;
  const instructorRating = Number(course.instructor.ratingAvg) || 0;
  const courseRating = Number(course.ratingAvg) || 0;

  return {
    id: Number(course.id) || 0,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverImageUrl: course.thumbnailUrl ?? "",
    previewVideoUrl: course.trailerUrl ?? null,
    educatorId: course.instructorId,
    educator: {
      id: course.instructor.userId,
      name: course.instructor.title,
      profilePhotoUrl: "",
      rating: instructorRating,
    },
    programmeId: course.categoryId,
    programme: {
      id: course.categoryId,
      title: course.category.name,
      level: course.level,
      totalDurationMinutes: durationMinutes,
    },
    moduleCount: 0,
    videoCount: 0,
    totalDurationMinutes: durationMinutes,
    enrolledCount: course.totalEnrollments,
    level: course.level,
    priceUsd: Number(course.price) || 0,
    isFree: course.isFree,
    rating: courseRating,
    reviewCount: 0,
    status: course.status,
    tags: [],
    publishedAt: course.publishedAt,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function getAcademyCourses(filters: AcademyCourseFilters = {}) {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  if (filters.search) params.search = filters.search;
  if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
  const response = await api.get<AcademyCourseApiResponse[]>("/academy/courses", { params });
  return response.data.map(mapAcademyCourseApiResponse);
}

export async function getAcademyCategoryTypes() {
  const response = await api.get<AcademyCategoryTypeDto[]>("/academy/category-types");
  return response.data;
}

export async function getAcademyQuizTypes() {
  const response = await api.get<AcademyQuizTypeDto[]>("/academy/quiz-types");
  return response.data;
}

export async function getAcademyCourseDetails(id: string | number) {
  const response = await api.get<AcademyCourseDetailsDto>(`/academy/courses/${id}`);
  return response.data;
}

export async function getAcademyCourseDetailsWithProgress(id: string | number) {
  const response = await api.get<AcademyCourseWithProgressDto>(`/academy/courses/${id}/with-progress`);
  return response.data;
}

export async function enrollInAcademyCourse(id: string | number) {
  const response = await api.post(`/academy/courses/${id}/enroll`);
  return response.data;
}

interface AcademyEnrollmentCourseApiResponse {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  categoryId: string;
  instructor: {
    id: string;
    userId: string;
    title: string;
    specialization: string;
    qualifications: string | null;
    bioLong: string;
    ratingAvg: string;
    totalStudents: number;
    isFeatured: boolean;
    approvedAt: string | null;
    approvedBy: string | null;
  };
  instructorId: string;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  price: string;
  currency: string;
  discountPrice: string | null;
  isFree: boolean;
  durationHours: string | null;
  status: string;
  isFeatured: boolean;
  shariahCompliant: boolean;
  certificateIssued: boolean;
  maxStudents: number | null;
  ratingAvg: string;
  totalEnrollments: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AcademyEnrollmentApiResponse {
  id: string;
  userId: string;
  course: AcademyEnrollmentCourseApiResponse;
  courseId: string;
  enrolledAt: string;
  expiresAt: string | null;
  completionPercent: string;
  completedAt: string | null;
  status: string;
  paymentId: string | null;
  currentCourseId?: string | number;
  itemType?: string;
  itemId?: string;
  programme?: Record<string, unknown> | null;
  lastActivityAt?: string | null;
  completedLessonIds?: Array<string | number>;
}

export async function getAcademyMyEnrollments() {
  const response = await api.get<AcademyEnrollmentApiResponse[]>("/academy/my-enrollments");

  return response.data.map((enrollment) => ({
    id: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    currentCourseId: enrollment.currentCourseId ?? enrollment.courseId,
    itemType: enrollment.itemType,
    itemId: enrollment.itemId,
    programme: enrollment.programme as ProgrammeSummaryDto | null,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    expiresAt: enrollment.expiresAt,
    lastActivityAt: enrollment.lastActivityAt ?? enrollment.enrolledAt,
    completedLessonIds: enrollment.completedLessonIds ?? [],
    progressPercent: Number(enrollment.completionPercent) || 0,
    completedAt: enrollment.completedAt,
    paymentId: enrollment.paymentId,
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      slug: enrollment.course.slug,
      thumbnailUrl: enrollment.course.thumbnailUrl,
      price: enrollment.course.price,
      currency: enrollment.course.currency,
    },
  }));
}

interface AcademyDashboardApiResponse {
  totalCourses: number;
  completedCourses: number;
  enrollments: Array<{
    id: string;
    courseId: string;
    title: string;
    thumbnailUrl: string | null;
    instructorName: string;
    progress: number;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
    hasCertificate: boolean;
  }>;
}

interface AcademyUpcomingActivitiesApiResponse {
  liveSessions: Array<{
    id: string;
    title: string;
    type?: string;
    scheduledAt?: string | null;
    courseId?: string | number;
  }>;
  pendingLessons: Array<{
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonType: string;
  }>;
}

export async function getAcademyDashboard() {
  const response = await api.get<AcademyDashboardApiResponse>("/academy/dashboard");
  const data = response.data;

  return {
    totalCourses: data.totalCourses,
    completedCourses: data.completedCourses,
    enrollments: data.enrollments,
  } as AcademyDashboardDto;
}

export async function getAcademyUpcomingActivities() {
  const response = await api.get<AcademyUpcomingActivitiesApiResponse>("/academy/upcoming-activities");
  const data = response.data;

  return [
    ...data.liveSessions.map((session) => ({
      id: session.id,
      title: session.title,
      type: session.type ?? "live_session",
      dueDate: session.scheduledAt ?? null,
      courseId: session.courseId,
    })),
    ...data.pendingLessons.map((lesson) => ({
      id: lesson.lessonId,
      title: lesson.lessonTitle,
      type: lesson.lessonType,
      dueDate: null,
      courseId: lesson.courseTitle, // using courseTitle as courseId for now
    }))
  ];
}

export async function completeAcademyLesson(id: string | number) {
  const response = await api.post(`/academy/lessons/${id}/complete`);
  return response.data;
}

export async function startAcademyQuiz(quizId: string | number) {
  const response = await api.post(`/academy/quizzes/${quizId}/start`);
  return response.data;
}

export async function submitAcademyAttempt(attemptId: string | number) {
  const response = await api.post(`/academy/attempts/${attemptId}/submit`);
  return response.data;
}

export async function getAcademyQuiz(quizId: string | number) {
  const response = await api.get<AcademyQuizDto>(`/academy/quizzes/${quizId}`);
  return response.data;
}

export async function getAcademyLesson(id: string | number) {
  const response = await api.get<AcademyLessonDto>(`/academy/lessons/${id}`);
  return response.data;
}

export async function getAcademySection(id: string | number) {
  const response = await api.get<AcademySectionDto>(`/academy/sections/${id}`);
  return response.data;
}

export async function instructorGetCourses() {
  const response = await api.get<AcademyInstructorCourseDto[]>("/instructor/academy/courses");
  return response.data;
}

export async function instructorCreateCourse(payload: AcademyInstructorCreateCourseDto) {
  const response = await api.post("/instructor/academy/courses", payload);
  return response.data;
}

export async function instructorAddSection(courseId: string | number, payload: AcademyInstructorCreateSectionDto) {
  const response = await api.post(`/instructor/academy/courses/${courseId}/sections`, payload);
  return response.data;
}

export async function instructorAddLesson(sectionId: string | number, payload: AcademyInstructorCreateLessonDto) {
  const response = await api.post(`/instructor/academy/sections/${sectionId}/lessons`, payload);
  return response.data;
}

export async function instructorAddQuiz(courseId: string | number, payload: AcademyInstructorCreateQuizDto) {
  const response = await api.post(`/instructor/academy/courses/${courseId}/quizzes`, payload);
  return response.data;
}

export async function instructorUpdateQuiz(id: string | number, payload: AcademyInstructorUpdateQuizDto) {
  const response = await api.patch(`/instructor/academy/quizzes/${id}`, payload);
  return response.data;
}

export async function instructorDeleteQuiz(id: string | number) {
  const response = await api.delete(`/instructor/academy/quizzes/${id}`);
  return response.data;
}

export async function instructorAddQuestion(quizId: string | number, payload: Record<string, unknown>) {
  const response = await api.post(`/instructor/academy/quizzes/${quizId}/questions`, payload);
  return response.data;
}

export async function instructorUpdateQuestion(id: string | number, payload: AcademyInstructorUpdateQuestionDto) {
  const response = await api.patch(`/instructor/academy/questions/${id}`, payload);
  return response.data;
}

export async function instructorDeleteQuestion(id: string | number) {
  const response = await api.delete(`/instructor/academy/questions/${id}`);
  return response.data;
}

export async function instructorAddOption(questionId: string | number, payload: Record<string, unknown>) {
  const response = await api.post(`/instructor/academy/questions/${questionId}/options`, payload);
  return response.data;
}

export async function instructorUpdateOption(id: string | number, payload: AcademyInstructorUpdateOptionDto) {
  const response = await api.patch(`/instructor/academy/options/${id}`, payload);
  return response.data;
}

export async function instructorDeleteOption(id: string | number) {
  const response = await api.delete(`/instructor/academy/options/${id}`);
  return response.data;
}

export async function instructorGetQuizAttempts(quizId: string | number) {
  const response = await api.get<AcademyQuizAttemptDto[]>(`/instructor/academy/quizzes/${quizId}/attempts`);
  return response.data;
}

export async function instructorUpdateCourse(id: string | number, payload: AcademyInstructorCourseUpdateDto) {
  const response = await api.patch(`/instructor/academy/courses/${id}`, payload);
  return response.data;
}

export async function instructorDeleteCourse(id: string | number) {
  const response = await api.delete(`/instructor/academy/courses/${id}`);
  return response.data;
}

export async function instructorGetCourseDetails(id: string | number) {
  const response = await api.get<AcademyInstructorCourseDto>(`/instructor/academy/courses/${id}`);
  return response.data;
}

export async function instructorSuspendCourse(id: string | number) {
  const response = await api.patch(`/instructor/academy/courses/${id}/suspend`);
  return response.data;
}

export async function instructorGetQuizDetails(quizId: string | number) {
  const response = await api.get<AcademyQuizDetailsDto>(`/instructor/academy/quizzes/${quizId}/details`);
  return response.data;
}

export async function instructorGetSectionDetails(sectionId: string | number) {
  const response = await api.get<AcademySectionDetailsDto>(`/instructor/academy/sections/${sectionId}/details`);
  return response.data;
}

export async function instructorGetLessonDetails(lessonId: string | number) {
  const response = await api.get<AcademyLessonDetailsDto>(`/instructor/academy/lessons/${lessonId}/details`);
  return response.data;
}
