import { type ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui';
import { isAdmin } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protected route wrapper that requires authentication and optionally admin role
 *
 * @param children - Components to render if access is allowed
 * @param requireAdmin - If true, user must have admin role to access
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Check admin requirement - auto logout non-admin users
  // MUST be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (requireAdmin && user && userProfile && !loading && !isAdmin(userProfile)) {
      console.log('[ProtectedRoute] User is not admin, signing out...');
      signOut().then(() => {
        navigate('/');
      });
    }
  }, [requireAdmin, user, userProfile, loading, signOut, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // If checking admin and user is not admin, show loading while signing out
  if (requireAdmin && !isAdmin(userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-trout-gold border-t-transparent mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
