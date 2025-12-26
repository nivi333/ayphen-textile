import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../globalComponents';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // TODO: Implement Google OAuth callback handling
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google auth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (code) {
      // TODO: Exchange code for tokens with backend
      console.log('Google auth code:', code);
      // For now, redirect to login
      navigate('/login');
    } else {
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <LoadingSpinner size='lg' />
      <p className='ml-4'>Processing Google authentication...</p>
    </div>
  );
}
