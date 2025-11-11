import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { googleAuth } from '../../utils/googleAuth';

export function GoogleAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        setLoading(true);
        
        // Handle the OAuth callback and extract authorization code
        const authResponse = googleAuth.handleCallback();
        
        if (!authResponse) {
          throw new Error('Failed to process Google authentication response');
        }

        // Exchange the authorization code for tokens
        const tokens = await googleAuth.exchangeCodeForTokens(authResponse.code);
        
        // Create login credentials for Google user
        const googleCredentials = {
          emailOrPhone: tokens.email || '', // This should come from backend after validating Google ID token
          password: 'google_oauth_token', // Special password for OAuth users
          googleToken: tokens.id_token, // Send ID token to backend for validation
        };

        // Log in the user with Google credentials
        await login(googleCredentials);
        
        // Redirect to the intended page or companies
        const from = sessionStorage.getItem('auth_redirect_path') || '/companies';
        sessionStorage.removeItem('auth_redirect_path');
        
        navigate(from, { replace: true });
      } catch (err: unknown) {
        console.error('Google auth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [login, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-lg">Completing Google sign-in...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="error"
          title="Google Sign-In Failed"
          subTitle={error}
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              Back to Login
            </Button>,
            <Button key="retry" onClick={() => window.location.reload()}>
              Try Again
            </Button>,
          ]}
        />
      </div>
    );
  }

  return null;
}
