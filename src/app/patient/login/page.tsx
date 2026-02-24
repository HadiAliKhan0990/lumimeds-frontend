import { LoginForm } from '@/components/Patient/LoginForm';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Lumimeds Patient Portal Login | Access Your Account',
    description: 'Log in to the Lumimeds patient portal to access your account, manage your treatment details, update information, and stay connected with your care team.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/patient/login',
    },
    openGraph: {
      title: 'Lumimeds Patient Portal Login | Access Your Account',
      description: 'Log in to the Lumimeds patient portal to access your account, manage your treatment details, update information, and stay connected with your care team.',
      type: 'website',
      url: 'https://www.lumimeds.com/patient/login',
    },
  };
}

interface Props {
  searchParams: Promise<{
    redirect?: string;
    email?: string;
    password?: string;
  }>;
}

export default async function PatientLogin({ searchParams }: Readonly<Props>) {
  const { redirect, email, password } = await searchParams;
  return <LoginForm redirect={redirect} email={email} password={password} />;
}
