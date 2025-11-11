import { LoginForm } from '../components/auth/LoginForm';
import { AuthLayout } from '../components/ui';

// Login page component
export function LoginPage() {
  return (
    <AuthLayout
      animated={true}
      animationVariant="login"
    >
      <LoginForm />
    </AuthLayout>
  );
}
