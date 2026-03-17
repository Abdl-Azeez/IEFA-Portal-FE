import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface NewsTag {
  id: string
  name: string
  slug: string
}

export interface NewsItem {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImageUrl: string | null
  status: 'draft' | 'published'
  tagNames: string[]
  publishedAt: string | null
  viewCount: number
  createdAt: string
  tags: NewsTag[]
  author?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
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

export interface NewsFilters {
  page?: number
  perPage?: number
  search?: string
  status?: 'draft' | 'published'
  tags?: string[]
  order?: 'ASC' | 'DESC'
}

export const useNews = (filters: NewsFilters = {}) => {
  return useQuery<PaginatedResponse<NewsItem>>({
    queryKey: ['news', filters],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 9,
        order: filters.order ?? 'DESC',
      }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.tags?.length) params['tags[]'] = filters.tags
      const response = await api.get('/news', { params })
      return response.data
    },
  })
}

export const useNewsTags = () => {
  return useQuery<NewsTag[]>({
    queryKey: ['newsTags'],
    queryFn: async () => {
      const response = await api.get('/news/tags/all')
      return response.data
    },
  })
}

export const useNewsItem = (id: string) => {
  return useQuery<NewsItem>({
    queryKey: ['newsItem', id],
    queryFn: async () => {
      const response = await api.get(`/news/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export interface ExternalNewsArticle {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  source?: string | { _?: string; $?: { url?: string } };
  guid?: string | { _?: string };
  category?: string;
}

export const useExternalNews = (search: string) => {
  return useQuery<ExternalNewsArticle[]>({
    queryKey: ["externalNews", search],
    queryFn: async () => {
      const response = await api.get("/news/external", { params: { search } });
      return response.data;
    },
    enabled: !!search,
  });
};

export const useFeaturedNews = () => {
  return useQuery<NewsItem[]>({
    queryKey: ["featuredNews"],
    queryFn: async () => {
      const response = await api.get("/news/featured");
      return response.data;
    },
  });
};
