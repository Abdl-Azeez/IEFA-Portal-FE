import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useMe } from "@/hooks/useAuth";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
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
    api.post("/auth/logout").catch(() => {});
    storeLogout();
    queryClient.removeQueries({ queryKey: ["me"] });
  };

  useEffect(() => {
    if (token && meData && !user) {
      setUser(meData);
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
      isModerator: user?.role === "moderator",
      isLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
