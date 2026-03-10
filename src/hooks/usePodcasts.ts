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

// Queries
export const usePodcastShows = () => {
  return useQuery({
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
      const response = await api.get('/podcasts/episodes')
      return response.data
    },
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