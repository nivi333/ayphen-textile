import LoginForm from '../components/auth/LoginForm';
import { AuthLayout } from '../components/ui';

// Login page component
function LoginPage() {
  return (
    <AuthLayout animated={true} animationVariant='login'>
      <LoginForm />
    </AuthLayout>
  );
}
export default LoginPage;
