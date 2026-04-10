import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/hooks/use-toast";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role: "student";
  phone: string;
  country: string;
}

interface CheckUsernameResult {
  available: boolean;
}

interface UpdateUserData {
  username?: string;
  lmsStudentId?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  profilePhotoUrl?: string;
}

interface AuthUserPayload {
  id?: string;
  userId?: string;
  email: string;
  username?: string | null;
  lmsStudentId?: string | null;
  role: "student" | "instructor" | "admin" | "staff";
  isModerator?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  profilePhotoUrl?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

const AUTH_PROFILE_STORAGE_KEY = "authProfile";

type StoredAuthProfile = Pick<
  AuthUserPayload,
  | "username"
  | "lmsStudentId"
  | "firstName"
  | "lastName"
  | "profilePhotoUrl"
  | "phone"
  | "country"
>;

const readStoredAuthProfile = (): StoredAuthProfile | null => {
  const raw = sessionStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthProfile;
  } catch {
    return null;
  }
};

const persistAuthProfile = (user: Partial<AuthUserPayload>) => {
  const profile: StoredAuthProfile = {
    username: user.username,
    lmsStudentId: user.lmsStudentId,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePhotoUrl: user.profilePhotoUrl,
    phone: user.phone,
    country: user.country,
  };

  if (
    !profile.username &&
    !profile.lmsStudentId &&
    !profile.firstName &&
    !profile.lastName &&
    !profile.profilePhotoUrl
  ) {
    return;
  }

  sessionStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const normalizeAuthUser = (user: AuthUserPayload) => {
  const storedProfile = readStoredAuthProfile();

  const normalized = {
    ...user,
    id: user.id ?? user.userId ?? "",
    // Only coerce isModerator when the API payload actually includes the field.
    // If absent, omit it so the caller's existing value is preserved via spread merge.
    ...(Object.prototype.hasOwnProperty.call(user, "isModerator")
      ? { isModerator: !!user.isModerator }
      : {}),
    username: user.username ?? storedProfile?.username,
    lmsStudentId: user.lmsStudentId ?? storedProfile?.lmsStudentId,
    firstName: user.firstName ?? storedProfile?.firstName,
    lastName: user.lastName ?? storedProfile?.lastName,
    profilePhotoUrl: user.profilePhotoUrl ?? storedProfile?.profilePhotoUrl,
    phone: user.phone ?? storedProfile?.phone,
    country: user.country ?? storedProfile?.country,
  };

  persistAuthProfile(normalized);
  return normalized;
};

export const useLogin = () => {
  const { setUser, setToken, setRefreshToken, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      setLoading(true);
      try {
        const response = await api.post("/auth/login", data);
        return response.data;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      if (data.user) {
        const normalizedUser = normalizeAuthUser(data.user);
        setUser(normalizedUser);
        persistAuthProfile(normalizedUser);
      }
      const token: string = data.accessToken ?? data.token;
      setToken(token);
      sessionStorage.setItem("authToken", token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
      }
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed",
        variant: "destructive",
      });
    },
  });
};

export const useCheckUsername = () => {
  return useMutation({
    mutationFn: async (username: string): Promise<CheckUsernameResult> => {
      const response = await api.get("/users/search/username", {
        params: { username },
      });
      const results: Array<{ username?: string }> = Array.isArray(response.data)
        ? response.data
        : (response.data?.users ?? response.data?.data ?? []);
      // Taken if any result has an exact username match (case-insensitive)
      const taken = results.some(
        (u) => u.username?.toLowerCase() === username.toLowerCase()
      );
      return { available: !taken };
    },
  });
};

export const useRegister = () => {
  const { setUser, setToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        const normalizedUser = normalizeAuthUser(data.user);
        setUser(normalizedUser);
        persistAuthProfile(normalizedUser);
      }
      const token: string | undefined = data.accessToken ?? data.token;
      if (token) {
        setToken(token);
        sessionStorage.setItem("authToken", token);
      }
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
      }
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      const payload = response.data?.user ?? response.data;
      return normalizeAuthUser(payload);
    },
    enabled: !!sessionStorage.getItem("authToken"),
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!sessionStorage.getItem("authToken")) return;
      try {
        await api.post("/auth/logout");
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          throw error;
        }
      }
    },
    onSettled: () => {
      // Always clear local state regardless of server response
      logout();
      queryClient.removeQueries({ queryKey: ["me"] });
    },
    onError: () => {
      // Silent — state is already cleared in onSettled
    },
  });
};

// User management hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User verified successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify user",
        variant: "destructive",
      });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User deactivated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });
};

// App health check hook
export const useAppHealth = () => {
  return useQuery({
    queryKey: ["app-health"],
    queryFn: async () => {
      const response = await api.get("/");
      return response.data;
    },
  });
};

interface UpdateProfileData {
  username?: string;
  lmsStudentId?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  profilePhotoUrl?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.patch("/users/me/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.user) setUser(data.user);
      else if (data?.id) setUser(data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      const response = await api.patch("/users/me/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
};

export interface UserSettings {
  researchHighlights?: boolean;
  platformUpdates?: boolean;
  eventsAndPrograms?: boolean;
  newReportsAndDataViews?: boolean;
  communityRepliesAndMentions?: boolean;
  primaryRegion?: string;
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserSettings) => {
      const response = await api.patch("/users/me/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string;
      role: "student" | "instructor" | "admin" | "staff";
    }) => {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Role updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });
};

export const useToggleModerator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isModerator,
    }: {
      id: string;
      isModerator: boolean;
    }) => {
      const response = await api.patch<{ isModerator: boolean }>(`/users/${id}/moderator`, {
        isModerator,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Moderator status updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update moderator status",
        variant: "destructive",
      });
    },
  });
};

export interface UserSearchResult {
  id: string;
  username?: string | null;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string;
}

export const useUserSearch = (query: string) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => {
      const response = await api.get("/users/search/username", {
        params: { username: query },
      });
      const users: UserSearchResult[] =
        response.data?.users ??
        response.data?.data ??
        (Array.isArray(response.data) ? response.data : []);
      return users;
    },
    enabled: query.trim().length >= 1,
    staleTime: 10_000,
  });
};