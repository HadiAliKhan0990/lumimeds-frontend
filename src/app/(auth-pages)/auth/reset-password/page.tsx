import ResetPasswordForm from '@/components/ResetPassword/ResetPasswordForm';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reset Provider Password',
    description: 'Reset Your Password.',
    robots: 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/auth/reset-password',
    },
    openGraph: {
      title: 'Reset Provider Password',
      description: 'Reset Your Password.',
      type: 'website',
      url: 'https://www.lumimeds.com/auth/reset-password',
    },
  };
}

interface Props {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPassword({ searchParams }: Readonly<Props>) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
