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
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'instructor' | 'admin' | 'staff'
  phone?: string
  country?: string
  profilePhotoUrl?: string
  isVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UsersListParams extends ListParams {
  role?: 'student' | 'instructor' | 'admin' | 'staff'
  name?: string
}

export const useAdminUsers = (params: UsersListParams = {}) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const { data } = await api.get<Page<AdminUser>>('/users', { params })
      return data
    },
  })

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const { data } = await api.get<AdminUser>(`/users/${id}`)
      return data
    },
    enabled: !!id,
  })

export const useAdminUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: { firstName?: string; lastName?: string; phone?: string; country?: string; profilePhotoUrl?: string }
    }) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast({ title: 'User updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast({ title: 'User deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

export const useAdminVerifyUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/verify`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast({ title: 'User verified' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Verify failed', variant: 'destructive' }),
  })
}

export const useAdminDeactivateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<AdminUser>(`/users/${id}/deactivate`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast({ title: 'User deactivated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Deactivate failed', variant: 'destructive' }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// News
// ─────────────────────────────────────────────────────────────────────────────

export interface NewsTag { id: string; name: string; slug: string }

export interface AdminNewsItem {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImageUrl?: string
  status: 'draft' | 'published'
  tagNames: string[]
  tags: NewsTag[]
  viewCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  author?: { id: string; firstName: string; lastName: string; email: string }
}

export interface NewsListParams extends ListParams {
  status?: 'draft' | 'published'
  tags?: string[]
}

export interface CreateNewsDto {
  title: string
  slug?: string
  content?: string
  excerpt?: string
  coverImageUrl?: string
  status?: 'draft' | 'published'
  tagNames?: string[]
  publishedAt?: string
}

export const useAdminNews = (params: NewsListParams = {}) =>
  useQuery({
    queryKey: ['admin', 'news', params],
    queryFn: async () => {
      const { data } = await api.get<Page<AdminNewsItem>>('/news', { params })
      return data
    },
  })

export const useAdminNewsTags = () =>
  useQuery({
    queryKey: ['admin', 'news', 'tags'],
    queryFn: async () => {
      const { data } = await api.get<NewsTag[]>('/news/tags/all')
      return data
    },
  })

export const useAdminCreateNews = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateNewsDto) => {
      const { data } = await api.post<AdminNewsItem>('/news', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'news'] })
      toast({ title: 'Article created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminUpdateNews = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateNewsDto> }) => {
      const { data } = await api.patch<AdminNewsItem>(`/news/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'news'] })
      toast({ title: 'Article updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteNews = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/news/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'news'] })
      toast({ title: 'Article deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Podcasts
// ─────────────────────────────────────────────────────────────────────────────

export interface PodcastShow {
  id: string
  title: string
  slug: string
  description?: string
  coverImageUrl?: string
  language?: string
  category?: string
  rssFeedUrl?: string
  spotifyUrl?: string
  appleUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PodcastEpisode {
  id: string
  title: string
  slug?: string
  description?: string
  audioUrl?: string
  videoUrl?: string
  durationSeconds?: number
  episodeNumber?: number
  season?: number
  isPublished: boolean
  publishedAt?: string
  viewCount: number
  createdAt: string
  updatedAt: string
  show?: PodcastShow
}

export interface ShowListParams extends ListParams {
  startDate?: string
  endDate?: string
}

export interface CreateShowDto {
  title: string
  slug: string
  description?: string
  coverImageUrl?: string
  language?: string
  category?: string
  rssFeedUrl?: string
  spotifyUrl?: string
  appleUrl?: string
}

export interface CreateEpisodeDto {
  title: string
  slug?: string
  description?: string
  audioUrl?: string
  videoUrl?: string
  durationSeconds?: number
  episodeNumber?: number
  season?: number
  isPublished?: boolean
  publishedAt?: string
}

export const useAdminShows = (params: ShowListParams = {}) =>
  useQuery({
    queryKey: ['admin', 'shows', params],
    queryFn: async () => {
      const { data } = await api.get<Page<PodcastShow>>('/podcasts/shows', { params })
      return data
    },
  })

export const useAdminShowEpisodes = (showId: string) =>
  useQuery({
    queryKey: ['admin', 'episodes', showId],
    queryFn: async () => {
      const { data } = await api.get<PodcastEpisode[]>(`/podcasts/shows/${showId}/episodes`)
      return data
    },
    enabled: !!showId,
  })

export const useAdminCreateShow = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateShowDto) => {
      const { data } = await api.post<PodcastShow>('/podcasts/shows', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'shows'] })
      toast({ title: 'Show created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminUpdateShow = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateShowDto> }) => {
      const { data } = await api.patch<PodcastShow>(`/podcasts/shows/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'shows'] })
      toast({ title: 'Show updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteShow = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/podcasts/shows/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'shows'] })
      toast({ title: 'Show deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

export const useAdminCreateEpisode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ showId, dto }: { showId: string; dto: CreateEpisodeDto }) => {
      const { data } = await api.post<PodcastEpisode>(`/podcasts/shows/${showId}/episodes`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'episodes'] })
      toast({ title: 'Episode created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminUpdateEpisode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateEpisodeDto> }) => {
      const { data } = await api.patch<PodcastEpisode>(`/podcasts/episodes/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'episodes'] })
      toast({ title: 'Episode updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteEpisode = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/podcasts/episodes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'episodes'] })
      toast({ title: 'Episode deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Research Reports
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportCategory { id: string; name: string; slug: string; description?: string; sortOrder: number }

export interface ResearchReport {
  id: string
  title: string
  slug: string
  abstract?: string
  bodyHtml?: string
  coverImageUrl?: string
  pdfUrl?: string
  externalUrl?: string
  fileSizeKb?: number
  pageCount?: number
  language?: string
  publisher?: string
  publishedYear?: number
  doi?: string
  isDownloadable: boolean
  isPremium: boolean
  isFeatured: boolean
  status: 'draft' | 'review' | 'published' | 'archived'
  reportType: 'whitepaper' | 'case_study' | 'market_report' | 'academic_paper' | 'policy_brief' | 'annual_report'
  tags: string[]
  viewCount: number
  downloadCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  category?: ReportCategory
}

export interface ResearchListParams extends ListParams {
  status?: 'draft' | 'review' | 'published' | 'archived'
  reportType?: string
  categoryId?: string
  isPremium?: boolean
}

export interface CreateResearchDto {
  title: string
  slug?: string
  abstract?: string
  bodyHtml?: string
  categoryId: string
  reportType?: string
  coverImageUrl?: string
  pdfUrl?: string
  externalUrl?: string
  fileSizeKb?: number
  pageCount?: number
  language?: string
  publisher?: string
  publishedYear?: number
  doi?: string
  isDownloadable?: boolean
  isPremium?: boolean
  isFeatured?: boolean
  tags?: string[]
  status?: 'draft' | 'review' | 'published' | 'archived'
  publishedAt?: string
}

export const useAdminResearchReports = (params: ResearchListParams = {}) =>
  useQuery({
    queryKey: ['admin', 'research', params],
    queryFn: async () => {
      const { data } = await api.get<Page<ResearchReport>>('/research-reports', { params })
      return data
    },
  })

export const useAdminReportCategories = () =>
  useQuery({
    queryKey: ['admin', 'research', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<ReportCategory[]>('/research-reports/categories/all')
      return data
    },
  })

export const useAdminCreateResearch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateResearchDto) => {
      const { data } = await api.post<ResearchReport>('/research-reports', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'research'] })
      toast({ title: 'Report created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminUpdateResearch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateResearchDto> }) => {
      const { data } = await api.patch<ResearchReport>(`/research-reports/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'research'] })
      toast({ title: 'Report updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteResearch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/research-reports/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'research'] })
      toast({ title: 'Report deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

export const useAdminCreateReportCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { name: string; slug?: string; description?: string; sortOrder?: number }) => {
      const { data } = await api.post<ReportCategory>('/research-reports/categories', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'research', 'categories'] })
      toast({ title: 'Category created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteReportCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/research-reports/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'research', 'categories'] })
      toast({ title: 'Category deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Datasets
// ─────────────────────────────────────────────────────────────────────────────

export interface DataCategory { id: string; name: string; slug: string; description?: string; icon?: string; sortOrder: number }

export interface Dataset {
  id: string
  title: string
  slug: string
  description?: string
  source?: string
  sourceUrl?: string
  geography?: string
  timePeriodFrom?: string
  timePeriodTo?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'one_time'
  format?: string
  fileUrl?: string
  fileSizeKb?: number
  isDownloadable: boolean
  isPremium: boolean
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  downloadCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  category?: DataCategory
}

export interface DatasetListParams extends ListParams {
  status?: 'draft' | 'published' | 'archived'
  frequency?: string
  categoryId?: string
  isPremium?: boolean
}

export interface CreateDatasetDto {
  title: string
  slug?: string
  description?: string
  categoryId: string
  source?: string
  sourceUrl?: string
  geography?: string
  timePeriodFrom?: string
  timePeriodTo?: string
  frequency?: string
  format?: string
  fileUrl?: string
  fileSizeKb?: number
  isDownloadable?: boolean
  isPremium?: boolean
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
  publishedAt?: string
}

export const useAdminDatasets = (params: DatasetListParams = {}) =>
  useQuery({
    queryKey: ['admin', 'datasets', params],
    queryFn: async () => {
      const { data } = await api.get<Page<Dataset>>('/datasets', { params })
      return data
    },
  })

export const useAdminDataCategories = () =>
  useQuery({
    queryKey: ['admin', 'datasets', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<DataCategory[]>('/datasets/categories/all')
      return data
    },
  })

export const useAdminCreateDataset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateDatasetDto) => {
      const { data } = await api.post<Dataset>('/datasets', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets'] })
      toast({ title: 'Dataset created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminUpdateDataset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateDatasetDto> }) => {
      const { data } = await api.patch<Dataset>(`/datasets/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets'] })
      toast({ title: 'Dataset updated' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Update failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteDataset = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets'] })
      toast({ title: 'Dataset deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

export const useAdminCreateDataCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { name: string; slug?: string; description?: string; icon?: string; sortOrder?: number }) => {
      const { data } = await api.post<DataCategory>('/datasets/categories', dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets', 'categories'] })
      toast({ title: 'Category created' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Create failed', variant: 'destructive' }),
  })
}

export const useAdminDeleteDataCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/datasets/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'datasets', 'categories'] })
      toast({ title: 'Category deleted' })
    },
    onError: (e: any) => toast({ title: 'Error', description: e.response?.data?.message ?? 'Delete failed', variant: 'destructive' }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// File upload
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string
  fileUrl?: string
  path?: string
}

export const useUploadFile = () =>
  useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<UploadResponse>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = data.url ?? data.fileUrl ?? data.path ?? ''
      if (!url) throw new Error('No URL in upload response')
      return url
    },
    onError: (e: any) => toast({ title: 'Upload failed', description: e.response?.data?.message ?? e.message ?? 'Try again', variant: 'destructive' }),
  })
