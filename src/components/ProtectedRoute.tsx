import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GuestOverlay } from './GuestOverlay'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Admins should use the admin portal
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return (
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* Render children in a blurred wrapper that ignores clicks */}
        <div className="h-full w-full pointer-events-none opacity-50 blur-[2px] filter select-none overflow-hidden">
          {children}
        </div>
        <GuestOverlay />
      </div>
    );
  }

  return <>{children}</>
}

export default ProtectedRoute