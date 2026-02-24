import { LoginForm } from '@/components/Auth/LoginForm';
import { ROUTES } from '@/constants';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin Login',
    description: 'Access your LumiMeds admin account securely. Log in with your administrator credentials to manage platform operations.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/admin/login',
    },
    openGraph: {
      title: 'Admin Login',
      description: 'Access your LumiMeds admin account securely. Log in with your administrator credentials to manage platform operations.',
      type: 'website',
      url: 'https://www.lumimeds.com/admin/login',
    },
  };
}

export default function AdminLogin() {
  return (
    <div className={'flex-grow-1 d-flex flex-column align-items-center justify-content-center container'}>
      <div className='tw-max-w-md'>
        <div className='d-flex justify-content-center mb-3'>
          <h1 className='badge bg-primary-subtle text-primary px-3 py-2 text-uppercase fw-semibold tw-text-base md:tw-text-lg'>
            🛡️ Admin Portal
          </h1>
        </div>
        <p className='tw-text-4xl tw-text-center tw-font-medium'>Welcome Back!</p>
        <p className={'fw-medium text-center text-base mb-5'}>Enter your admin credentials to access your account</p>
        <LoginForm role='admin' homeRoute={ROUTES.ADMIN_ORDERS} forgotHref={ROUTES.ADMIN_FORGOT_PASSWORD} />
      </div>
    </div>
  );
}
