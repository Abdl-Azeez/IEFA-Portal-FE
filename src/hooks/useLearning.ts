import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
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

function getLearningApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  const axiosMessage = extractAxiosErrorMessage(error);
  if (axiosMessage) return axiosMessage;

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function extractAxiosErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: unknown }
      | string
      | undefined;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const message = responseData.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  return null;
}

function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLearningSectionTitle(fallbackMessage: string): string {
  const cleaned = fallbackMessage
    .replace(/^Failed to\s+/i, "")
    .replace(/^Sorry,\s*/i, "")
    .replace(/\.$/, "")
    .replace(/^(load|create|update|delete|enroll|unenroll)\s+/i, "")
    .trim();

  return cleaned ? toSentenceCase(cleaned) : "Learning";
}

function showLearningApiErrorToast(
  error: unknown,
  fallbackMessage: string,
  sectionTitle?: string,
) {
  // Suppress toasts for background API calls from guest overlays
  if (error && typeof error === "object" && "isGuestOverlayError" in error) {
    return;
  }
  
  toast({
    title: sectionTitle ?? getLearningSectionTitle(fallbackMessage),
    description: getLearningApiErrorMessage(error, fallbackMessage),
    variant: "destructive",
  });
}

async function withLearningErrorToast<T>(
  execute: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await execute();
  } catch (error) {
    showLearningApiErrorToast(error, fallbackMessage);
    throw error;
  }
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
    queryFn: () =>
      withLearningErrorToast(async () => {
        const params: Record<string, string | number> = {
          page: filters.page ?? 1,
          perPage: filters.perPage ?? 10,
        };

        if (filters.search) params.search = filters.search;
        if (filters.categoryId !== undefined)
          params.categoryId = filters.categoryId;

        const { data } = await api.get<StudentCourseDto[] | ListShape>(
          "/learning/courses",
          {
            params,
          },
        );

        return unwrapListPayload(data);
      }, "Failed to load learning courses."),
    staleTime: 60_000,
  });

export const useLearningCourseById = (id?: number) =>
  useQuery<StudentCourseDto>({
    queryKey: ["learning", "course", id],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentCourseDto>(
          `/learning/courses/${id}`,
        );
        return data;
      }, "Failed to load course details."),
    enabled: typeof id === "number" && Number.isFinite(id),
    staleTime: 60_000,
  });

export const useLearningCourseContent = (courseId?: number) =>
  useQuery<StudentCourseSectionDto[]>({
    queryKey: ["learning", "course-content", courseId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentCourseSectionDto[]>(
          `/learning/courses/${courseId}/content`,
        );
        return data;
      }, "Failed to load course content."),
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 60_000,
  });

export const useLearningSectionContent = (sectionId?: number) =>
  useQuery<StudentCourseSectionDto[]>({
    queryKey: ["learning", "section-content", sectionId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentCourseSectionDto[]>(
          `/learning/sections/${sectionId}/content`,
        );
        return data;
      }, "Failed to load section content."),
    enabled: typeof sectionId === "number" && Number.isFinite(sectionId),
    staleTime: 60_000,
  });

export const useLearningLessonById = (lessonId?: number) =>
  useQuery<StudentLessonDto>({
    queryKey: ["learning", "lesson", lessonId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentLessonDto>(
          `/learning/lessons/${lessonId}`,
        );
        return data;
      }, "Failed to load lesson details."),
    enabled: typeof lessonId === "number" && Number.isFinite(lessonId),
    staleTime: 60_000,
  });

export const useLearningDashboard = () =>
  useQuery<StudentDashboardDto>({
    queryKey: ["learning", "dashboard"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentDashboardDto>(
          "/learning/dashboard",
        );
        return data;
      }, "Failed to load learning dashboard."),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

export const useLearningMyCourses = () =>
  useQuery<StudentEnrollmentDto[]>({
    queryKey: ["learning", "my-courses"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentEnrollmentDto[]>(
          "/learning/my-courses",
        );
        return data;
      }, "Failed to load your courses."),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

export const useLearningMyCourseProgress = (courseId?: number) =>
  useQuery<StudentProgressDto>({
    queryKey: ["learning", "my-course-progress", courseId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentProgressDto>(
          `/learning/my-courses/${courseId}/progress`,
        );
        return data;
      }, "Failed to load course progress."),
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useLearningUpcomingActivities = () =>
  useQuery<UpcomingActivityDto[]>({
    queryKey: ["learning", "upcoming-activities"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<UpcomingActivityDto[]>(
          "/learning/upcoming-activities",
        );
        return data;
      }, "Failed to load upcoming activities."),
    staleTime: 30_000,
  });

export const useLearningAnnouncements = () =>
  useQuery<AnnouncementDto[]>({
    queryKey: ["learning", "announcements"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<AnnouncementDto[]>(
          "/learning/announcements",
        );
        return data;
      }, "Failed to load announcements."),
    staleTime: 30_000,
  });

export const useLearningPayments = () =>
  useQuery<StudentPaymentsDto>({
    queryKey: ["learning", "payments"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } =
          await api.get<StudentPaymentsDto>("/learning/payments");
        return data;
      }, "Failed to load payment information."),
    staleTime: 30_000,
  });

export const useLearningResults = () =>
  useQuery<StudentResultsDto>({
    queryKey: ["learning", "results"],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<StudentResultsDto>("/learning/results");
        return data;
      }, "Failed to load learning results."),
    staleTime: 30_000,
  });

export const useEnrollInLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      await api.post(`/learning/courses/${courseId}/enroll`);
      return courseId;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to enroll in course.");
    },
    onSuccess: async (courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "course", courseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "my-course-progress", courseId],
        }),
      ]);
    },
  });
};

export const useUnenrollFromLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      await api.delete(`/learning/courses/${courseId}/unenroll`);
      return courseId;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to unenroll from course.");
    },
    onSuccess: async (courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "course", courseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "my-course-progress", courseId],
        }),
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
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to enroll onboarding.");
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "upcoming-activities"],
        }),
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
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to create course.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["learning", "courses"],
      });
    },
  });
};

export const useCreateLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminCreateCourseDto) => {
      await api.post("/learning/courses", payload);
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to create course.");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["learning", "courses"],
      });
    },
  });
};

export const useUpdateLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCourseDto;
    }) => {
      await api.patch(`/learning/courses/${id}`, payload);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to update course.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "course", id] }),
      ]);
    },
  });
};

export const useDeleteLearningCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/courses/${id}`);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to delete course.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "courses"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "course", id] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-content", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-students", id],
        }),
      ]);
    },
  });
};

export const useCreateLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSectionDto) => {
      await api.post("/learning/sections", payload);
      return payload.parent_id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to create section.");
    },
    onSuccess: async (courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-content", courseId],
        }),
      ]);
    },
  });
};

export const useUpdateLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSectionDto;
    }) => {
      await api.patch(`/learning/sections/${id}`, payload);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to update section.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content", id],
        }),
      ]);
    },
  });
};

export const useDeleteLearningSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/sections/${id}`);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to delete section.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["learning", "course-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content", id],
        }),
      ]);
    },
  });
};

export const useCreateLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLessonDto) => {
      await api.post("/learning/lessons", payload);
      return payload.parent_id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to create lesson.");
    },
    onSuccess: async (sectionId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content"],
        }),
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content", sectionId],
        }),
      ]);
    },
  });
};

export const useUpdateLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLessonDto;
    }) => {
      await api.patch(`/learning/lessons/${id}`, payload);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to update lesson.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson", id] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content"],
        }),
      ]);
    },
  });
};

export const useDeleteLearningLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/learning/lessons/${id}`);
      return id;
    },
    onError: (error) => {
      showLearningApiErrorToast(error, "Failed to delete lesson.");
    },
    onSuccess: async (id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "lesson", id] }),
        queryClient.invalidateQueries({
          queryKey: ["learning", "section-content"],
        }),
      ]);
    },
  });
};

export const useLearningCourseStudents = (courseId?: number) =>
  useQuery<Record<string, unknown>[]>({
    queryKey: ["learning", "course-students", courseId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<Record<string, unknown>[]>(
          `/learning/courses/${courseId}/students`,
        );
        return data;
      }, "Failed to load course students."),
    enabled: typeof courseId === "number" && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useLearningStudentProgress = (
  courseId?: number,
  studentId?: string,
) =>
  useQuery<Record<string, unknown>>({
    queryKey: ["learning", "student-progress", courseId, studentId],
    queryFn: () =>
      withLearningErrorToast(async () => {
        const { data } = await api.get<Record<string, unknown>>(
          `/learning/courses/${courseId}/students/${studentId}/progress`,
        );
        return data;
      }, "Failed to load student progress."),
    enabled:
      typeof courseId === "number" &&
      Number.isFinite(courseId) &&
      typeof studentId === "string" &&
      studentId.trim().length > 0,
    staleTime: 30_000,
  });
