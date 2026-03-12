import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from '@/hooks/use-toast'

// Types based on API
interface CreatePodcastShowDto {
  title: string
  description: string
}

interface UpdatePodcastShowDto {
  title?: string
  description?: string
}

interface CreatePodcastEpisodeDto {
  title: string
  description: string
  showId: string
}

interface UpdatePodcastEpisodeDto {
  title?: string
  description?: string
}

// backend show response shape (with pagination wrapper)
export interface PodcastShow {
  id: string
  title: string
  slug: string
  description: string
  coverImageUrl: string
  language: string
  category: string
  rssFeedUrl: string | null
  spotifyUrl: string | null
  appleUrl: string | null
  isActive: boolean
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

// Queries
export const usePodcastShows = () => {
  return useQuery<PaginatedResponse<PodcastShow>>({
    queryKey: ['podcastShows'],
    queryFn: async () => {
      const response = await api.get('/podcasts/shows')
      return response.data
    },
  })
}

export const usePodcastShow = (id: string) => {
  return useQuery({
    queryKey: ['podcastShow', id],
    queryFn: async () => {
      const response = await api.get(`/podcasts/shows/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export const usePodcastEpisodes = (showId?: string) => {
  return useQuery({
    queryKey: ['podcastEpisodes', showId],
    queryFn: async () => {
      const endpoint = showId
        ? `/podcasts/shows/${showId}/episodes`
        : '/podcasts/episodes'
      const response = await api.get(endpoint)
      return response.data
    },
    enabled: !!showId, // only fetch when a show is selected
  })
}

export const usePodcastEpisode = (id: string) => {
  return useQuery({
    queryKey: ['podcastEpisode', id],
    queryFn: async () => {
      const response = await api.get(`/podcasts/episodes/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// Mutations
export const useCreatePodcastShow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePodcastShowDto) => {
      const response = await api.post('/podcasts/shows', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastShows'] })
      toast({
        title: 'Success',
        description: 'Podcast show created successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create podcast show',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdatePodcastShow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePodcastShowDto }) => {
      const response = await api.patch(`/podcasts/shows/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastShows'] })
      toast({
        title: 'Success',
        description: 'Podcast show updated successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update podcast show',
        variant: 'destructive',
      })
    },
  })
}

export const useDeletePodcastShow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/podcasts/shows/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastShows'] })
      toast({
        title: 'Success',
        description: 'Podcast show deleted successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete podcast show',
        variant: 'destructive',
      })
    },
  })
}

export const useCreatePodcastEpisode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePodcastEpisodeDto) => {
      const response = await api.post(`/podcasts/shows/${data.showId}/episodes`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] })
      toast({
        title: 'Success',
        description: 'Podcast episode created successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create podcast episode',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdatePodcastEpisode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePodcastEpisodeDto }) => {
      const response = await api.patch(`/podcasts/episodes/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] })
      toast({
        title: 'Success',
        description: 'Podcast episode updated successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update podcast episode',
        variant: 'destructive',
      })
    },
  })
}

export const useDeletePodcastEpisode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/podcasts/episodes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcastEpisodes'] })
      toast({
        title: 'Success',
        description: 'Podcast episode deleted successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete podcast episode',
        variant: 'destructive',
      })
    },
  })
}

// ─── Podcast Episode type ─────────────────────────────────────────────────────
export interface PodcastEpisode {
  id: string
  title: string
  description?: string
  videoUrl?: string
  thumbnailUrl?: string
  coverImageUrl?: string
  thumbnail?: string
  duration?: string
  showId?: string
  guest?: string
  tag?: string
  views?: number
  likes?: number
  createdAt?: string
  uploadDate?: Date
}

// ─── Playlist types ───────────────────────────────────────────────────────────
export interface Playlist {
  id: string
  name: string
  episodes: PodcastEpisode[]
  createdAt: string
}

interface CreatePlaylistDto {
  name: string
}

interface UpdatePlaylistDto {
  name?: string
}

// ─── Playlist queries / mutations ─────────────────────────────────────────────
export const usePlaylists = () => {
  return useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await api.get('/playlists')
      return response.data
    },
  })
}

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePlaylistDto) => {
      const response = await api.post('/playlists', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast({ title: 'Playlist created!' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create playlist',
        variant: 'destructive',
      })
    },
  })
}

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/playlists/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast({ title: 'Playlist deleted.' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete playlist',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlaylistDto }) => {
      const response = await api.patch(`/playlists/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update playlist',
        variant: 'destructive',
      })
    },
  })
}

export const useAddEpisodeToPlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) => {
      const response = await api.post(`/playlists/${playlistId}/episodes/${episodeId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast({ title: 'Added to playlist!' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add episode to playlist',
        variant: 'destructive',
      })
    },
  })
}

export const useRemoveEpisodeFromPlaylist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) => {
      const response = await api.delete(`/playlists/${playlistId}/episodes/${episodeId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      toast({ title: 'Removed from playlist.' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove episode from playlist',
        variant: 'destructive',
      })
    },
  })
}