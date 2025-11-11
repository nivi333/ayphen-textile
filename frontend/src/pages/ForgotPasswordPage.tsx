import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { AuthLayout } from '../components/ui';

// Forgot password page component
export function ForgotPasswordPage() {
  return (
    <AuthLayout
      animated={true}
      animationVariant="forgot-password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
