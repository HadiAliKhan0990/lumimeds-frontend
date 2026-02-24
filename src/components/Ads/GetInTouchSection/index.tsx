import React from 'react';
import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';



export const AdsPageGetInTouchSection = ({ className = '', ...props }: React.ComponentPropsWithoutRef<'div'>) => {
  const dispatch = useDispatch();

  const handleGetInTouch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(setModal({ modalType: 'Get In Touch' }));
  };

  return (
    <div className={`otp-contact-content tw-py-4 ${className}`} {...props}>
      <div className='tw-text-center'>
        <h3 className='display-6 fw-semibold text-white mb-2'>Got Questions?</h3>
        <p className='tw-text-sm sm:tw-text-lg tw-text-[#F2F2F2] tw-font-normal tw-text-center  tw-leading-tight tw-mb-0'>
          {`We're here to help with answers and guidance on your weight loss journey.`} <br className='tw-hidden sm:tw-block' />
          {`Feel free to reach out—we're just a call away.`}
        </p>
        {/* <p className='tw-text-sm sm:tw-text-lg tw-text-[#F2F2F2] tw-font-normal tw-text-center  tw-leading-tight tw-mb-0'>{`Feel free to reach out—we're just a call away.`}</p> */}
      </div>
      <div className='tw-flex tw-justify-center tw-mt-4 sm:tw-mt-6'>
        <button
          type='button'
          onClick={handleGetInTouch}
          className='tw-text-sm sm:tw-text-xl tw-whitespace-nowrap  tw-bg-white  tw-h-14 tw-text-black tw-px-6 tw-py-3 tw-rounded-full  tw-font-normal tw-transition tw-duration-300 hover:tw-opacity-90 hover:tw-text-black tw-flex tw-items-center tw-justify-center tw-no-underline tw-border-0 tw-cursor-pointer'
        >
          Get in Touch
        </button>
      </div>
    </div>
  );
};
