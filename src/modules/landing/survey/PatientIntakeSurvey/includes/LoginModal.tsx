'use client';

import Link from 'next/link';
import { Modal } from '@/components/elements';
import { ROUTES } from '@/constants';
import { getCachedAuth } from '@/lib/baseQuery';
import { useEffect, useState } from 'react';

interface Props {
  email: string;
  openModal: boolean;
  handleClose: () => void;
}

export const LoginModal = ({ email, openModal, handleClose }: Readonly<Props>) => {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  async function handleLogin() {
    const { accessToken } = await getCachedAuth();
    if (accessToken) {
      setLoginUrl(ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS);
    } else {
      setLoginUrl(
        `${ROUTES.PATIENT_LOGIN}?redirect=${encodeURIComponent(
          ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS
        )}&email=${encodeURIComponent(email)}`
      );
    }
  }

  const footer = (
    <>
      <button
        onClick={handleClose}
        className='tw-px-6 tw-w-full tw-py-2 tw-text-primary tw-font-medium tw-rounded-lg tw-border tw-border-primary tw-border-solid hover:tw-bg-primary/10 tw-transition-all tw-duration-200'
      >
        Cancel
      </button>
      <Link
        href={loginUrl || '#'}
        className='tw-bg-primary tw-w-full hover:tw-bg-primary/85 tw-text-white tw-no-underline tw-font-medium tw-py-2 tw-px-6 tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-sm'
      >
        Log In
      </Link>
    </>
  );

  useEffect(() => {
    handleLogin();
  }, [email]);

  return (
    <Modal size='md' title='Login Required' footer={footer} isOpen={openModal} onClose={handleClose} headerClassName='!tw-text-left'>
      <p className='tw-text-gray-600 tw-text-left tw-font-medium'>
        Please login to your account to manage your subscription or make any changes.
      </p>
    </Modal>
  );
};
