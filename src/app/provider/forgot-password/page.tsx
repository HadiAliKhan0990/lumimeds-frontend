import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { ROUTES } from '@/constants';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reset Provider Password',
    description: 'Forgot your LumiMeds provider password? Enter your email to receive a secure password reset link and regain access to your provider account.',
    robots: 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/provider/forgot-password',
    },
    openGraph: {
      title: 'Reset Provider Password',
      description: 'Reset Your Password.',
      type: 'website',
      url: 'https://www.lumimeds.com/provider/forgot-password',
    },
  };
}

export default function Page() {
  return <ForgotPassword role='provider' backLink={ROUTES.PROVIDER_LOGIN} />;
}
