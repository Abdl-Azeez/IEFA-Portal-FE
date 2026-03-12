import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export type ReportType =
  | 'whitepaper'
  | 'case_study'
  | 'market_report'
  | 'academic_paper'
  | 'policy_brief'
  | 'annual_report'

export interface ReportCategory {
  id: string
  name: string
  slug: string
}

export interface ResearchReport {
  id: string
  title: string
  abstract: string
  bodyHtml: string
  reportType: ReportType
  coverImageUrl: string | null
  pdfUrl: string | null
  externalUrl: string | null
  fileSizeKb: number | null
  pageCount: number | null
  language: string | null
  publisher: string | null
  publishedYear: number | null
  doi: string | null
  isDownloadable: boolean
  isPremium: boolean
  isFeatured: boolean
  tags: string[]
  status: 'draft' | 'published'
  publishedAt: string | null
  viewCount: number
  downloadCount: number
  category: ReportCategory
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface ResearchReportFilters {
  page?: number
  perPage?: number
  search?: string
  status?: 'draft' | 'published'
  reportType?: ReportType
  categoryId?: string
  isPremium?: boolean
  order?: 'ASC' | 'DESC'
}

export const useResearchReports = (filters: ResearchReportFilters = {}) => {
  return useQuery<PaginatedResponse<ResearchReport>>({
    queryKey: ['researchReports', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 10,
        order: filters.order ?? 'DESC',
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.reportType) params.reportType = filters.reportType
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.isPremium !== undefined) params.isPremium = filters.isPremium
      const response = await api.get('/research-reports', { params })
      return response.data
    },
  })
}

export const useResearchReportCategories = () => {
  return useQuery<ReportCategory[]>({
    queryKey: ['researchReportCategories'],
    queryFn: async () => {
      const response = await api.get('/research-reports/categories/all')
      return response.data
    },
  })
}

export const useResearchReport = (id: string) => {
  return useQuery<ResearchReport>({
    queryKey: ['researchReport', id],
    queryFn: async () => {
      const response = await api.get(`/research-reports/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export const useTrackReportDownload = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/research-reports/${id}/download`)
    },
  })
}
