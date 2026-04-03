import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useMe } from "@/hooks/useAuth";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  username?: string | null;
  lmsStudentId?: string | null;
  role: string;
  isModerator?: boolean;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string;
  phone?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, role: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const hasAuthUserChanged = (current: User | null, next: User) => {
  if (!current) return true;

  return (
    current.id !== next.id ||
    current.email !== next.email ||
    current.username !== next.username ||
    current.lmsStudentId !== next.lmsStudentId ||
    current.role !== next.role ||
    !!current.isModerator !== !!next.isModerator ||
    current.firstName !== next.firstName ||
    current.lastName !== next.lastName ||
    current.profilePhotoUrl !== next.profilePhotoUrl ||
    current.phone !== next.phone ||
    current.country !== next.country
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    token,
    isAuthenticated,
    logout: storeLogout,
    setUser,
  } = useAuthStore();
  const { data: meData, isLoading } = useMe();
  const queryClient = useQueryClient();

  const logout = () => {
    // Invalidate server-side refresh token (best-effort, don't block UI)
    const accessToken = sessionStorage.getItem("authToken");
    if (accessToken) {
      api.post("/auth/logout").catch((error) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          // Ignore here; local logout still proceeds.
          console.error("Logout request failed:", error);
        }
      });
    }
    storeLogout();
    queryClient.removeQueries({ queryKey: ["me"] });
  };

  useEffect(() => {
    if (token && meData) {
      const mergedUser: User = {
        ...user,
        ...meData,
        username: meData.username ?? user?.username,
        lmsStudentId: meData.lmsStudentId ?? user?.lmsStudentId,
        firstName: meData.firstName ?? user?.firstName,
        lastName: meData.lastName ?? user?.lastName,
        profilePhotoUrl: meData.profilePhotoUrl ?? user?.profilePhotoUrl,
        phone: meData.phone ?? user?.phone,
        country: meData.country ?? user?.country,
      };

      if (hasAuthUserChanged(user, mergedUser)) {
        setUser(mergedUser);
      }
    }
  }, [token, meData, user, setUser]);

  const login = async (_email: string, _password: string) => {
    // This will be handled by the hook
  };

  const signup = async (_email: string, _password: string, _role: string) => {
    // This will be handled by the hook
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      login,
      logout,
      signup,
      isAuthenticated,
      isAdmin: user?.role === "admin" || user?.role === "staff",
      isModerator: !!user?.isModerator,
      isLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
