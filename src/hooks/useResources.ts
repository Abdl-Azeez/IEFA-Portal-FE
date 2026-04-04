import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  ResourceItem,
  ResourceFilters,
  ResourceCategory,
  RegulatoryBody,
  GlossaryTerm,
  GlossaryFilters,
  PaginatedResponse,
  SubmitUserResourceDto,
  UserResourceSubmission,
} from '@/types/resources'

interface ApiResourceCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  sortOrder?: number
  isRegulatory?: boolean
  parentId?: string | null
  parent?: ApiResourceCategory | null
}

interface ApiRegulatoryBody {
  id: string
  name: string
  fullName?: string
  description?: string
  logoUrl?: string
}

interface ApiResourceItem {
  id: string
  title: string
  slug?: string
  description?: string | null
  bodyHtml?: string | null
  category?: ApiResourceCategory | null
  regulatoryBody?: ApiRegulatoryBody | null
  resourceType: ResourceItem['resourceType']
  thumbnailUrl?: string | null
  attachmentUrl?: string | null
  externalUrl?: string | null
  fileSizeKb?: number | null
  pageCount?: number | null
  language?: string | null
  authorName?: string | null
  publisher?: string | null
  publishedYear?: number | null
  isDownloadable?: boolean
  isPremium: boolean
  isFeatured: boolean
  tags?: string[] | null
  viewCount: number
  downloadCount: number
  status: ResourceItem['status']
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResourceListResponse extends Omit<PaginatedResponse<ResourceItem>, 'data'> {
  data: ApiResourceItem[]
}

const mapCategory = (category?: ApiResourceCategory | null): ResourceCategory | null => {
  if (!category) return null
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    sortOrder: category.sortOrder,
    isRegulatory: category.isRegulatory,
    parentId: category.parentId ?? null,
  }
}

const normalizeResource = (item: ApiResourceItem): ResourceItem => {
  const category = mapCategory(item.category)
  const isRegulatory =
    Boolean(item.regulatoryBody?.id) ||
    Boolean(category?.isRegulatory)

  return {
    id: item.id,
    title: item.title,
    resourceType: item.resourceType,
    authorName: item.authorName ?? item.publisher ?? null,
    authorType: null,
    topic: null,
    briefIntro: item.description ?? null,
    coverImageUrl: item.thumbnailUrl ?? null,
    fileUrl: item.attachmentUrl ?? item.externalUrl ?? null,
    previewUrl: item.externalUrl ?? null,
    categoryId: category?.id ?? null,
    category,
    subCategoryId: null,
    subCategory: null,
    languages: item.language ? [item.language] : undefined,
    publishedYear: item.publishedYear ?? null,
    regulatoryBodyId: item.regulatoryBody?.id ?? null,
    regulatoryBody: item.regulatoryBody
      ? {
          id: item.regulatoryBody.id,
          name: item.regulatoryBody.name,
          fullName: item.regulatoryBody.fullName,
          description: item.regulatoryBody.description,
          logoUrl: item.regulatoryBody.logoUrl,
        }
      : null,
    isRegulatory,
    documentType: category?.isRegulatory ? category?.slug ?? null : null,
    documentFormat: null,
    isPremium: item.isPremium,
    isFeatured: item.isFeatured,
    status: item.status,
    tags: item.tags ?? [],
    viewCount: item.viewCount ?? 0,
    downloadCount: item.downloadCount ?? 0,
    publishedAt: item.publishedAt ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

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
      if (filters.resourceTypes) params.resourceTypes = filters.resourceTypes
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.isPremium !== undefined) params.isPremium = filters.isPremium
      if (filters.languages) params.languages = filters.languages
      if (filters.publishedYearFrom !== undefined)
        params.publishedYearFrom = filters.publishedYearFrom
      if (filters.publishedYearTo !== undefined)
        params.publishedYearTo = filters.publishedYearTo
      if (filters.regulatoryBodyId)
        params.regulatoryBodyId = filters.regulatoryBodyId
      if (filters.isRegulatory !== undefined)
        params.isRegulatory = filters.isRegulatory
      const { data } = await api.get<ApiResourceListResponse>('/resources', { params })
      return {
        ...data,
        data: data.data.map(normalizeResource),
      }
    },
    staleTime: 60_000,
  })

export const useResource = (id: string) =>
  useQuery<ResourceItem>({
    queryKey: ['resources', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResourceItem>(`/resources/${id}`)
      return normalizeResource(data)
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

export const useResourceRegulatoryBodies = () =>
  useQuery<RegulatoryBody[]>({
    queryKey: ['resources', 'regulatory-bodies'],
    queryFn: async () => {
      const { data } = await api.get<RegulatoryBody[]>('/resources/regulatory-bodies')
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

export const useDownloadResource = () =>
  useMutation({
    mutationFn: async ({ id, fallbackTitle }: { id: string; fallbackTitle?: string }) => {
      const response = await api.get<Blob>(`/resources/${id}/download`, {
        responseType: 'blob',
      })

      const header = response.headers['content-disposition'] as string | undefined
      const matched = header?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
      const rawName = matched?.[1] ?? matched?.[2]
      const decodedName = rawName ? decodeURIComponent(rawName) : undefined
      const safeTitle = (fallbackTitle ?? 'resource').replaceAll(/[^a-z0-9\-_. ]/gi, '').trim() || 'resource'
      const filename = decodedName ?? `${safeTitle}.pdf`

      const blob = response.data
      const blobUrl = globalThis.URL.createObjectURL(blob)
      const anchor = globalThis.document.createElement('a')
      anchor.href = blobUrl
      anchor.download = filename
      globalThis.document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      globalThis.URL.revokeObjectURL(blobUrl)
    },
  })

// Submit a user resource for admin approval
export const useSubmitUserResource = () =>
  useMutation({
    mutationFn: async (dto: SubmitUserResourceDto) => {
      const { data } = await api.post<UserResourceSubmission>(
        "/resources/contribute",
        dto,
      );
      return data
    },
  })

// ─────────────────────────────────────────────────────────────────────────────
// Admin mutations — also exported here for convenience
// (mirrored in useAdmin.ts with the "admin" query key prefix)
// ─────────────────────────────────────────────────────────────────────────────
