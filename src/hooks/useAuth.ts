import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/hooks/use-toast'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  // Add other fields as needed
}

interface UpdateUserData {
  email?: string
  // Add other update fields as needed
}

export const useLogin = () => {
  const { setUser, setToken, setLoading } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginData) => {
      setLoading(true)
      try {
        const response = await api.post('/auth/login', data)
        return response.data
      } finally {
        setLoading(false)
      }
    },
    onSuccess: (data) => {
      setUser(data.user)
      // API returns 'accessToken', not 'token'
      const token: string = data.accessToken ?? data.token
      setToken(token)
      localStorage.setItem('authToken', token)
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Login failed',
        variant: 'destructive',
      })
    },
  })
}

export const useRegister = () => {
  const { setUser, setToken } = useAuthStore()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: (data) => {
      // Assuming data has user and token
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('authToken', data.token)
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      })
    },
  })
}

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data
    },
    enabled: !!localStorage.getItem('authToken'),
  })
}

// User management hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await api.patch(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast({
        title: 'Success',
        description: 'User updated successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'Success',
        description: 'User deleted successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      })
    },
  })
}

export const useVerifyUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/verify`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'Success',
        description: 'User verified successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify user',
        variant: 'destructive',
      })
    },
  })
}

export const useDeactivateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/deactivate`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'Success',
        description: 'User deactivated successfully!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate user',
        variant: 'destructive',
      })
    },
  })
}

// App health check hook
export const useAppHealth = () => {
  return useQuery({
    queryKey: ['app-health'],
    queryFn: async () => {
      const response = await api.get('/')
      return response.data
    },
  })
}

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  country?: string
  profilePhotoUrl?: string
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProfileData }) => {
      const response = await api.patch(`/users/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      if (data?.user) setUser(data.user)
      else if (data?.id) setUser(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' })
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update profile', variant: 'destructive' })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.post('/auth/change-password', data)
      return response.data
    },
    onSuccess: () => {
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' })
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to change password', variant: 'destructive' })
    },
  })
}