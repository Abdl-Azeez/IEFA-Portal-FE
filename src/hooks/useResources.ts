import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  ResourceItem,
  ResourceFilters,
  ResourceCategory,
  GlossaryTerm,
  GlossaryFilters,
  PaginatedResponse,
} from '@/types/resources'

// ─────────────────────────────────────────────────────────────────────────────
// User-facing reads
// ─────────────────────────────────────────────────────────────────────────────

export const useResources = (filters: ResourceFilters = {}) =>
  useQuery<PaginatedResponse<ResourceItem>>({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 20,
        order: filters.order ?? 'DESC',
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.resourceType) params.resourceType = filters.resourceType
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.isPremium !== undefined) params.isPremium = filters.isPremium
      const { data } = await api.get<PaginatedResponse<ResourceItem>>('/resources', { params })
      return data
    },
    staleTime: 60_000,
  })

export const useResource = (id: string) =>
  useQuery<ResourceItem>({
    queryKey: ['resources', id],
    queryFn: async () => {
      const { data } = await api.get<ResourceItem>(`/resources/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 60_000,
  })

export const useResourceCategories = () =>
  useQuery<ResourceCategory[]>({
    queryKey: ['resources', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<ResourceCategory[]>('/resources/categories')
      return data
    },
    staleTime: 300_000,
  })

export const useGlossaryTerms = (filters: GlossaryFilters = {}) =>
  useQuery<GlossaryTerm[]>({
    queryKey: ['resources', 'glossary', filters],
    queryFn: async () => {
      const params = filters.letter ? { letter: filters.letter.toUpperCase() } : undefined
      const { data } = await api.get<GlossaryTerm[]>('/resources/glossary', { params })
      let terms = data.map((term) => ({
        ...term,
        status: term.status ?? 'published',
      }))
      if (filters.search) {
        const q = filters.search.toLowerCase()
        terms = terms.filter((t) =>
          t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
        )
      }
      if (filters.status) {
        terms = terms.filter((t) => t.status === filters.status)
      }
      return terms
    },
    staleTime: 60_000,
  })

export const useGlossaryTerm = (id: string) =>
  useQuery<GlossaryTerm>({
    queryKey: ['resources', 'glossary', id],
    queryFn: async () => {
      const { data } = await api.get<GlossaryTerm>(`/resources/glossary/${id}`)
      return {
        ...data,
        status: data.status ?? 'published',
      }
    },
    enabled: !!id,
    staleTime: 60_000,
  })

// Track download (fires and forgets, no cache invalidation needed)
export const useTrackResourceDownload = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/resources/${id}/track-download`)
    },
  })

// ─────────────────────────────────────────────────────────────────────────────
// Admin mutations — also exported here for convenience
// (mirrored in useAdmin.ts with the "admin" query key prefix)
// ─────────────────────────────────────────────────────────────────────────────

export { } // ensure file is treated as a module
