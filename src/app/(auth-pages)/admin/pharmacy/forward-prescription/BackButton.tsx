'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { useTransition } from 'react';

interface BackButtonProps {
  returnUrl?: string;
}

export default function BackButton({ returnUrl }: BackButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBack = () => {
    startTransition(() => {
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.back();
      }
    });
  };

  return (
    <button
      onClick={handleBack}
      disabled={isPending}
      className='text-decoration-none text-charcoal-purple text-sm fw-medium d-inline-flex align-items-center gap-2 mb-4 mt-lg-3 border-0 bg-transparent p-0'
      style={{ cursor: isPending ? 'wait' : 'pointer' }}
    >
      <FaArrowLeft size={14} />
      Back
    </button>
  );
}

