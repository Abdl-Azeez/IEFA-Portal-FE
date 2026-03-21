import { useQuery } from '@tanstack/react-query'
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
  description?: string | null
  icon?: string | null
  sortOrder?: number
}

export interface Dataset {
  id: string
  title: string
  slug?: string
  description: string
  value?: string | null
  year?: string | null
  source: string | null
  sourceUrl: string | null
  geography: string | null
  visualizationType: string | null
  timePeriodFrom: string | null
  timePeriodTo: string | null
  frequency: DataFrequency
  format: string | null
  fileUrl: string | null
  fileSizeKb: number | null
  isDownloadable: boolean
  isPremium: boolean
  tags: string[] | null
  visualizationData?: unknown | null
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  viewCount: number
  downloadCount?: number
  category: DatasetCategory
  createdAt: string
  updatedAt?: string
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
  status?: 'draft' | 'published' | 'archived'
  frequency?: DataFrequency
  geography?: string
  source?: string
  visualizationType?: string
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
      if (filters.geography) params.geography = filters.geography
      if (filters.source) params.source = filters.source
      if (filters.visualizationType) params.visualizationType = filters.visualizationType
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

export const useDatasetCategory = (id: string) => {
  return useQuery<DatasetCategory>({
    queryKey: ['datasetCategory', id],
    queryFn: async () => {
      const response = await api.get(`/datasets/categories/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
