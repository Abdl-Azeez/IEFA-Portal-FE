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
  profilePhotoUrl: string;
  rating: number;
}

export interface ProgrammeSummaryDto {
  id: string | number;
  title: string;
  level?: string;
  totalDurationMinutes?: number;
}

export interface StudentCourseDto {
  id: number;
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
