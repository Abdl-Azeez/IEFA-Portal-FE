/**
 * useAdmin.ts
 * All admin-facing API hooks (TanStack Query mutations + queries).
 * Covers: Users, News, Podcasts, Research Reports, Datasets.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

export interface PageMeta {
  page: number
  perPage: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}

export interface ListParams {
  page?: number
  perPage?: number
  search?: string
  order?: 'ASC' | 'DESC'
}

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  username?: string | null;
  lmsStudentId?: string | null;
  firstName: string;
  lastName: string;
  role: "student" | "instructor" | "admin" | "staff";
  isModerator?: boolean;
  phone?: string;
  country?: string;
  profilePhotoUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListParams extends ListParams {
  role?: "student" | "instructor" | "admin" | "staff";
  name?: string;
}

export const useAdminUsers = (params: UsersListParams = {}) =>
  useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await api.get<Page<AdminUser>>("/users", { params });
      return data;
    },
  });

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: ["admin", "users", id],
    queryFn: async () => {
      const { data } = await api.get<AdminUser>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useAdminUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: {
        username?: string;
        lmsStudentId?: string | null;
        firstName?: string;
        lastName?: string;
        phone?: string;
        country?: string;
        profilePhotoUrl?: string;
      };
    }) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminVerifyUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/verify`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User verified" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Verify failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/deactivate`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User deactivated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Deactivate failed",
        variant: "destructive",
      }),
  });
};

export const useAdminActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/activate`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "User activated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Activate failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string;
      role: AdminUser["role"];
    }) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/role`, {
        role,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Role updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminToggleModerator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isModerator,
    }: {
      id: string;
      isModerator: boolean;
    }) => {
      const { data } = await api.patch<{ isModerator: boolean }>(`/users/${id}/moderator`, {
        isModerator,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Moderator status updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// News
// ─────────────────────────────────────────────────────────────────────────────

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
}

export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  status: "draft" | "published";
  isFeatured?: boolean;
  tagNames: string[];
  tags: NewsTag[];
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string; lastName: string; email: string };
}

export interface NewsListParams extends ListParams {
  status?: "draft" | "published";
  tags?: string[];
}

export interface CreateNewsDto {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  status?: "draft" | "published";
  tagNames?: string[];
  publishedAt?: string;
}

export const useAdminNews = (params: NewsListParams = {}) =>
  useQuery({
    queryKey: ["admin", "news", params],
    queryFn: async () => {
      const { data } = await api.get<Page<AdminNewsItem>>("/news", { params });
      return data;
    },
  });

export const useAdminNewsTags = () =>
  useQuery({
    queryKey: ["admin", "news", "tags"],
    queryFn: async () => {
      const { data } = await api.get<NewsTag[]>("/news/tags/all");
      return data;
    },
  });

export const useAdminCreateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateNewsDto) => {
      const { data } = await api.post<AdminNewsItem>("/news", dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      toast({ title: "Article created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateNewsDto>;
    }) => {
      const { data } = await api.patch<AdminNewsItem>(`/news/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      toast({ title: "Article updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/news/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      toast({ title: "Article deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminToggleFeaturedNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isFeatured,
    }: {
      id: string;
      isFeatured: boolean;
    }) => {
      const { data } = await api.patch<AdminNewsItem>(`/news/${id}/feature`, {
        isFeatured,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "news"] });
      toast({ title: "Featured status updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Podcasts
// ─────────────────────────────────────────────────────────────────────────────

export interface PodcastShow {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  category?: string;
  rssFeedUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  episodeNumber?: number;
  season?: number;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  show?: PodcastShow;
}

export interface ShowListParams extends ListParams {
  startDate?: string;
  endDate?: string;
}

export interface CreateShowDto {
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  category?: string;
  rssFeedUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
}

export interface CreateEpisodeDto {
  title: string;
  slug?: string;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  episodeNumber?: number;
  season?: number;
  isPublished?: boolean;
  publishedAt?: string;
}

export const useAdminShows = (params: ShowListParams = {}) =>
  useQuery({
    queryKey: ["admin", "shows", params],
    queryFn: async () => {
      const { data } = await api.get<Page<PodcastShow>>("/podcasts/shows", {
        params,
      });
      return data;
    },
  });

export const useAdminShowEpisodes = (showId: string) =>
  useQuery({
    queryKey: ["admin", "episodes", showId],
    queryFn: async () => {
      const { data } = await api.get<PodcastEpisode[]>(
        `/podcasts/shows/${showId}/episodes`,
      );
      return data;
    },
    enabled: !!showId,
  });

export const useAdminCreateShow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateShowDto) => {
      const { data } = await api.post<PodcastShow>("/podcasts/shows", dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast({ title: "Show created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateShow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateShowDto>;
    }) => {
      const { data } = await api.patch<PodcastShow>(
        `/podcasts/shows/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast({ title: "Show updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteShow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/podcasts/shows/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast({ title: "Show deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminCreateEpisode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      showId,
      dto,
    }: {
      showId: string;
      dto: CreateEpisodeDto;
    }) => {
      const { data } = await api.post<PodcastEpisode>(
        `/podcasts/shows/${showId}/episodes`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "episodes"] });
      toast({ title: "Episode created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateEpisode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateEpisodeDto>;
    }) => {
      const { data } = await api.patch<PodcastEpisode>(
        `/podcasts/episodes/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "episodes"] });
      toast({ title: "Episode updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteEpisode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/podcasts/episodes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "episodes"] });
      toast({ title: "Episode deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Research Reports
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface ResearchReport {
  id: string;
  title: string;
  slug: string;
  abstract?: string;
  bodyHtml?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  externalUrl?: string;
  fileSizeKb?: number;
  pageCount?: number;
  language?: string;
  publisher?: string;
  publishedYear?: number;
  doi?: string;
  isDownloadable: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  status: "draft" | "review" | "published" | "archived";
  reportType:
    | "whitepaper"
    | "case_study"
    | "market_report"
    | "academic_paper"
    | "policy_brief"
    | "annual_report";
  tags: string[];
  viewCount: number;
  downloadCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: ReportCategory;
}

export interface ResearchListParams extends ListParams {
  status?: "draft" | "review" | "published" | "archived";
  reportType?: string;
  categoryId?: string;
  isPremium?: boolean;
}

export interface CreateResearchDto {
  title: string;
  slug?: string;
  abstract?: string;
  bodyHtml?: string;
  categoryId: string;
  reportType?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  externalUrl?: string;
  fileSizeKb?: number;
  pageCount?: number;
  language?: string;
  publisher?: string;
  publishedYear?: number;
  doi?: string;
  isDownloadable?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  status?: "draft" | "review" | "published" | "archived";
  publishedAt?: string;
}

export const useAdminResearchReports = (params: ResearchListParams = {}) =>
  useQuery({
    queryKey: ["admin", "research", params],
    queryFn: async () => {
      const { data } = await api.get<Page<ResearchReport>>(
        "/research-reports",
        { params },
      );
      return data;
    },
  });

export const useAdminReportCategories = () =>
  useQuery({
    queryKey: ["admin", "research", "categories"],
    queryFn: async () => {
      const { data } = await api.get<ReportCategory[]>(
        "/research-reports/categories/all",
      );
      return data;
    },
  });

export const useAdminCreateResearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateResearchDto) => {
      const { data } = await api.post<ResearchReport>("/research-reports", dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "research"] });
      toast({ title: "Report created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateResearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateResearchDto>;
    }) => {
      const { data } = await api.patch<ResearchReport>(
        `/research-reports/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "research"] });
      toast({ title: "Report updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteResearch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/research-reports/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "research"] });
      toast({ title: "Report deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminCreateReportCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      name: string;
      slug?: string;
      description?: string;
      sortOrder?: number;
    }) => {
      const { data } = await api.post<ReportCategory>(
        "/research-reports/categories",
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "research", "categories"] });
      toast({ title: "Category created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteReportCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/research-reports/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "research", "categories"] });
      toast({ title: "Category deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────────────────────────────────────

export type AdminResourceType = "guide" | "research" | "standard" | "tool";
export type AdminResourceStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived";

export interface AdminResourceCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: AdminResourceCategory | null;
  children?: AdminResourceCategory[];
}

export interface AdminResource {
  id: string;
  title: string;
  resourceType: AdminResourceType;
  authorName: string | null;
  authorType: "individual" | "organization" | null;
  topic: string | null;
  briefIntro: string | null;
  coverImageUrl: string | null;
  fileUrl: string | null;
  previewUrl: string | null;
  categoryId: string | null;
  category: AdminResourceCategory | null;
  subCategoryId?: string | null;
  subCategory?: AdminResourceCategory | null;
  languages?: string[];
  publishedYear?: number | null;
  regulatoryBodyId?: string | null;
  regulatoryBody?: { id: string; name: string } | null;
  isRegulatory?: boolean;
  documentType?: string | null;
  documentFormat?: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  status: AdminResourceStatus;
  tags: string[];
  viewCount: number;
  downloadCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  letter?: string;
  status: "draft" | "published";
  relatedTerms?: string[];
  createdAt: string;
}

export interface CreateResourceDto {
  title: string;
  slug?: string;
  description?: string;
  bodyHtml?: string;
  resourceType: AdminResourceType;
  thumbnailUrl?: string;
  attachmentUrl?: string;
  externalUrl?: string;
  fileSizeKb?: number;
  pageCount?: number;
  language?: string;
  authorName?: string;
  publisher?: string;
  publishedYear?: number;
  isDownloadable?: boolean;
  authorType?: "individual" | "organization";
  topic?: string;
  briefIntro?: string;
  coverImageUrl?: string;
  fileUrl?: string;
  previewUrl?: string;
  categoryId?: string;
  subCategoryId?: string;
  languages?: string[];
  regulatoryBodyId?: string;
  isRegulatory?: boolean;
  documentType?: string;
  documentFormat?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  status?: AdminResourceStatus;
  publishedAt?: string;
  tags?: string[];
}

export interface CreateGlossaryTermDto {
  term: string;
  definition: string;
  letter?: string;
  status?: "draft" | "published";
  relatedTerms?: string[];
}

export interface ResourceListParams extends ListParams {
  status?: AdminResourceStatus;
  resourceType?: AdminResourceType;
  resourceTypes?: string;
  categoryId?: string;
  isPremium?: boolean;
  languages?: string;
  publishedYearFrom?: number;
  publishedYearTo?: number;
  regulatoryBodyId?: string;
  isRegulatory?: boolean;
}

export interface GlossaryListParams {
  letter?: string;
  status?: "draft" | "published";
  search?: string;
}

export const useAdminResources = (params: ResourceListParams = {}) =>
  useQuery({
    queryKey: ["admin", "resources", params],
    queryFn: async () => {
      const { data } = await api.get<Page<AdminResource>>("/resources", {
        params: { page: 1, perPage: 50, order: "DESC", ...params },
      });
      return data;
    },
  });

export const useAdminResourceCategories = () =>
  useQuery({
    queryKey: ["admin", "resources", "categories"],
    queryFn: async () => {
      const { data } = await api.get<AdminResourceCategory[]>(
        "/resources/categories",
      );
      return data;
    },
  });

export interface AdminRegulatoryBody {
  id: string;
  name: string;
  fullName?: string;
  logoUrl?: string;
  color?: string;
  description?: string;
}

export interface CreateRegulatoryBodyDto {
  name: string;
  fullName?: string;
  description?: string;
  logoUrl?: string;
}

export const useAdminResourceRegulatoryBodies = () =>
  useQuery({
    queryKey: ["admin", "resources", "regulatory-bodies"],
    queryFn: async () => {
      const { data } = await api.get<AdminRegulatoryBody[]>(
        "/resources/regulatory-bodies",
      );
      return data;
    },
  });

export const useAdminCreateResourceRegulatoryBody = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateRegulatoryBodyDto) => {
      const { data } = await api.post<AdminRegulatoryBody>(
        "/resources/regulatory-bodies",
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "regulatory-bodies"] });
      qc.invalidateQueries({ queryKey: ["resources", "regulatory-bodies"] });
      toast({ title: "Regulatory body created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateResourceRegulatoryBody = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateRegulatoryBodyDto>;
    }) => {
      const { data } = await api.patch<AdminRegulatoryBody>(
        `/resources/regulatory-bodies/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "regulatory-bodies"] });
      qc.invalidateQueries({ queryKey: ["resources", "regulatory-bodies"] });
      toast({ title: "Regulatory body updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteResourceRegulatoryBody = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/resources/regulatory-bodies/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "regulatory-bodies"] });
      qc.invalidateQueries({ queryKey: ["resources", "regulatory-bodies"] });
      toast({ title: "Regulatory body deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminGlossaryTerms = (params: GlossaryListParams = {}) =>
  useQuery({
    queryKey: ["admin", "resources", "glossary", params],
    queryFn: async () => {
      const requestParams = params.letter
        ? { letter: params.letter.toUpperCase() }
        : undefined;
      const { data } = await api.get<AdminGlossaryTerm[]>(
        "/resources/glossary",
        { params: requestParams },
      );
      let terms = data.map((term) => ({
        ...term,
        status: term.status ?? "published",
      }));
      if (params.search) {
        const q = params.search.toLowerCase();
        terms = terms.filter(
          (term) =>
            term.term.toLowerCase().includes(q) ||
            term.definition.toLowerCase().includes(q),
        );
      }
      if (params.status) {
        terms = terms.filter((term) => term.status === params.status);
      }
      return terms;
    },
  });

export const useAdminCreateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateResourceDto) => {
      const { data } = await api.post<AdminResource>("/resources", dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast({ title: "Resource created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateResourceDto>;
    }) => {
      const { data } = await api.patch<AdminResource>(`/resources/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast({ title: "Resource updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast({ title: "Resource deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminCreateGlossaryTerm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateGlossaryTermDto) => {
      const { data } = await api.post<AdminGlossaryTerm>(
        "/resources/glossary",
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "glossary"] });
      toast({ title: "Term created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateGlossaryTerm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateGlossaryTermDto>;
    }) => {
      const { data } = await api.patch<AdminGlossaryTerm>(
        `/resources/glossary/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "glossary"] });
      toast({ title: "Term updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteGlossaryTerm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/resources/glossary/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "resources", "glossary"] });
      toast({ title: "Term deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Resource Categories CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const useAdminCreateResourceCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { name: string; parentId?: string }) => {
      const { data } = await api.post<AdminResourceCategory>('/resources/categories', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'categories'] });
      qc.invalidateQueries({ queryKey: ['resources', 'categories'] });
      toast({ title: 'Category created' });
    },
    onError: (e: any) =>
      toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  });
};

export const useAdminUpdateResourceCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: { name?: string; parentId?: string } }) => {
      const { data } = await api.patch<AdminResourceCategory>(`/resources/categories/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'categories'] });
      qc.invalidateQueries({ queryKey: ['resources', 'categories'] });
      toast({ title: 'Category updated' });
    },
    onError: (e: any) =>
      toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  });
};

export const useAdminDeleteResourceCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/resources/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'categories'] });
      qc.invalidateQueries({ queryKey: ['resources', 'categories'] });
      toast({ title: 'Category deleted' });
    },
    onError: (e: any) =>
      toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Pending user resource submissions
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingResourceSubmission {
  id: string;
  title: string;
  briefIntro: string | null;
  fileUrl: string;
  coverImageUrl: string | null;
  authorName: string | null;
  categoryId: string;
  category: AdminResourceCategory | null;
  subCategoryId: string | null;
  subCategory: AdminResourceCategory | null;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submitter?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
}

export const useAdminPendingResources = () =>
  useQuery({
    queryKey: ['admin', 'resources', 'pending'],
    queryFn: async () => {
      const { data } = await api.get<PendingResourceSubmission[]>('/resources/submissions/pending');
      return data;
    },
  });

export const useAdminApproveResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<PendingResourceSubmission>(`/resources/submissions/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'pending'] });
      qc.invalidateQueries({ queryKey: ['admin', 'resources'] });
      toast({ title: 'Resource approved and published' });
    },
    onError: (e: any) =>
      toast({ title: 'Error', description: e.response?.data?.message ?? 'Approve failed', variant: 'destructive' }),
  });
};

export const useAdminRejectResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.patch<PendingResourceSubmission>(`/resources/submissions/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'pending'] });
      toast({ title: 'Resource rejected' });
    },
    onError: (e: any) =>
      toast({ title: 'Error', description: e.response?.data?.message ?? 'Reject failed', variant: 'destructive' }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Datasets
// ─────────────────────────────────────────────────────────────────────────────

export interface DataCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

export interface Dataset {
  id: string;
  title: string;
  slug: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  geography?: string;
  timePeriodFrom?: string;
  timePeriodTo?: string;
  frequency?:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "annual"
    | "one_time";
  format?: string;
  fileUrl?: string;
  fileSizeKb?: number;
  isDownloadable: boolean;
  isPremium: boolean;
  tags: string[];
  status: "draft" | "published" | "archived";
  viewCount: number;
  downloadCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: DataCategory;
}

export interface DatasetListParams extends ListParams {
  status?: "draft" | "published" | "archived";
  frequency?: string;
  categoryId?: string;
  isPremium?: boolean;
}

export interface CreateDatasetDto {
  title: string;
  slug?: string;
  description?: string;
  categoryId: string;
  source?: string;
  sourceUrl?: string;
  geography?: string;
  timePeriodFrom?: string;
  timePeriodTo?: string;
  frequency?: string;
  format?: string;
  fileUrl?: string;
  fileSizeKb?: number;
  isDownloadable?: boolean;
  isPremium?: boolean;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  publishedAt?: string;
}

export const useAdminDatasets = (params: DatasetListParams = {}) =>
  useQuery({
    queryKey: ["admin", "datasets", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Dataset>>("/datasets", { params });
      return data;
    },
  });

export const useAdminDataCategories = () =>
  useQuery({
    queryKey: ["admin", "datasets", "categories"],
    queryFn: async () => {
      const { data } = await api.get<DataCategory[]>(
        "/datasets/categories/all",
      );
      return data;
    },
  });

export const useAdminDataCategory = (id: string) =>
  useQuery({
    queryKey: ["admin", "datasets", "categories", id],
    queryFn: async () => {
      const { data } = await api.get<DataCategory>(`/datasets/categories/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useAdminCreateDataset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateDatasetDto) => {
      const { data } = await api.post<Dataset>("/datasets", dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets"] });
      toast({ title: "Dataset created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateDataset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateDatasetDto>;
    }) => {
      const { data } = await api.patch<Dataset>(`/datasets/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets"] });
      toast({ title: "Dataset updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteDataset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets"] });
      toast({ title: "Dataset deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminCreateDataCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      name: string;
      slug?: string;
      description?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      const { data } = await api.post<DataCategory>(
        "/datasets/categories",
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets", "categories"] });
      toast({ title: "Category created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateDataCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: { name?: string; slug?: string; description?: string; icon?: string; sortOrder?: number };
    }) => {
      const { data } = await api.patch<DataCategory>(
        `/datasets/categories/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets", "categories"] });
      toast({ title: "Category updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteDataCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/datasets/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "datasets", "categories"] });
      toast({ title: "Category deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// IF Professionals
// ─────────────────────────────────────────────────────────────────────────────

export type CareerLevel = "Early career" | "Mid career" | "Senior";
export type ProfessionalScope = "Local" | "Global";
export type VerificationStatus = "Verified" | "Pending" | "Unverified";

type ApiCareerLevel = "Early (0-6 yrs)" | "Mid (7-14 yrs)" | "Senior (15+ yrs)";
type ApiVerificationStatus = "approved" | "pending" | "rejected";

interface ApiProfessional {
  id: string;
  fullName: string;
  organization?: string;
  linkedInUrl?: string;
  linkedinUrl?: string;
  role?: string;
  location?: string;
  description?: string;
  seniority?: ApiCareerLevel | CareerLevel;
  locationType?: ProfessionalScope;
  scope?: ProfessionalScope;
  resumeUrl?: string;
  profileImageUrl?: string;
  verificationStatus?: ApiVerificationStatus | VerificationStatus;
  status?: ApiVerificationStatus;
  approvalStatus?: ApiVerificationStatus;
  isApproved?: boolean;
  isVerified?: boolean;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFProfessional {
  id: string;
  fullName: string;
  organization?: string;
  linkedinUrl?: string;
  role?: string;
  location?: string;
  description?: string;
  seniority?: CareerLevel;
  resumeUrl?: string;
  scope?: ProfessionalScope;
  verificationStatus?: VerificationStatus;
  isVerified?: boolean;
  rejectedReason?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFProfessionalsListParams extends ListParams {
  seniority?: CareerLevel;
}

export interface CreateIFProfessionalDto {
  fullName: string;
  organization?: string;
  linkedinUrl?: string;
  role?: string;
  location?: string;
  description?: string;
  seniority?: CareerLevel;
  resumeUrl?: string;
  scope?: ProfessionalScope;
  verificationStatus?: VerificationStatus;
  profileImageUrl?: string;
}

interface ApiCreateProfessionalDto {
  fullName: string;
  organization?: string;
  linkedInUrl?: string;
  role?: string;
  location?: string;
  description?: string;
  seniority?: ApiCareerLevel;
  locationType?: ProfessionalScope;
  profileImageUrl?: string;
  resumeUrl?: string;
}

interface ApiRejectProfessionalDto {
  reason: string;
}

const toUiCareerLevel = (
  seniority?: ApiCareerLevel | CareerLevel,
): CareerLevel | undefined => {
  if (!seniority) return undefined;
  if (seniority === "Early (0-6 yrs)") return "Early career";
  if (seniority === "Mid (7-14 yrs)") return "Mid career";
  if (seniority === "Senior (15+ yrs)") return "Senior";
  return seniority;
};

const toApiCareerLevel = (
  seniority?: CareerLevel,
): ApiCareerLevel | undefined => {
  if (!seniority) return undefined;
  if (seniority === "Early career") return "Early (0-6 yrs)";
  if (seniority === "Mid career") return "Mid (7-14 yrs)";
  return "Senior (15+ yrs)";
};

const toUiVerificationStatus = (
  profile: ApiProfessional,
): VerificationStatus | undefined => {
  const status =
    profile.verificationStatus ?? profile.status ?? profile.approvalStatus;
  if (status === "approved") return "Verified";
  if (status === "pending") return "Pending";
  if (status === "rejected") return "Unverified";
  if (
    status === "Verified" ||
    status === "Pending" ||
    status === "Unverified"
  ) {
    return status;
  }
  if (profile.isApproved === true || profile.isVerified === true)
    return "Verified";
  if (profile.isApproved === false || profile.isVerified === false)
    return "Unverified";
  return undefined;
};

const toUiProfessional = (profile: ApiProfessional): IFProfessional => ({
  id: profile.id,
  fullName: profile.fullName,
  organization: profile.organization,
  linkedinUrl: profile.linkedInUrl ?? profile.linkedinUrl,
  role: profile.role,
  location: profile.location,
  description: profile.description,
  seniority: toUiCareerLevel(profile.seniority),
  resumeUrl: profile.resumeUrl,
  scope: profile.locationType ?? profile.scope,
  verificationStatus: toUiVerificationStatus(profile),
  isVerified: profile.isVerified,
  rejectedReason: profile.rejectedReason,
  profileImageUrl: profile.profileImageUrl,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const toApiCreateDto = (
  dto: Partial<CreateIFProfessionalDto>,
): Partial<ApiCreateProfessionalDto> => ({
  fullName: dto.fullName,
  organization: dto.organization,
  linkedInUrl: dto.linkedinUrl,
  role: dto.role,
  location: dto.location,
  description: dto.description,
  seniority: toApiCareerLevel(dto.seniority),
  locationType: dto.scope,
  profileImageUrl: dto.profileImageUrl,
  resumeUrl: dto.resumeUrl,
});

// Public (user-facing) — GET /professionals returns array
export const useProfessionals = () =>
  useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data } = await api.get<ApiProfessional[]>("/professionals");
      return data.map(toUiProfessional);
    },
  });

export const useCreateProfessionalProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateIFProfessionalDto) => {
      const { data } = await api.post<ApiProfessional>(
        "/professionals/add-yourself",
        toApiCreateDto(dto),
      );
      return toUiProfessional(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      toast({
        title: "Profile submitted",
        description: "Your profile will appear after review.",
      });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Submission failed",
        variant: "destructive",
      }),
  });
};

export const useAdminIFProfessionals = () =>
  useQuery({
    queryKey: ["admin", "professionals"],
    queryFn: async () => {
      const { data } = await api.get<ApiProfessional[]>("/professionals");
      return data.map(toUiProfessional);
    },
  });

export const useAdminPendingIFProfessionals = () =>
  useQuery({
    queryKey: ["admin", "professionals", "pending"],
    queryFn: async () => {
      const { data } = await api.get<ApiProfessional[]>(
        "/professionals/pending",
      );
      return data.map(toUiProfessional);
    },
  });

export const useAdminGetProfessional = (id: string) =>
  useQuery({
    queryKey: ["admin", "professionals", id],
    queryFn: async () => {
      const { data } = await api.get<ApiProfessional>(`/professionals/${id}`);
      return toUiProfessional(data);
    },
    enabled: !!id,
  });

export const useAdminCreateIFProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateIFProfessionalDto) => {
      const { data } = await api.post<ApiProfessional>(
        "/professionals",
        toApiCreateDto(dto),
      );
      return toUiProfessional(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      toast({ title: "Professional created" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Create failed",
        variant: "destructive",
      }),
  });
};

export const useAdminUpdateIFProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateIFProfessionalDto>;
    }) => {
      const { data } = await api.patch<ApiProfessional>(
        `/professionals/${id}`,
        toApiCreateDto(dto),
      );
      return toUiProfessional(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      toast({ title: "Professional updated" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Update failed",
        variant: "destructive",
      }),
  });
};

export const useAdminDeleteIFProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/professionals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      toast({ title: "Professional deleted" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Delete failed",
        variant: "destructive",
      }),
  });
};

export const useAdminApproveIFProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiProfessional>(
        `/professionals/${id}/approve`,
      );
      return toUiProfessional(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      qc.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Professional approved" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Approve failed",
        variant: "destructive",
      }),
  });
};

export const useAdminRejectIFProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const payload: ApiRejectProfessionalDto = { reason };
      const { data } = await api.patch<ApiProfessional>(
        `/professionals/${id}/reject`,
        payload,
      );
      return toUiProfessional(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "professionals"] });
      qc.invalidateQueries({ queryKey: ["admin", "professionals", "pending"] });
      qc.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Professional rejected" });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.response?.data?.message ?? "Reject failed",
        variant: "destructive",
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Uploads (CSV via multipart/form-data)
// ─────────────────────────────────────────────────────────────────────────────

export const useAdminBulkUploadDatasets = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/datasets/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets'] });
      toast({ title: 'Datasets uploaded successfully' });
    },
    onError: (e: any) =>
      toast({
        title: 'Upload failed',
        description: e.response?.data?.message ?? 'Failed to process file',
        variant: 'destructive',
      }),
  });
};

export const useAdminBulkUploadDirectory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/directory/listings/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'directory'] });
      toast({ title: 'Directory listings uploaded successfully' });
    },
    onError: (e: any) =>
      toast({
        title: 'Upload failed',
        description: e.response?.data?.message ?? 'Failed to process file',
        variant: 'destructive',
      }),
  });
};

export const useAdminBulkUploadResources = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/resources/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources'] });
      toast({ title: 'Resources uploaded successfully' });
    },
    onError: (e: any) =>
      toast({
        title: 'Upload failed',
        description: e.response?.data?.message ?? 'Failed to process file',
        variant: 'destructive',
      }),
  });
};

export const useAdminBulkUploadGlossary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/resources/glossary/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'resources', 'glossary'] });
      toast({ title: 'Glossary terms uploaded successfully' });
    },
    onError: (e: any) =>
      toast({
        title: 'Upload failed',
        description: e.response?.data?.message ?? 'Failed to process file',
        variant: 'destructive',
      }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Market Insights
// ─────────────────────────────────────────────────────────────────────────────

export interface FearAndGreed {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

export interface MarketInsightLocalNews {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  status?: string;
  viewCount?: number;
  isFeatured?: boolean;
  tags?: { id: string; name: string; slug: string; usageCount: number }[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketInsightExternalNews {
  id: string;
  title: string;
  link: string;
  pubDate?: string;
  status?: string;
  isExternal?: boolean;
  source?: string;
  excerpt?: string;
}

export interface MarketInsightsDashboard {
  cryptoMarkets: Record<string, unknown>[];
  fearAndGreed: FearAndGreed;
  africanStocks: Record<string, unknown>[];
  localNews: MarketInsightLocalNews[];
  externalNews: MarketInsightExternalNews[];
  lastUpdated: string;
}

export const useMarketInsightsDashboard = () =>
  useQuery({
    queryKey: ["market-insights", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<MarketInsightsDashboard>(
        "/market-insights/dashboard",
      );
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

// ─────────────────────────────────────────────────────────────────────────────
// File upload
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
  fileUrl?: string;
  path?: string;
}

export const useUploadFile = () =>
  useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<UploadResponse>(
        "/file-upload/test",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const url = data.url ?? data.fileUrl ?? data.path ?? "";
      if (!url) throw new Error("No URL in upload response");
      return url;
    },
    onError: (e: any) =>
      toast({
        title: "Upload failed",
        description: e.response?.data?.message ?? e.message ?? "Try again",
        variant: "destructive",
      }),
  });


