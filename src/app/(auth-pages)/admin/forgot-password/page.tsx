import { ForgotPassword } from '@/components/Auth/ForgotPassword';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reset Admin Password',
    description: 'Reset Your Password.',
  robots: 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/admin/forgot-password',
    },
    openGraph: {
      title: 'Reset Admin Password',
      description: 'Reset Your Password.',
      type: 'website',
      url: 'https://www.lumimeds.com/admin/forgot-password',
    },
};
}

export default function Page() {
  return <ForgotPassword role='admin' backLink='/admin/login' />;
}
