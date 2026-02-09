/**
 * Protected Route Component
 * Auth guard for protected routes
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/contexts/AuthContext';
import { LoadingSpinner } from '../globalComponents';
import { AuthStorage } from '@/utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompany?: boolean;
}

export default function ProtectedRoute({ children, requireCompany = false }: ProtectedRouteProps) {
  const { isAuthenticated, currentCompany, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Check both React state AND localStorage for company
  // This handles the race condition where localStorage is updated before React state
  const hasCompany = currentCompany || AuthStorage.getCurrentCompany();

  // Only redirect to company selection if company is required and not selected
  // Don't redirect if we're already on the companies page
  if (requireCompany && !hasCompany && location.pathname !== '/companies') {
    return <Navigate to='/companies' replace />;
  }

  return <>{children}</>;
}

// Public route component (for login, register, etc.)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentCompany, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    // If user has a current company, go to dashboard
    if (currentCompany) {
      return <Navigate to='/dashboard' replace />;
    }
    // Otherwise, go to company selection
    return <Navigate to='/companies' replace />;
  }

  return <>{children}</>;
}
