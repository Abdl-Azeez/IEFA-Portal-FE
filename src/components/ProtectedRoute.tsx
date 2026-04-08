import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GuestOverlay } from './GuestOverlay'
import { GuestPageSkeleton } from './GuestPageSkeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Admins should use the admin portal
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return (
      // Relative container so the overlay can fill it exactly
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
        {/*
          Render a pure skeleton instead of the real page.
          This prevents any API hooks from mounting, so no data
          is ever fetched — even if the blur is removed in devtools.
        */}
        <div className="h-full w-full pointer-events-none select-none overflow-hidden">
          <GuestPageSkeleton />
        </div>
        <GuestOverlay />
      </div>
    );
  }

  return <>{children}</>
}

export default ProtectedRoute