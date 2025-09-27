import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireStudent?: boolean;
  requireActive?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireStudent = false,
  requireActive = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, isAdmin, isStudent } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check active status
  if (requireActive && user && !user.is_active) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/student" replace />;
  }

  // Check student requirement
  if (requireStudent && !isStudent) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}