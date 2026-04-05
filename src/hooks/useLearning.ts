import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  AdminCreateCourseDto,
  AnnouncementDto,
  CreateLessonDto,
  CreateSectionDto,
  LearningCourseFilters,
  LearningCourseListResponse,
  PageMetaDto,
  StudentCourseDto,
  StudentCourseSectionDto,
  StudentDashboardDto,
  StudentEnrollmentDto,
  StudentLessonDto,
  StudentPaymentsDto,
  StudentProgressDto,
  StudentResultsDto,
  UpcomingActivityDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateSectionDto,
} from "@/types/learning";

interface ListShape {
  data?: StudentCourseDto[];
  meta?: PageMetaDto;
}

function unwrapListPayload(
  payload: StudentCourseDto[] | ListShape,
): LearningCourseListResponse {
  if (Array.isArray(payload)) {
    return { data: payload };
  }

  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta,
  };
}

export const useLearningCourses = (filters: LearningCourseFilters = {}) =>
  useQuery<LearningCourseListResponse>({
    queryKey: ["learning", "courses", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 10,
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;

      const { data } = await api.get<StudentCourseDto[] | ListShape>("/learning/courses", {
        params,
      });

      return unwrapListPayload(data);
    },
    staleTime: 60_000,
  });

export const useLearningCourseById = (id?: number) =>
  useQuery<StudentCourseDto>({
    queryKey: ["learning", "course", id],
    queryFn: async () => {
      const { data } = await api.get<StudentCourseDto>(`/learning/courses/${id}`);
      return data;
    },
    enabled: typeof id === "number" && Number.isFinite(id),
    staleTime: 60_000,
  });

export const useLearningCourseContent = (courseId?: number) =>
  useQuery<StudentCourseSectionDto[]>({
    queryKey: ["learning", "course-content", courseId],
    queryFn: async () => {
      const { data } = await api.get<StudentCourseSectionDto[]>(`/learning/courses/${courseId}/content`);
      return data;
    },
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 60_000,
  });

export const useLearningSectionContent = (sectionId?: number) =>
  useQuery<StudentCourseSectionDto[]>({
    queryKey: ["learning", "section-content", sectionId],
    queryFn: async () => {
      const { data } = await api.get<StudentCourseSectionDto[]>(`/learning/sections/${sectionId}/content`);
      return data;
    },
    enabled: typeof sectionId === "number" && Number.isFinite(sectionId),
    staleTime: 60_000,
  });

export const useLearningLessonById = (lessonId?: number) =>
  useQuery<StudentLessonDto>({
    queryKey: ["learning", "lesson", lessonId],
    queryFn: async () => {
      const { data } = await api.get<StudentLessonDto>(`/learning/lessons/${lessonId}`);
      return data;
    },
    enabled: typeof lessonId === "number" && Number.isFinite(lessonId),
    staleTime: 60_000,
  });

export const useLearningDashboard = () =>
  useQuery<StudentDashboardDto>({
    queryKey: ["learning", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<StudentDashboardDto>("/learning/dashboard");
      return data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

export const useLearningMyCourses = () =>
  useQuery<StudentEnrollmentDto[]>({
    queryKey: ["learning", "my-courses"],
    queryFn: async () => {
      const { data } = await api.get<StudentEnrollmentDto[]>("/learning/my-courses");
      return data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

export const useLearningMyCourseProgress = (courseId?: number) =>
  useQuery<StudentProgressDto>({
    queryKey: ["learning", "my-course-progress", courseId],
    queryFn: async () => {
      const { data } = await api.get<StudentProgressDto>(`/learning/my-courses/${courseId}/progress`);
      return data;
    },
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useLearningUpcomingActivities = () =>
  useQuery<UpcomingActivityDto[]>({
    queryKey: ["learning", "upcoming-activities"],
    queryFn: async () => {
      const { data } = await api.get<UpcomingActivityDto[]>("/learning/upcoming-activities");
      return data;
    },
    staleTime: 30_000,
  });

export const useLearningAnnouncements = () =>
  useQuery<AnnouncementDto[]>({
    queryKey: ["learning", "announcements"],
    queryFn: async () => {
      const { data } = await api.get<AnnouncementDto[]>("/learning/announcements");
      return data;
    },
    staleTime: 30_000,
  });

export const useLearningPayments = () =>
  useQuery<StudentPaymentsDto>({
    queryKey: ["learning", "payments"],
    queryFn: async () => {
      const { data } = await api.get<StudentPaymentsDto>("/learning/payments");
      return data;
    },
    staleTime: 30_000,
  });

export const useLearningResults = () =>
  useQuery<StudentResultsDto>({
    queryKey: ["learning", "results"],
    queryFn: async () => {
      const { data } = await api.get<StudentResultsDto>("/learning/results");
      return data;
    },
    staleTime: 30_000,
  });

export const useEnrollInLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      await api.post(`/learning/courses/${courseId}/enroll`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
      ]);
    },
  });
};

export const useUnenrollFromLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      await api.delete(`/learning/courses/${courseId}/unenroll`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
      ]);
    },
  });
};

export const useEnrollOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/learning/onboarding/enroll");
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
      ]);
    },
  });
};

export const useAdminCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminCreateCourseDto) => {
      await api.post("/admin/courses", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "courses"] });
    },
  });
};

export const useCreateLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminCreateCourseDto) => {
      await api.post("/learning/courses", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "courses"] });
    },
  });
};

export const useUpdateLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateCourseDto }) => {
      await api.patch(`/learning/courses/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "courses"] });
    },
  });
};

export const useDeleteLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/courses/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "courses"] });
    },
  });
};

export const useCreateLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSectionDto) => {
      await api.post("/learning/sections", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "course-content"] });
    },
  });
};

export const useUpdateLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateSectionDto }) => {
      await api.patch(`/learning/sections/${id}`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "course-content"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "section-content"] }),
      ]);
    },
  });
};

export const useDeleteLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/sections/${id}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "course-content"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "section-content"] }),
      ]);
    },
  });
};

export const useCreateLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLessonDto) => {
      await api.post("/learning/lessons", payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "section-content"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
      ]);
    },
  });
};

export const useUpdateLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateLessonDto }) => {
      await api.patch(`/learning/lessons/${id}`, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "section-content"] }),
      ]);
    },
  });
};

export const useDeleteLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/lessons/${id}`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "section-content"] }),
      ]);
    },
  });
};

export const useLearningCourseStudents = (courseId?: number) =>
  useQuery<Record<string, unknown>[]>({
    queryKey: ["learning", "course-students", courseId],
    queryFn: async () => {
      const { data } = await api.get<Record<string, unknown>[]>(`/learning/courses/${courseId}/students`);
      return data;
    },
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useLearningStudentProgress = (courseId?: number, studentId?: string) =>
  useQuery<Record<string, unknown>>({
    queryKey: ["learning", "student-progress", courseId, studentId],
    queryFn: async () => {
      const { data } = await api.get<Record<string, unknown>>(
        `/learning/courses/${courseId}/students/${studentId}/progress`,
      );
      return data;
    },
    enabled:
      typeof courseId === "number" &&
      Number.isFinite(courseId) &&
      typeof studentId === "string" &&
      studentId.trim().length > 0,
    staleTime: 30_000,
  });
