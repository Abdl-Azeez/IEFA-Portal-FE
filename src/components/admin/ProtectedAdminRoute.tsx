import { Navigate } from 'react-router-dom'
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedAdminRoute({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  // Not logged in → go to the shared login page
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but not an admin → back to user portal
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
