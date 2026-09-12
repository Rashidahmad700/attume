import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'We will email you a link to choose a new password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
