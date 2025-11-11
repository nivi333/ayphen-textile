import { LoginForm } from '../components/auth/LoginForm';
import { AuthLayout } from '../components/ui';

// Login page component
export function LoginPage() {
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
            background: 'linear-gradient(45deg, #7b5fc9, #a2d8e5)',
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
            background: 'linear-gradient(45deg, #a2d8e5, #7b5fc9)',
            borderRadius: '50%',
            opacity: 0.1,
            filter: 'blur(40px)'
          }}></div>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
