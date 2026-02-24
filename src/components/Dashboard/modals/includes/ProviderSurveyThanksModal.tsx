import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setModal } from '@/store/slices/modalSlice';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

export const ProviderSurveyThanksModal = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch(setModal({ modalType: undefined }));
      router.push(ROUTES.PROVIDER_LOGIN);
    }, 10000);
    return () => clearTimeout(timerId);
  }, [dispatch, router]);

  return (
    <div className='text-center p-3 tw-relative'>
      <h4 className='mb-3'>🎉 Thank you for your submission!</h4>
      <p>Your registration has been submitted successfully.</p>
      <p className='mt-3 mb-4 text-muted'>
        An administrator will review your response and contact you via email shortly if necessary.
      </p>
      <button
        className='btn btn-primary rounded-pill px-4'
        onClick={() => {
          dispatch(setModal({ modalType: undefined }));
          router.push(ROUTES.PROVIDER_LOGIN);
        }}
      >
        OK, got it!
      </button>
    </div>
  );
};
