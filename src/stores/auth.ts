import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  isVerified?: boolean;
  isActive?: boolean;
  profilePhotoUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
  settings?: {
    researchHighlights?: boolean;
    platformUpdates?: boolean;
    eventsAndPrograms?: boolean;
    newReportsAndDataViews?: boolean;
    communityRepliesAndMentions?: boolean;
    primaryRegion?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("refreshToken");
        // Remove persisted auth state to avoid stale hydration after logout.
        sessionStorage.removeItem("auth-storage");
        // Cleanup legacy local storage keys from older builds.
        localStorage.removeItem("authToken");
        localStorage.removeItem("auth-storage");
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);