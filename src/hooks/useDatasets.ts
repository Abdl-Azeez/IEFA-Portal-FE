import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export type DataFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'one_time'

export interface DatasetCategory {
  id: string
  name: string
  slug: string
}

export interface Dataset {
  id: string
  title: string
  description: string
  source: string | null
  sourceUrl: string | null
  geography: string | null
  timePeriodFrom: string | null
  timePeriodTo: string | null
  frequency: DataFrequency
  format: string | null
  fileUrl: string | null
  fileSizeKb: number | null
  isDownloadable: boolean
  isPremium: boolean
  tags: string[]
  status: 'draft' | 'published'
  publishedAt: string | null
  viewCount: number
  downloadCount: number
  category: DatasetCategory
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

export interface DatasetFilters {
  page?: number
  perPage?: number
  search?: string
  status?: 'draft' | 'published'
  frequency?: DataFrequency
  categoryId?: string
  isPremium?: boolean
  order?: 'ASC' | 'DESC'
}

export const useDatasets = (filters: DatasetFilters = {}) => {
  return useQuery<PaginatedResponse<Dataset>>({
    queryKey: ['datasets', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 10,
        order: filters.order ?? 'DESC',
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.frequency) params.frequency = filters.frequency
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.isPremium !== undefined) params.isPremium = filters.isPremium
      const response = await api.get('/datasets', { params })
      return response.data
    },
  })
}

export const useDatasetCategories = () => {
  return useQuery<DatasetCategory[]>({
    queryKey: ['datasetCategories'],
    queryFn: async () => {
      const response = await api.get('/datasets/categories/all')
      return response.data
    },
  })
}

export const useDataset = (id: string) => {
  return useQuery<Dataset>({
    queryKey: ['dataset', id],
    queryFn: async () => {
      const response = await api.get(`/datasets/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export const useTrackDatasetDownload = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/datasets/${id}/download`)
    },
  })
}
