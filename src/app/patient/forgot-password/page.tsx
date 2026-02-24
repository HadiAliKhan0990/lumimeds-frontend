import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export default function Page() {
  return <ForgotPassword role='patient' backLink='/patient/login' />;
}
