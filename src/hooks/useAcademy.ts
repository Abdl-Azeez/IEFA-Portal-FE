import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import * as academyApi from "@/lib/academyApi";

const learningToast = (title: string, description: string) =>
  toast({ title, description });

import type {
  AcademyCourseFilters,
  AcademyCategoryTypeDto,
  AcademyQuizTypeDto,
  AcademyCourseDetailsDto,
  AcademyCourseWithProgressDto,
  AcademyEnrollmentDto,
  AcademyDashboardDto,
  AcademyUpcomingActivityDto,
  AcademyQuizDto,
  AcademyLessonDto,
  AcademySectionDto,
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
} from "@/types/learning";

export const useAcademyCourses = (filters: AcademyCourseFilters = {}) =>
  useQuery<AcademyCourseDetailsDto[]>({
    queryKey: ["academy", "courses", filters],
    queryFn: () => academyApi.getAcademyCourses(filters),
    staleTime: 60_000,
  });

export const useAcademyCategoryTypes = () =>
  useQuery<AcademyCategoryTypeDto[]>({
    queryKey: ["academy", "category-types"],
    queryFn: academyApi.getAcademyCategoryTypes,
    staleTime: 60_000,
  });

export const useAcademyQuizTypes = () =>
  useQuery<AcademyQuizTypeDto[]>({
    queryKey: ["academy", "quiz-types"],
    queryFn: academyApi.getAcademyQuizTypes,
    staleTime: 60_000,
  });

export const useAcademyCourseDetails = (id?: string | number) =>
  useQuery<AcademyCourseDetailsDto>({
    queryKey: ["academy", "course", id],
    queryFn: () => academyApi.getAcademyCourseDetails(id as string | number),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 60_000,
  });

export const useAcademyCourseWithProgress = (id?: string | number) =>
  useQuery<AcademyCourseWithProgressDto>({
    queryKey: ["academy", "course-with-progress", id],
    queryFn: () =>
      academyApi.getAcademyCourseDetailsWithProgress(id as string | number),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 60_000,
  });

export const useEnrollInAcademyCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string | number) =>
      academyApi.enrollInAcademyCourse(courseId),
    onSuccess: async (_data, courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["academy", "enrollments"] }),
        queryClient.invalidateQueries({ queryKey: ["academy", "dashboard"] }),
        queryClient.invalidateQueries({
          queryKey: ["academy", "course", courseId],
        }),
      ]);
      toast({
        title: "Enrolled",
        description: "You have been enrolled successfully.",
      });
    },
  });
};

export const useAcademyMyEnrollments = () =>
  useQuery<AcademyEnrollmentDto[]>({
    queryKey: ["academy", "enrollments"],
    queryFn: academyApi.getAcademyMyEnrollments,
    staleTime: 30_000,
  });

export const useAcademyDashboard = () =>
  useQuery<AcademyDashboardDto>({
    queryKey: ["academy", "dashboard"],
    queryFn: academyApi.getAcademyDashboard,
    staleTime: 30_000,
  });

export const useAcademyUpcomingActivities = () =>
  useQuery<AcademyUpcomingActivityDto[]>({
    queryKey: ["academy", "upcoming-activities"],
    queryFn: academyApi.getAcademyUpcomingActivities,
    staleTime: 30_000,
  });

export const useCompleteAcademyLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string | number) =>
      academyApi.completeAcademyLesson(lessonId),
    onSuccess: async () => {
      learningToast("Lesson complete", "Lesson marked as complete.");
      await queryClient.invalidateQueries({ queryKey: ["academy"] });
    },
  });
};

export const useStartAcademyQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string | number) =>
      academyApi.startAcademyQuiz(quizId),
    onSuccess: async () => {
      learningToast("Quiz started", "Quiz attempt started successfully.");
      await queryClient.invalidateQueries({ queryKey: ["academy"] });
    },
  });
};

export const useSubmitAcademyAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input:
        | string
        | number
        | { attemptId: string | number; payload?: Record<string, unknown> },
    ) => {
      if (typeof input === "object" && input !== null && "attemptId" in input) {
        return academyApi.submitAcademyAttempt(input.attemptId, input.payload);
      }
      return academyApi.submitAcademyAttempt(input);
    },
    onSuccess: async () => {
      learningToast("Quiz submitted", "Attempt submitted successfully.");
      await queryClient.invalidateQueries({ queryKey: ["academy"] });
    },
  });
};

export const useAcademyQuiz = (quizId?: string | number) =>
  useQuery<AcademyQuizDto>({
    queryKey: ["academy", "quiz", quizId],
    queryFn: () => academyApi.getAcademyQuiz(quizId as string | number),
    enabled: quizId !== undefined && quizId !== null && quizId !== "",
    staleTime: 60_000,
  });

export const useAcademyLesson = (lessonId?: string | number) =>
  useQuery<AcademyLessonDto>({
    queryKey: ["academy", "lesson", lessonId],
    queryFn: () => academyApi.getAcademyLesson(lessonId as string | number),
    enabled: lessonId !== undefined && lessonId !== null && lessonId !== "",
    staleTime: 60_000,
  });

export const useAcademySection = (sectionId?: string | number) =>
  useQuery<AcademySectionDto>({
    queryKey: ["academy", "section", sectionId],
    queryFn: () => academyApi.getAcademySection(sectionId as string | number),
    enabled: sectionId !== undefined && sectionId !== null && sectionId !== "",
    staleTime: 60_000,
  });

export const useInstructorAcademyCourses = () =>
  useQuery<AcademyInstructorCourseDto[]>({
    queryKey: ["instructor", "academy", "courses"],
    queryFn: academyApi.instructorGetCourses,
    staleTime: 60_000,
  });

export const useInstructorCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AcademyInstructorCreateCourseDto) =>
      academyApi.instructorCreateCourse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy", "courses"],
      });
      learningToast(
        "Course created",
        "Your course has been created successfully.",
      );
    },
  });
};

export const useInstructorAddSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId: string | number;
      payload: AcademyInstructorCreateSectionDto;
    }) => academyApi.instructorAddSection(courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Section added", "Section created successfully.");
    },
  });
};

export const useInstructorAddLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sectionId,
      payload,
    }: {
      sectionId: string | number;
      payload: AcademyInstructorCreateLessonDto;
    }) => academyApi.instructorAddLesson(sectionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Lesson added", "Lesson created successfully.");
    },
  });
};

export const useInstructorAddQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId: string | number;
      payload: AcademyInstructorCreateQuizDto;
    }) => academyApi.instructorAddQuiz(courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Quiz added", "Quiz created successfully.");
    },
  });
};

export const useInstructorUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: AcademyInstructorUpdateQuizDto;
    }) => academyApi.instructorUpdateQuiz(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Quiz updated", "Quiz updated successfully.");
    },
  });
};

export const useInstructorDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) =>
      academyApi.instructorDeleteQuiz(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Quiz deleted", "Quiz deleted successfully.");
    },
  });
};

export const useInstructorAddQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quizId,
      payload,
    }: {
      quizId: string | number;
      payload: Record<string, unknown>;
    }) => academyApi.instructorAddQuestion(quizId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Question added", "Question created successfully.");
    },
  });
};

export const useInstructorUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      payload,
    }: {
      questionId: string | number;
      payload: AcademyInstructorUpdateQuestionDto;
    }) => academyApi.instructorUpdateQuestion(questionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Question updated", "Question updated successfully.");
    },
  });
};

export const useInstructorDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string | number) =>
      academyApi.instructorDeleteQuestion(questionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Question deleted", "Question deleted successfully.");
    },
  });
};

export const useInstructorAddOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      payload,
    }: {
      questionId: string | number;
      payload: Record<string, unknown>;
    }) => academyApi.instructorAddOption(questionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Option added", "Option created successfully.");
    },
  });
};

export const useInstructorUpdateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: AcademyInstructorUpdateOptionDto;
    }) => academyApi.instructorUpdateOption(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Option updated", "Option updated successfully.");
    },
  });
};

export const useInstructorDeleteOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) =>
      academyApi.instructorDeleteOption(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy"],
      });
      learningToast("Option deleted", "Option deleted successfully.");
    },
  });
};

export const useInstructorQuizAttempts = (quizId?: string | number) =>
  useQuery<AcademyQuizAttemptDto[]>({
    queryKey: ["instructor", "academy", "quiz-attempts", quizId],
    queryFn: () =>
      academyApi.instructorGetQuizAttempts(quizId as string | number),
    enabled: quizId !== undefined && quizId !== null && quizId !== "",
    staleTime: 60_000,
  });

export const useInstructorCourseDetails = (id?: string | number) =>
  useQuery<AcademyInstructorCourseDto>({
    queryKey: ["instructor", "academy", "course", id],
    queryFn: () => academyApi.instructorGetCourseDetails(id as string | number),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 60_000,
  });

export const useInstructorUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: AcademyInstructorCourseUpdateDto;
    }) => academyApi.instructorUpdateCourse(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy", "courses"],
      });
      learningToast("Course updated", "Course updated successfully.");
    },
  });
};

export const useInstructorSuspendCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) =>
      academyApi.instructorSuspendCourse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy", "courses"],
      });
      learningToast("Course suspended", "Course suspended successfully.");
    },
  });
};

export const useInstructorDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) =>
      academyApi.instructorDeleteCourse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["instructor", "academy", "courses"],
      });
      learningToast("Course deleted", "Course deleted successfully.");
    },
  });
};

export const useInstructorQuizDetails = (quizId?: string | number) =>
  useQuery<AcademyQuizDetailsDto>({
    queryKey: ["instructor", "academy", "quiz-details", quizId],
    queryFn: () =>
      academyApi.instructorGetQuizDetails(quizId as string | number),
    enabled: quizId !== undefined && quizId !== null && quizId !== "",
    staleTime: 60_000,
  });

export const useInstructorSectionDetails = (sectionId?: string | number) =>
  useQuery<AcademySectionDetailsDto>({
    queryKey: ["instructor", "academy", "section-details", sectionId],
    queryFn: () =>
      academyApi.instructorGetSectionDetails(sectionId as string | number),
    enabled: sectionId !== undefined && sectionId !== null && sectionId !== "",
    staleTime: 60_000,
  });

export const useInstructorLessonDetails = (lessonId?: string | number) =>
  useQuery<AcademyLessonDetailsDto>({
    queryKey: ["instructor", "academy", "lesson-details", lessonId],
    queryFn: () =>
      academyApi.instructorGetLessonDetails(lessonId as string | number),
    enabled: lessonId !== undefined && lessonId !== null && lessonId !== "",
    staleTime: 60_000,
  });

// ── Admin Academy Hooks ────────────────────────────────────────────────────

export const useAdminAcademyCourses = () =>
  useQuery<AcademyInstructorCourseDto[]>({
    queryKey: ["admin", "academy", "courses"],
    queryFn: academyApi.adminGetAllCourses,
    staleTime: 60_000,
  });

export const useAdminCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: AcademyInstructorCreateCourseDto & { instructorId?: string },
    ) => academyApi.adminCreateCourse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "academy", "courses"],
      });
      learningToast(
        "Course created",
        "The course has been created successfully.",
      );
    },
  });
};

export const useAdminCourseEnrollments = (courseId?: string | number) =>
  useQuery<AdminCourseEnrollmentDto[]>({
    queryKey: ["admin", "academy", "enrollments", courseId],
    queryFn: () =>
      academyApi.adminGetCourseEnrollments(courseId as string | number),
    enabled: courseId !== undefined && courseId !== null && courseId !== "",
    staleTime: 30_000,
  });

export const useAdminMakeInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      academyApi.adminMakeUserInstructor(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "academy"] });
      learningToast(
        "Instructor assigned",
        "User has been granted instructor access.",
      );
    },
  });
};

export const useAdminSuspendCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string | number) =>
      academyApi.adminSuspendCourse(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "academy", "courses"],
      });
      learningToast("Course suspended", "The course has been suspended.");
    },
  });
};

export const useAdminUnsuspendCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string | number) =>
      academyApi.adminUnsuspendCourse(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "academy", "courses"],
      });
      learningToast("Course unsuspended", "The course has been reactivated.");
    },
  });
};
