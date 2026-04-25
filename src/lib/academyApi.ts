import api from "@/lib/api";
import type {
  AcademyCourseFilters,
  PageMetaDto,
  AcademyCategoryTypeDto,
  AcademyQuizTypeDto,
  AcademyCourseDetailsDto,
  AcademyCourseWithProgressDto,
  AcademyEnrollmentDto,
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
  AdminCourseEnrollmentDto,
  AdminAcademyDashboardDto,
  AdminAcademyInstructorDto,
  AdminAcademyCourseUpdateDto,
} from "@/types/learning";

interface ApiEnvelope<T> {
  data: T;
  meta?: PageMetaDto;
}

export interface PaginatedResult<T> {
  data: T;
  meta?: PageMetaDto;
}

function normalizeEnvelope<T>(payload: T | ApiEnvelope<T>): PaginatedResult<T> {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    const wrapped = payload as ApiEnvelope<T>;
    return { data: wrapped.data, meta: wrapped.meta };
  }
  return { data: payload as T };
}

interface AcademyCourseApiResponse {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  lessonCount?: number | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  } | null;
  categoryId: string | null;
  instructor?: {
    id: string;
    userId?: string;
    name?: string;
    username?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    title?: string;
    specialization?: string;
    qualifications?: string;
    bioLong?: string;
    ratingAvg?: string;
    totalStudents?: number;
    isFeatured?: boolean;
    approvedAt?: string;
    approvedBy: string | null;
  } | null;
  instructorId: string | null;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  price: string;
  currency: string;
  discountPrice: string | null;
  isFree: boolean;
  durationHours: string | number | null;
  status: string;
  isFeatured: boolean;
  shariahCompliant: boolean;
  certificateIssued: boolean;
  maxStudents: number | null;
  ratingAvg: string;
  totalEnrollments: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections?: Array<{
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    sortOrder: number;
    isFreePreview: boolean;
    lessons: Array<{
      id: string;
      sectionId: string;
      courseId: string;
      title: string;
      type: string;
      contentUrl: string | null;
      contentText: string | null;
      durationSeconds: number | null;
      sortOrder: number;
      isFreePreview: boolean;
      isPublished: boolean;
      resources: unknown;
      meetingLink: string | null;
      scheduledAt: string | null;
      quizzes: unknown[];
      lastAttempt?: unknown;
      isCompleted?: boolean;
    }>;
  }>;
}

function mapAcademyCourseApiResponse(
  course: AcademyCourseApiResponse,
): AcademyCourseDetailsDto {
  const durationMinutes = Number(course.durationHours ?? 0) * 60 || 0;
  const instructorRating = Number(course.instructor?.ratingAvg ?? 0) || 0;
  const courseRating = Number(course.ratingAvg) || 0;
  const instructorName =
    course.instructor?.name?.trim() ||
    course.instructor?.title?.trim() ||
    (typeof course.instructor?.username === "string"
      ? course.instructor.username.trim()
      : "") ||
    (typeof course.instructor?.email === "string"
      ? course.instructor.email.trim()
      : "");
  const educatorName =
    instructorName ||
    (course.instructorId ? "Course Instructor" : "IEFA Educator");
  const programme =
    course.categoryId || course.category
      ? {
          id: course.categoryId ?? course.category?.id ?? "",
          title: course.category?.name ?? "Uncategorized",
          level: course.level,
          totalDurationMinutes: durationMinutes,
        }
      : null;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverImageUrl: course.thumbnailUrl ?? "",
    previewVideoUrl: course.trailerUrl ?? null,
    educatorId: course.instructorId ?? "",
    educator: {
      id:
        course.instructor?.userId ??
        course.instructor?.id ??
        course.instructorId ??
        "",
      name: educatorName,
      email:
        typeof course.instructor?.email === "string"
          ? course.instructor.email
          : undefined,
      profilePhotoUrl: course.instructor?.photoUrl ?? "",
      rating: instructorRating,
      title: educatorName,
      specialization: course.instructor?.specialization,
      qualifications: course.instructor?.qualifications,
      bioLong: course.instructor?.bioLong,
      totalStudents: course.instructor?.totalStudents,
    },
    programmeId: course.categoryId,
    programme,
    sections: (course.sections ?? []).map((section) => ({
      id: section.id,
      courseId: section.courseId,
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      isFreePreview: section.isFreePreview,
      lessons: [...(section.lessons ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((lesson) => ({
          id: lesson.id,
          sectionId: lesson.sectionId,
          courseId: lesson.courseId,
          title: lesson.title,
          type: lesson.type,
          contentUrl: lesson.contentUrl,
          contentText: lesson.contentText,
          durationSeconds: lesson.durationSeconds,
          sortOrder: lesson.sortOrder,
          isFreePreview: lesson.isFreePreview,
          isPublished: lesson.isPublished,
          resources: lesson.resources,
          meetingLink: lesson.meetingLink,
          scheduledAt: lesson.scheduledAt,
          quizzes: lesson.quizzes ?? [],
          quiz: (() => {
            const firstQuiz = lesson.quizzes?.[0];
            if (!firstQuiz || typeof firstQuiz !== "object") return null;
            const q = firstQuiz as Record<string, unknown>;
            if (q.id === undefined || q.id === null) return null;
            return {
              id: q.id as string | number,
              title: String(q.title ?? ""),
              passPercentage:
                q.passPercentage !== undefined
                  ? Number(q.passPercentage)
                  : undefined,
              timeLimitMinutes:
                q.timeLimitMinutes !== undefined
                  ? Number(q.timeLimitMinutes) || null
                  : null,
              maxAttempts:
                q.maxAttempts !== undefined
                  ? Number(q.maxAttempts) || null
                  : null,
              isPublished:
                q.isPublished !== undefined
                  ? Boolean(q.isPublished)
                  : undefined,
              questionCount:
                q.questionCount !== undefined
                  ? Number(q.questionCount)
                  : undefined,
            };
          })(),
          lastAttempt: (() => {
            const la = (lesson as Record<string, unknown>).lastAttempt;
            if (!la || typeof la !== "object") return null;
            const laRec = la as Record<string, unknown>;
            return {
              id: laRec.id as string | number,
              status: laRec.status as "passed" | "failed" | "in_progress",
              score: laRec.score !== undefined ? Number(laRec.score) : null,
              attemptNumber:
                laRec.attemptNumber !== undefined
                  ? Number(laRec.attemptNumber)
                  : null,
              submittedAt: (laRec.submittedAt as string | null) ?? null,
              startedAt: (laRec.startedAt as string | null) ?? null,
            };
          })(),
          isCompleted: Boolean(lesson.isCompleted),
        })),
    })),
    moduleCount: (course.sections ?? []).length,
    videoCount:
      (course.sections ?? []).reduce(
        (acc, s) => acc + (s.lessons ?? []).length,
        0,
      ) || Number(course.lessonCount ?? 0),
    lessonCount:
      Number(course.lessonCount ?? 0) ||
      (course.sections ?? []).reduce(
        (acc, s) => acc + (s.lessons ?? []).length,
        0,
      ),
    totalDurationMinutes: durationMinutes,
    enrolledCount: course.totalEnrollments,
    level: course.level,
    priceUsd: Number(course.price) || 0,
    isFree: course.isFree,
    rating: courseRating,
    reviewCount: 0,
    status: course.status,
    tags: [],
    publishedAt: course.publishedAt ?? course.createdAt,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    subtitle: course.subtitle,
    language: course.language,
    shariahCompliant: course.shariahCompliant,
    certificateIssued: course.certificateIssued,
  };
}

export async function getAcademyCourses(
  filters: AcademyCourseFilters = {},
): Promise<PaginatedResult<AcademyCourseDetailsDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  if (filters.search) params.search = filters.search;
  if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
  const response = await api.get<
    AcademyCourseApiResponse[] | ApiEnvelope<AcademyCourseApiResponse[]>
  >("/academy/courses", { params });
  const normalized = normalizeEnvelope(response.data);
  return {
    data: (normalized.data ?? []).map(mapAcademyCourseApiResponse),
    meta: normalized.meta,
  };
}

export async function getAcademyCategoryTypes() {
  const response = await api.get<
    AcademyCategoryTypeDto[] | ApiEnvelope<AcademyCategoryTypeDto[]>
  >("/academy/category-types");
  return normalizeEnvelope(response.data).data;
}

export async function getAcademyQuizTypes() {
  const response = await api.get<
    AcademyQuizTypeDto[] | ApiEnvelope<AcademyQuizTypeDto[]>
  >("/academy/quiz-types");
  return normalizeEnvelope(response.data).data;
}

export async function getAcademyCourseDetails(id: string | number) {
  const response = await api.get<
    AcademyCourseApiResponse | ApiEnvelope<AcademyCourseApiResponse>
  >(`/academy/courses/${id}`);
  return mapAcademyCourseApiResponse(
    normalizeEnvelope(response.data).data,
  ) as AcademyCourseDetailsDto;
}

export async function getAcademyCourseDetailsWithProgress(id: string | number) {
  const response = await api.get<
    | (AcademyCourseApiResponse & {
        courseProgress?: {
          completionPercent?: number;
          enrolledAt?: string;
          completedAt?: string | null;
          status?: string;
          completedLessonIds?: Array<string | number>;
        };
        progressPercent?: number;
        completedModules?: number;
        totalModules?: number;
        completedLessonIds?: Array<string | number>;
      })
    | ApiEnvelope<
        AcademyCourseApiResponse & {
          courseProgress?: {
            completionPercent?: number;
            enrolledAt?: string;
            completedAt?: string | null;
            status?: string;
            completedLessonIds?: Array<string | number>;
          };
          progressPercent?: number;
          completedModules?: number;
          totalModules?: number;
          completedLessonIds?: Array<string | number>;
        }
      >
  >(`/academy/courses/${id}/with-progress`);
  const payload = normalizeEnvelope(response.data).data;
  const base = mapAcademyCourseApiResponse(payload) as AcademyCourseDetailsDto;
  return {
    ...base,
    progressPercent:
      payload.courseProgress?.completionPercent ?? payload.progressPercent ?? 0,
    completedModules:
      payload.completedModules ??
      Math.round(
        ((payload.courseProgress?.completionPercent ?? 0) / 100) *
          (base.moduleCount || 0),
      ),
    totalModules: payload.totalModules ?? base.moduleCount ?? 0,
    completedLessonIds:
      payload.completedLessonIds ??
      payload.courseProgress?.completedLessonIds ??
      [],
    courseProgress: {
      completionPercent:
        payload.courseProgress?.completionPercent ??
        payload.progressPercent ??
        0,
      enrolledAt: payload.courseProgress?.enrolledAt ?? null,
      completedAt: payload.courseProgress?.completedAt ?? null,
      status: payload.courseProgress?.status ?? null,
    },
  } as AcademyCourseWithProgressDto;
}

export async function enrollInAcademyCourse(id: string | number) {
  const response = await api.post(`/academy/courses/${id}/enroll`);
  return normalizeEnvelope(response.data).data;
}

export async function unenrollFromAcademyCourse(id: string | number) {
  const response = await api.post(`/academy/courses/${id}/unenroll`);
  return normalizeEnvelope(response.data).data;
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
  completedLessonsCount?: number;
}

export async function getAcademyMyEnrollments(
  filters: Pick<AcademyCourseFilters, "page" | "perPage"> = {},
): Promise<PaginatedResult<AcademyEnrollmentDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  const response = await api.get<
    AcademyEnrollmentApiResponse[] | ApiEnvelope<AcademyEnrollmentApiResponse[]>
  >("/academy/my-enrollments", { params });
  const normalized = normalizeEnvelope(response.data);

  return {
    data: (normalized.data ?? []).map((enrollment) => ({
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
      completedLessonsCount: Number(enrollment.completedLessonsCount ?? 0) || 0,
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
    })),
    meta: normalized.meta,
  };
}

interface AcademyDashboardApiResponse {
  totalCourses: number;
  completedCourses: number;
  weeklyProgress?: number;
  enrollments: Array<{
    id: string;
    courseId: string;
    title: string;
    thumbnailUrl: string | null;
    instructorName?: string;
    instructor?: {
      id?: string;
      name?: string;
      username?: string | null;
      email?: string | null;
      photoUrl?: string | null;
    };
    progress: number;
    completedLessonsCount?: number;
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
  const response = await api.get<
    AcademyDashboardApiResponse | ApiEnvelope<AcademyDashboardApiResponse>
  >("/academy/dashboard");
  const data = normalizeEnvelope(response.data).data;

  return {
    totalCourses: data.totalCourses,
    completedCourses: data.completedCourses,
    weeklyProgress: Number(data.weeklyProgress ?? 0) || 0,
    enrollments: (data.enrollments ?? []).map((enrollment) => ({
      ...enrollment,
      instructorName:
        enrollment.instructor?.name ?? enrollment.instructorName ?? undefined,
      completedLessonsCount: Number(enrollment.completedLessonsCount ?? 0) || 0,
    })),
  } as AcademyDashboardDto;
}

export async function getAcademyUpcomingActivities() {
  const response = await api.get<
    | AcademyUpcomingActivitiesApiResponse
    | ApiEnvelope<AcademyUpcomingActivitiesApiResponse>
  >("/academy/upcoming-activities");
  const data = normalizeEnvelope(response.data).data;

  return [
    ...data.liveSessions.map((session) => ({
      id: session.id,
      title: session.title,
      type: session.type ?? "live_session",
      dueDate: session.scheduledAt ?? null,
      courseId: session.courseId,
      courseTitle: null,
    })),
    ...data.pendingLessons.map((lesson) => ({
      id: lesson.lessonId,
      title: lesson.lessonTitle,
      type: lesson.lessonType,
      dueDate: null,
      courseId: undefined,
      courseTitle: lesson.courseTitle,
    })),
  ];
}

export async function completeAcademyLesson(id: string | number) {
  const response = await api.post(`/academy/lessons/${id}/complete`);
  return normalizeEnvelope(response.data).data;
}

export async function startAcademyQuiz(quizId: string | number) {
  const response = await api.post(`/academy/quizzes/${quizId}/start`);
  return normalizeEnvelope(response.data).data;
}

export async function submitAcademyAttempt(
  attemptId: string | number,
  payload?: Record<string, unknown>,
) {
  const response = await api.post(
    `/academy/attempts/${attemptId}/submit`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function getAcademyQuiz(quizId: string | number) {
  const response = await api.get<AcademyQuizDto | ApiEnvelope<AcademyQuizDto>>(
    `/academy/quizzes/${quizId}`,
  );
  return normalizeEnvelope(response.data).data;
}

export async function getAcademyLesson(id: string | number) {
  const response = await api.get<
    AcademyLessonDto | ApiEnvelope<AcademyLessonDto>
  >(`/academy/lessons/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function getAcademySection(id: string | number) {
  const response = await api.get<
    AcademySectionDto | ApiEnvelope<AcademySectionDto>
  >(`/academy/sections/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetCourses(
  filters: Pick<AcademyCourseFilters, "page" | "perPage" | "search"> = {},
): Promise<PaginatedResult<AcademyInstructorCourseDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  if (filters.search) params.search = filters.search;
  const response = await api.get<
    AcademyCourseApiResponse[] | ApiEnvelope<AcademyCourseApiResponse[]>
  >("/instructor/academy/courses", { params });
  const normalized = normalizeEnvelope(response.data);
  return {
    data: (normalized.data ?? []).map(
      (c) => mapAcademyCourseApiResponse(c) as AcademyInstructorCourseDto,
    ),
    meta: normalized.meta,
  };
}

export async function instructorCreateCourse(
  payload: AcademyInstructorCreateCourseDto,
) {
  // Map frontend DTO to API contract field names
  const body = {
    title: payload.title,
    slug: payload.slug,
    subtitle: payload.subtitle,
    description: payload.description,
    categoryId: payload.categoryId,
    level: payload.level,
    thumbnailUrl: payload.thumbnailUrl,
    price: payload.price,
    isFree: payload.isFree,
  };
  const response = await api.post("/instructor/academy/courses", body);
  return normalizeEnvelope(response.data).data;
}

export async function instructorAddSection(
  courseId: string | number,
  payload: AcademyInstructorCreateSectionDto,
) {
  const response = await api.post(
    `/instructor/academy/courses/${courseId}/sections`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorAddLesson(
  sectionId: string | number,
  payload: AcademyInstructorCreateLessonDto,
) {
  const response = await api.post(
    `/instructor/academy/sections/${sectionId}/lessons`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorAddQuiz(
  courseId: string | number,
  payload: AcademyInstructorCreateQuizDto,
) {
  const response = await api.post(
    `/instructor/academy/courses/${courseId}/quizzes`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorUpdateQuiz(
  id: string | number,
  payload: AcademyInstructorUpdateQuizDto,
) {
  const response = await api.patch(
    `/instructor/academy/quizzes/${id}`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorDeleteQuiz(id: string | number) {
  const response = await api.delete(`/instructor/academy/quizzes/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorAddQuestion(
  quizId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await api.post(
    `/instructor/academy/quizzes/${quizId}/questions`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorUpdateQuestion(
  id: string | number,
  payload: AcademyInstructorUpdateQuestionDto,
) {
  const response = await api.patch(
    `/instructor/academy/questions/${id}`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorDeleteQuestion(id: string | number) {
  const response = await api.delete(`/instructor/academy/questions/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorAddOption(
  questionId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await api.post(
    `/instructor/academy/questions/${questionId}/options`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorUpdateOption(
  id: string | number,
  payload: AcademyInstructorUpdateOptionDto,
) {
  const response = await api.patch(
    `/instructor/academy/options/${id}`,
    payload,
  );
  return normalizeEnvelope(response.data).data;
}

export async function instructorDeleteOption(id: string | number) {
  const response = await api.delete(`/instructor/academy/options/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetQuizAttempts(quizId: string | number) {
  const response = await api.get<
    AcademyQuizAttemptDto[] | ApiEnvelope<AcademyQuizAttemptDto[]>
  >(`/instructor/academy/quizzes/${quizId}/attempts`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorUpdateCourse(
  id: string | number,
  payload: AcademyInstructorCourseUpdateDto,
) {
  // Map frontend DTO field names to API contract
  const body = {
    title: payload.title,
    slug: payload.slug,
    subtitle: payload.subtitle,
    description: payload.description,
    categoryId: payload.categoryId,
    level: payload.level,
    thumbnailUrl: payload.thumbnailUrl,
    price: payload.price,
    isFree: payload.isFree,
  };
  const response = await api.patch(`/instructor/academy/courses/${id}`, body);
  return normalizeEnvelope(response.data).data;
}

export async function instructorDeleteCourse(id: string | number) {
  const response = await api.delete(`/instructor/academy/courses/${id}`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetCourseDetails(id: string | number) {
  const response = await api.get<
    AcademyCourseApiResponse | ApiEnvelope<AcademyCourseApiResponse>
  >(`/instructor/academy/courses/${id}`);
  return mapAcademyCourseApiResponse(
    normalizeEnvelope(response.data).data,
  ) as AcademyInstructorCourseDto;
}

export async function instructorSuspendCourse(id: string | number) {
  const response = await api.patch(`/instructor/academy/courses/${id}/suspend`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorPublishCourse(id: string | number) {
  const response = await api.patch(`/instructor/academy/courses/${id}/publish`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetQuizDetails(quizId: string | number) {
  const response = await api.get<
    AcademyQuizDetailsDto | ApiEnvelope<AcademyQuizDetailsDto>
  >(`/instructor/academy/quizzes/${quizId}/details`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetSectionDetails(sectionId: string | number) {
  const response = await api.get<
    AcademySectionDetailsDto | ApiEnvelope<AcademySectionDetailsDto>
  >(`/instructor/academy/sections/${sectionId}/details`);
  return normalizeEnvelope(response.data).data;
}

export async function instructorGetLessonDetails(lessonId: string | number) {
  const response = await api.get<
    AcademyLessonDetailsDto | ApiEnvelope<AcademyLessonDetailsDto>
  >(`/instructor/academy/lessons/${lessonId}/details`);
  return normalizeEnvelope(response.data).data;
}

// Admin Academy APIs

export async function adminGetAllCourses(
  filters: Pick<
    AcademyCourseFilters,
    "page" | "perPage" | "search" | "categoryId" | "instructorId" | "status" | "order"
  > = {},
): Promise<PaginatedResult<AcademyInstructorCourseDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  if (filters.search) params.search = filters.search;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.instructorId) params.instructorId = filters.instructorId;
  if (filters.status) params.status = filters.status;
  if (filters.order) params.order = filters.order;
  const response = await api.get<
    AcademyCourseApiResponse[] | ApiEnvelope<AcademyCourseApiResponse[]>
  >("/admin/academy/courses", { params });
  const normalized = normalizeEnvelope(response.data);
  return {
    data: (normalized.data ?? []).map(
      (c) => mapAcademyCourseApiResponse(c) as AcademyInstructorCourseDto,
    ),
    meta: normalized.meta,
  };
}

export async function adminGetCourseEnrollments(
  courseId: string | number,
  filters: Pick<AcademyCourseFilters, "page" | "perPage"> = {},
): Promise<PaginatedResult<AdminCourseEnrollmentDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  const response = await api.get<
    | Array<{
        id: string;
        userId: string;
        userName?: string | null;
        userEmail?: string | null;
        status: string;
        completionPercent?: number | string | null;
        completedLessonsCount?: number | string | null;
        enrolledAt: string;
        completedAt?: string | null;
        expiresAt?: string | null;
        courseId?: string;
      }>
    | ApiEnvelope<
        Array<{
          id: string;
          userId: string;
          userName?: string | null;
          userEmail?: string | null;
          status: string;
          completionPercent?: number | string | null;
          completedLessonsCount?: number | string | null;
          enrolledAt: string;
          completedAt?: string | null;
          expiresAt?: string | null;
          courseId?: string;
        }>
      >
  >(`/admin/academy/courses/${courseId}/enrollments`, { params });
  const normalized = normalizeEnvelope(response.data);
  return {
    data: (normalized.data ?? []).map((item) => ({
      id: item.id,
      userId: item.userId,
      courseId: item.courseId ?? String(courseId),
      status: item.status,
      completedLessonsCount: Number(item.completedLessonsCount ?? 0) || 0,
      enrolledAt: item.enrolledAt,
      completedAt: item.completedAt ?? null,
      expiresAt: item.expiresAt ?? null,
      progressPercent: Number(item.completionPercent ?? 0) || 0,
      userName: item.userName ?? undefined,
      userEmail: item.userEmail ?? undefined,
      user: {
        id: item.userId,
        username: item.userName ?? undefined,
        email: item.userEmail ?? undefined,
      },
    })) as AdminCourseEnrollmentDto[],
    meta: normalized.meta,
  };
}

export async function adminCreateCourse(
  payload: AcademyInstructorCreateCourseDto & { instructorId?: string },
) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    subtitle: payload.subtitle,
    description: payload.description,
    categoryId: payload.categoryId,
    level: payload.level,
    thumbnailUrl: payload.thumbnailUrl,
    price: payload.price,
    isFree: payload.isFree,
    ...(payload.instructorId ? { instructorId: payload.instructorId } : {}),
  };
  const response = await api.post("/admin/academy/courses", body);
  return normalizeEnvelope(response.data).data;
}

export async function adminGetDashboard() {
  const response = await api.get<
    | Partial<AdminAcademyDashboardDto>
    | ApiEnvelope<Partial<AdminAcademyDashboardDto>>
  >("/admin/academy/dashboard");
  const raw = normalizeEnvelope(response.data).data ?? {};

  const courses = raw.courses ?? {
    total: Number(raw.totalCourses ?? 0) || 0,
    active: Number(raw.publishedCourses ?? 0) || 0,
    suspended: Number(raw.suspendedCourses ?? 0) || 0,
  };
  const enrollments = raw.enrollments ?? {
    total: Number(raw.totalEnrollments ?? 0) || 0,
    active: 0,
    completed: 0,
  };
  const instructors = raw.instructors ?? {
    total: Number(raw.totalInstructors ?? 0) || 0,
  };

  const inferredDrafts = Math.max(
    0,
    Number(courses.total ?? 0) -
      Number(courses.active ?? 0) -
      Number(courses.suspended ?? 0),
  );

  return {
    courses: {
      total: Number(courses.total ?? 0) || 0,
      active: Number(courses.active ?? 0) || 0,
      suspended: Number(courses.suspended ?? 0) || 0,
    },
    enrollments: {
      total: Number(enrollments.total ?? 0) || 0,
      active: Number(enrollments.active ?? 0) || 0,
      completed: Number(enrollments.completed ?? 0) || 0,
    },
    instructors: {
      total: Number(instructors.total ?? 0) || 0,
    },
    totalCourses: Number(courses.total ?? 0) || 0,
    totalInstructors: Number(instructors.total ?? 0) || 0,
    totalEnrollments: Number(enrollments.total ?? 0) || 0,
    publishedCourses: Number(courses.active ?? 0) || 0,
    draftCourses: Number(raw.draftCourses ?? inferredDrafts) || 0,
    suspendedCourses: Number(courses.suspended ?? 0) || 0,
  } as AdminAcademyDashboardDto;
}

export async function adminGetAllInstructors(
  filters: Pick<AcademyCourseFilters, "page" | "perPage" | "search"> = {},
): Promise<PaginatedResult<AdminAcademyInstructorDto[]>> {
  const params: Record<string, string | number> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  if (filters.search) params.search = filters.search;

  const response = await api.get<
    | Array<Record<string, unknown>>
    | ApiEnvelope<Array<Record<string, unknown>>>
  >("/admin/academy/instructors", { params });
  const normalized = normalizeEnvelope(response.data);

  return {
    data: (normalized.data ?? []).map((item) => {
      const firstName =
        (typeof item.firstName === "string" && item.firstName) ||
        (typeof item.firstname === "string" && item.firstname) ||
        undefined;
      const lastName =
        (typeof item.lastName === "string" && item.lastName) ||
        (typeof item.lastname === "string" && item.lastname) ||
        undefined;

      const user =
        item.user && typeof item.user === "object"
          ? (item.user as Record<string, unknown>)
          : null;

      return {
        id: String(item.id ?? user?.id ?? ""),
        firstName:
          firstName ||
          (typeof user?.firstName === "string" ? user.firstName : undefined),
        lastName:
          lastName ||
          (typeof user?.lastName === "string" ? user.lastName : undefined),
        username:
          (typeof item.username === "string" && item.username) ||
          (typeof user?.username === "string" ? user.username : undefined),
        email:
          (typeof item.email === "string" && item.email) ||
          (typeof user?.email === "string" ? user.email : undefined),
      } as AdminAcademyInstructorDto;
    }),
    meta: normalized.meta,
  };
}

export async function adminUpdateCourse(
  courseId: string | number,
  payload: AdminAcademyCourseUpdateDto,
) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    subtitle: payload.subtitle,
    description: payload.description,
    categoryId: payload.categoryId,
    level: payload.level,
    thumbnailUrl: payload.thumbnailUrl,
    price: payload.price,
    isFree: payload.isFree,
    ...(payload.instructorId ? { instructorId: payload.instructorId } : {}),
  };
  const response = await api.patch(`/admin/academy/courses/${courseId}`, body);
  return normalizeEnvelope(response.data).data;
}

export async function adminPublishCourse(courseId: string | number) {
  const response = await api.patch(`/admin/academy/courses/${courseId}/publish`);
  return normalizeEnvelope(response.data).data;
}

export async function adminMakeUserInstructor(userId: string) {
  const response = await api.post(
    `/admin/academy/users/${userId}/make-instructor`,
  );
  return normalizeEnvelope(response.data).data;
}

export async function adminSuspendCourse(courseId: string | number) {
  const response = await api.post(`/admin/academy/courses/${courseId}/suspend`);
  return normalizeEnvelope(response.data).data;
}

export async function adminUnsuspendCourse(courseId: string | number) {
  const response = await api.post(
    `/admin/academy/courses/${courseId}/unsuspend`,
  );
  return normalizeEnvelope(response.data).data;
}

export async function adminDeleteCourse(courseId: string | number) {
  const response = await api.delete(`/admin/academy/courses/${courseId}`);
  return normalizeEnvelope(response.data).data;
}
