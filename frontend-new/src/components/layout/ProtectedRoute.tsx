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

  console.log('=== PROTECTED ROUTE DEBUG ===');
  console.log('Path:', location.pathname);
  console.log('Require Company:', requireCompany);
  console.log('Current Company:', currentCompany);
  console.log('User:', user);
  console.log('Is Loading:', isLoading);

  if (isLoading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /login');
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // If route requires a company but none is selected, redirect to company selection
  if (requireCompany && !currentCompany) {
    console.log('ProtectedRoute: Company required but not selected, redirecting to /companies');
    return <Navigate to='/companies' replace />;
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
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
