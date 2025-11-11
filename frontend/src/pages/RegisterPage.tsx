import { RegistrationWizard } from '../components/auth/RegistrationWizard';
import { AuthLayout } from '../components/ui';

export function RegisterPage() {
  return (
    <AuthLayout
      animated={true}
      animationVariant="register"
    >
      <RegistrationWizard />
    </AuthLayout>
  );
}
