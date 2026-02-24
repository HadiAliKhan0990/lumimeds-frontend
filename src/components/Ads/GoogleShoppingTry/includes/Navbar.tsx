'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { IoClose, IoCall } from 'react-icons/io5';
import LogoSvg from '@/components/Ads/GoogleShoppingTry/includes/Logo';
import { Spinner } from 'react-bootstrap';

interface GoogleShoppingTryNavbarProps {
  className?: string;
  logoColor?: string;
}

export default function GoogleShoppingTryNavbar({ className, logoColor }: GoogleShoppingTryNavbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();
  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  const handleClose = () => {
    setOpen(false);
  };

  useOutsideClick({
    ref,
    handler: handleClose,
  });

  useEffect(() => handleClose(), [pathname]);

  const handleGetStarted = async () => {
    if (selectedProduct) {
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product: selectedProduct,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
        surveyCategory,
      });
      return;
    }
    startTransition(() => router.push('/products'));
  };

  return (
    <nav
      ref={ref}
      className={`tw-bg-transparent tw-w-full tw-z-50 tw-transition-all tw-duration-300 ${className}`}
    >
      <div className='tw-px-10 tw-w-full'>
        <div className='tw-flex tw-items-center tw-justify-between tw-h-16 md:tw-h-20'>
          <Link href='/' className='tw-flex tw-items-center tw-no-underline'>
            <LogoSvg fillColor={logoColor} />
          </Link>

          <div className='tw-hidden md:tw-flex tw-flex-col tw-items-center tw-gap-1'>
            <button
              type='button'
              onClick={handleGetStarted}
              disabled={isPending}
              className='tw-w-[186px] tw-h-[48px] tw-border-2 tw-border-white tw-border-solid tw-rounded-full tw-cursor-pointer tw-p-0 tw-text-white tw-font-lato tw-font-medium tw-text-base tw-transition-all tw-duration-200 hover:tw-bg-[#222A3F] hover:tw-text-white disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
            >
              {isPending && <Spinner className='border-2' size='sm' />}
              <span>{'Get Started'}</span>
            </button>
            <span className='tw-text-xs tw-text-white tw-font-lato'>Prescription required</span>
          </div>

          <div className='tw-flex md:tw-hidden tw-items-center'>
            <button
              type='button'
              onClick={() => setOpen(!open)}
              className='tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-gap-1.5 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0'
              aria-label='Toggle menu'
            >
              <span
                className={`tw-block tw-w-6 tw-h-0.5 tw-bg-[#222A3F] tw-transition-all tw-duration-300 ${
                  open ? 'tw-rotate-45 tw-translate-y-2' : ''
                }`}
              />
              <span
                className={`tw-block tw-w-6 tw-h-0.5 tw-bg-[#222A3F] tw-transition-all tw-duration-300 ${
                  open ? 'tw-opacity-0' : ''
                }`}
              />
              <span
                className={`tw-block tw-w-6 tw-h-0.5 tw-bg-[#222A3F] tw-transition-all tw-duration-300 ${
                  open ? '-tw-rotate-45 -tw-translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {open && (
          <div className='tw-fixed tw-inset-0 tw-bg-[#222A3F] tw-z-[9999] tw-md:hidden tw-flex tw-flex-col tw-justify-between tw-h-screen tw-w-screen'>
            <div className='tw-flex tw-items-center tw-justify-between tw-px-4 md:tw-px-6 tw-py-4'>
              <Link href='/' className='tw-flex tw-items-center tw-no-underline' onClick={handleClose}>
                <LogoSvg fillColor='#fff' />
              </Link>
              <button
                type='button'
                onClick={handleClose}
                className='tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-2 tw-text-white hover:tw-opacity-80 tw-transition-opacity'
                aria-label='Close menu'
              >
                <IoClose className='tw-w-6 tw-h-6' />
              </button>
            </div>

            <div className='tw-px-4 md:tw-px-6 tw-pb-8 tw-space-y-4'>
              <div className='tw-flex tw-flex-col tw-gap-1'>
                <button
                  type='button'
                  onClick={() => {
                    handleGetStarted();
                    handleClose();
                  }}
                  disabled={isPending}
                  className='tw-w-full tw-h-[48px] tw-bg-transparent tw-border-2 tw-border-white tw-border-solid tw-cursor-pointer tw-p-0 tw-text-white tw-font-lato tw-font-medium tw-text-base tw-transition-all tw-duration-200 hover:tw-bg-white hover:tw-bg-opacity-10 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed tw-rounded-full'
                >
                  {isPending ? 'Loading...' : 'Get Started'}
                </button>
                <span className='tw-text-xs tw-text-white tw-font-lato tw-text-center tw-opacity-70'>
                  Prescription required
                </span>
              </div>

              <a
                href='tel:+14159680890'
                className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full tw-h-[48px] tw-bg-[#4685F4] tw-rounded-full tw-text-white tw-font-lato tw-font-medium tw-text-base tw-no-underline tw-transition-all tw-duration-200 hover:tw-opacity-90'
              >
                <IoCall className='tw-w-5 tw-h-5' />
                <span>(415) 968-0890</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
