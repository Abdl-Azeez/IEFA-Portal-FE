export interface PageMetaDto {
  page: number;
  perPage: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EducatorSummaryDto {
  id: string | number;
  name: string;
  email?: string;
  profilePhotoUrl: string;
  rating: number;
  title?: string;
  specialization?: string;
  qualifications?: string | null;
  bioLong?: string;
  totalStudents?: number;
}

export interface ProgrammeSummaryDto {
  id: string | number;
  title: string;
  level?: string;
  totalDurationMinutes?: number;
}

export interface StudentCourseDto {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  previewVideoUrl?: string | null;
  educatorId: string | number;
  educator: EducatorSummaryDto;
  programmeId?: string | null;
  programme?: ProgrammeSummaryDto | null;
  moduleCount: number;
  videoCount: number;
  totalDurationMinutes: number;
  enrolledCount: number;
  level: string;
  priceUsd: number;
  isFree: boolean;
  rating: number;
  reviewCount: number;
  status: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  progressPercent?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
}

export interface LearningOutlineItemDto {
  id: number;
  title: string;
  order: number;
  type: string;
}

export type StudentCourseSectionDto = LearningOutlineItemDto;

export interface StudentLessonDto {
  id: number;
  courseId: number;
  course?: { id: number; title: string };
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  orderIndex: number;
  viewCount: number;
  isFree: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  quizId?: number | null;
}

export interface StudentEnrollmentDto {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  programme?: Record<string, unknown> | null;
  progressPercent: number;
  currentCourseId: number;
  currentLessonId: string;
  completedLessonIds: string[];
  status: string;
  enrolledAt: string;
  lastActivityAt: string;
  completedAt?: string | null;
}

export interface StudentProgressDto {
  postId: number;
  status: string;
  progress: number | Record<string, unknown>;
  dateCreated: string;
  dateUpdated?: string | null;
}

export interface CourseStatDto {
  coursesCompleted: number;
  certificatesEarned: number;
  weeklyProgress: number;
}

export interface ContinueLearningDto {
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  lessonId: number;
  lessonTitle: string;
  progress: number;
  remainingTime?: string;
}

export interface ActiveEnrollmentDto {
  id: number;
  title: string;
  progress: number;
  status: string;
  type: string;
}

export interface StudentDashboardDto {
  stats: CourseStatDto;
  continueLearning: ContinueLearningDto | null;
  activeEnrollments: ActiveEnrollmentDto[];
}

export interface UpcomingActivityDto {
  id: string;
  type: string;
  title: string;
  scheduledAt?: string | null;
  dueAt?: string | null;
  joinUrl?: string | null;
  courseId?: number | null;
  durationMinutes?: number | null;
  assessmentId?: string | null;
}

export interface AnnouncementDto {
  id: string;
  courseId: number;
  course?: { id: number; title: string };
  title: string;
  message: string;
  publishedAt: string;
}

export interface SubscriptionDto {
  id: string;
  userId: string;
  planName: string;
  planType: string;
  amountCents: number;
  currency: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDto {
  id: string;
  userId: string;
  user?: Record<string, unknown>;
  itemType: string;
  itemId: string;
  itemTitle: string;
  amountCents: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentProvider: string;
  cardLast4: string;
  transactionRef: string;
  receiptUrl: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPaymentsDto {
  activeSubscription?: SubscriptionDto;
  paymentHistory: PaymentDto[];
}

export interface CertificateDto {
  id: number;
  name: string;
  type: string;
  date: string;
  downloadUrl: string;
  isVerified: boolean;
}

export interface AssessmentResultDto {
  id: number;
  name: string;
  date: string;
  score: number;
  status: string;
}

export interface PerformanceOverviewDto {
  averageScore: number;
  assessmentsCompleted: number;
  certificatesEarned: number;
}

export interface StudentResultsDto {
  earnedCertificates: CertificateDto[];
  assessmentResults: AssessmentResultDto[];
  performanceOverview: PerformanceOverviewDto;
}

export interface LearningCourseFilters {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: number;
}

export interface LearningCourseListResponse {
  data: StudentCourseDto[];
  meta?: PageMetaDto;
}

export interface AdminCreateCourseDto {
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  previewVideoUrl?: string | null;
  educatorId: string;
  programmeId?: string | null;
  level: string;
  priceUsd: number;
  isFree: boolean;
  status: "draft" | "publish";
  tags: string[];
}

export interface UpdateCourseDto {
  title?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  previewVideoUrl?: string | null;
  educatorId?: string;
  programmeId?: string | null;
  level?: string;
  priceUsd?: number;
  isFree?: boolean;
  status?: "draft" | "publish";
  tags?: string[];
}

export interface CreateSectionDto {
  title: string;
  parent_id: number;
  order?: number;
}

export interface UpdateSectionDto {
  title?: string;
  order?: number;
}

export interface CreateLessonDto {
  title: string;
  content?: string;
  parent_id: number;
  order?: number;
  video_embed?: string;
  audio_embed?: string;
}

export interface UpdateLessonDto {
  title?: string;
  content?: string;
  order?: number;
  video_embed?: string;
  audio_embed?: string;
}

export interface AcademyCourseFilters {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  instructorId?: string;
  status?: "draft" | "review" | "published" | "archived" | "suspended";
  order?: "ASC" | "DESC";
}

export interface AcademyCategoryTypeDto {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AcademyQuizTypeDto {
  id: string | number;
  name: string;
  description?: string;
}

export interface AcademyCourseDetailsDto extends StudentCourseDto {
  category?: string;
  syllabus?: string;
  topics?: string[];
  sections?: AcademySectionDto[];
  lessonCount?: number;
  subtitle?: string | null;
  language?: string | null;
  shariahCompliant?: boolean;
  certificateIssued?: boolean;
}

export interface AcademyCourseWithProgressDto extends AcademyCourseDetailsDto {
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  completedLessonIds?: Array<string | number>;
  courseProgress?: {
    completionPercent: number;
    enrolledAt?: string | null;
    completedAt?: string | null;
    status?: string | null;
  };
}

export interface AcademyEnrollmentCourseDto {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  price?: string;
  currency?: string;
}

export interface AcademyEnrollmentDto {
  id: string;
  userId: string;
  courseId: string | number;
  currentCourseId?: string | number;
  itemType?: string;
  itemId?: string;
  programme?: ProgrammeSummaryDto | null;
  status: string;
  enrolledAt: string;
  expiresAt?: string | null;
  lastActivityAt?: string;
  completedLessonIds?: Array<string | number>;
  completedLessonsCount?: number;
  progressPercent: number;
  completedAt?: string | null;
  paymentId?: string | null;
  course?: AcademyEnrollmentCourseDto;
}

export interface AcademyDashboardEnrollmentDto {
  id: string;
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName?: string;
  progress: number;
  completedLessonsCount?: number;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  hasCertificate: boolean;
}

export interface AcademyDashboardDto {
  totalCourses: number;
  completedCourses: number;
  weeklyProgress: number;
  enrollments: AcademyDashboardEnrollmentDto[];
}

export interface AcademyUpcomingActivityDto {
  id: string;
  title: string;
  type: string;
  dueDate?: string | null;
  courseId?: string | number;
  courseTitle?: string | null;
}

export interface AcademyUpcomingActivitiesApiDto {
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

export interface AcademyLessonQuizSummaryDto {
  id: string | number;
  title: string;
  passPercentage?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  isPublished?: boolean;
  questionCount?: number;
}

export interface AcademyQuizLastAttemptDto {
  id: string | number;
  status: "passed" | "failed" | "in_progress";
  score?: number | null;
  attemptNumber?: number | null;
  submittedAt?: string | null;
  startedAt?: string | null;
}

export interface AcademyQuizDto {
  id: string;
  courseId: number;
  title: string;
  description?: string;
  passPercentage?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  isPublished?: boolean;
  questions: Array<Record<string, unknown>>;
}

export interface AcademyLessonDto {
  id: string | number;
  title: string;
  type: string;
  contentUrl?: string | null;
  contentText?: string | null;
  durationSeconds?: number | null;
  sortOrder?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
  resources?: unknown;
  meetingLink?: string | null;
  scheduledAt?: string | null;
  quizzes?: unknown[];
  /** Attached quiz summary (always present when lesson has a quiz) */
  quiz?: AcademyLessonQuizSummaryDto | null;
  /** Last quiz attempt for the current user on this lesson's quiz */
  lastAttempt?: AcademyQuizLastAttemptDto | null;
  isCompleted?: boolean;
  sectionId?: string | number;
  courseId?: string | number;
  // Legacy compat fields
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  orderIndex?: number;
  viewCount?: number;
  isFree?: boolean;
  status?: string;
  quizId?: string | number | null;
  course?: { id: string | number; title: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademySectionDto {
  id: string | number;
  title: string;
  description?: string | null;
  sortOrder?: number;
  isFreePreview?: boolean;
  courseId?: string | number;
  lessons?: AcademyLessonDto[];
  // Legacy compat
  order?: number;
}

export interface AcademyInstructorCourseDto extends AcademyCourseDetailsDto {
  status: string;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyInstructorCreateCourseDto {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnailUrl?: string;
  price: number;
  isFree: boolean;
}

export interface AcademyInstructorCreateSectionDto {
  title: string;
  description?: string;
  sortOrder?: number;
}

export interface AcademyInstructorCreateLessonDto {
  title: string;
  type: "video" | "article" | "quiz" | "assignment" | "live_session";
  contentText?: string;
  contentUrl?: string;
  meetingLink?: string;
  scheduledAt?: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface AcademyInstructorCreateQuizDto {
  title: string;
  description?: string;
  passPercentage: number;
  timeLimitMinutes?: number;
  /** Required – the lesson this quiz is attached to */
  lessonId: string;
}

export interface AcademyInstructorUpdateQuizDto {
  title?: string;
  description?: string;
  passPercentage?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  isPublished?: boolean;
}

export interface AcademyInstructorUpdateQuestionDto {
  text?: string;
  type?: string;
  points?: number;
  sortOrder?: number;
  explanation?: string;
}

export interface AcademyInstructorUpdateOptionDto {
  text?: string;
  isCorrect?: boolean;
  sortOrder?: number;
}

export interface AdminCourseEnrollmentDto {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseId: string;
  status: string;
  completedLessonsCount?: number;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent?: number;
  expiresAt?: string | null;
  user?: {
    id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AdminAcademyDashboardDto {
  courses?: {
    total: number;
    active: number;
    suspended: number;
  };
  enrollments?: {
    total: number;
    active: number;
    completed: number;
  };
  instructors?: {
    total: number;
  };
  totalCourses: number;
  totalInstructors: number;
  totalEnrollments: number;
  publishedCourses: number;
  draftCourses?: number;
  suspendedCourses?: number;
}

export interface AdminAcademyInstructorDto {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export interface AcademyQuizAttemptDto {
  id: string;
  quizId: number;
  studentId: string;
  score: number;
  status: string;
  submittedAt: string;
}

export interface AcademyInstructorCourseUpdateDto {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  categoryId?: string;
  level?: "beginner" | "intermediate" | "advanced";
  thumbnailUrl?: string;
  price?: number;
  isFree?: boolean;
}

export interface AdminAcademyCourseUpdateDto extends AcademyInstructorCourseUpdateDto {
  instructorId?: string;
}

export interface AcademyQuizDetailsDto {
  id: string;
  courseId: string | number;
  lessonId?: string | number | null;
  title: string;
  passPercentage?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  isPublished?: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  questions: Array<Record<string, unknown>>;
}

export interface AcademyCourseContextDto {
  id?: string | number;
  title?: string;
  slug?: string;
  subtitle?: string | null;
  description?: string | null;
  level?: string;
  language?: string;
  status?: string;
  thumbnailUrl?: string | null;
  trailerUrl?: string | null;
  price?: string;
  currency?: string;
  discountPrice?: string | null;
  isFree?: boolean;
  durationHours?: number | null;
  isFeatured?: boolean;
  shariahCompliant?: boolean;
  certificateIssued?: boolean;
  maxStudents?: number | null;
  ratingAvg?: string;
  totalEnrollments?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademySectionDetailsDto {
  id: string;
  courseId?: string | number;
  title: string;
  description?: string | null;
  sortOrder?: number;
  isFreePreview?: boolean;
  course?: AcademyCourseContextDto;
  lessons: AcademyLessonDto[];
}

export interface AcademyLessonDetailsDto extends Omit<AcademyLessonDto, 'course'> {
  sectionId: string | number;
  section?: {
    id?: string | number;
    courseId?: string | number;
    title?: string;
    description?: string | null;
    sortOrder?: number;
    isFreePreview?: boolean;
  };
  course?: AcademyCourseContextDto;
}
