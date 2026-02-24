import { LoginForm } from '@/components/Auth/LoginForm';
import { ROUTES } from '@/constants';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Provider Login',
    description: 'Securely sign in to your LumiMeds provider portal. Enter your credentials to access patient information, treatment plans, and account tools.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/provider/login',
    },
    openGraph: {
      title: 'Provider Login',
      description: 'Securely sign in to your LumiMeds provider portal. Enter your credentials to access patient information, treatment plans, and account tools.',
      type: 'website',
      url: 'https://www.lumimeds.com/provider/login',
    },
  };
}

export default function Page() {
  return (
    <div className='tw-flex-grow tw-container tw-px-4 tw-mx-auto tw-flex tw-items-center tw-justify-center'>
      <div className='tw-max-w-md'>
        <div className='d-flex justify-content-center mb-3'>
          <h1 className='badge bg-primary-subtle text-primary px-3 py-2 text-uppercase fw-semibold tw-text-base md:tw-text-lg'>
            👨‍⚕️ Provider Portal
          </h1>
        </div>
        <p className='tw-text-4xl tw-text-center tw-font-medium'>Welcome Back!</p>
        <p className={'fw-medium text-center text-base mb-5'}>Enter your provider credentials to access your account</p>
        <LoginForm role='provider' forgotHref={ROUTES.PROVIDER_FORGOT_PASSWORD} homeRoute={ROUTES.PROVIDER_HOME} />
      </div>
    </div>
  );
}
