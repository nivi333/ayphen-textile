/**
 * Protected Route Component
 * Auth guard for protected routes
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/contexts/AuthContext';
import { LoadingSpinner } from '../globalComponents';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompany?: boolean;
}

export default function ProtectedRoute({ children, requireCompany = false }: ProtectedRouteProps) {
  const { user, currentCompany, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // If route requires a company but none is selected, redirect to company selection
  if (requireCompany && !currentCompany) {
    return <Navigate to='/companies' replace />;
  }

  return <>{children}</>;
}

// Public route component (for login, register, etc.)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // If user is already logged in, redirect to companies page
  if (user) {
    return <Navigate to='/companies' replace />;
  }

  return <>{children}</>;
}
