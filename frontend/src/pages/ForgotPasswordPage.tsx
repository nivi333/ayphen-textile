import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { AuthLayout } from '../components/ui';

// Forgot password page component
export function ForgotPasswordPage() {
  return (
    <AuthLayout
      backgroundDecorations={
        <>
          <div style={{
            position: 'absolute',
            top: '-160px',
            right: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(45deg, #fb923c, #f59e0b)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(40px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-160px',
            width: '320px',
            height: '320px',
            background: 'linear-gradient(45deg, #f59e0b, #fb923c)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(40px)'
          }}></div>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
