'use client';

import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';

export const GetInTouchModal = () => {
  const dispatch = useDispatch();

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
  }

  return (
    <div className='tw-px-2'>
      <div className='tw-flex tw-flex-col tw-items-center tw-text-center'>
        {/* Heading */}
        <span className='tw-text-black tw-mb-6 tw-text-3xl !tw-font-normal tw-font-sans'>{`Let's Talk!`}</span>

        {/* Message */}
        <p className='tw-text-gray-500 tw-text-base tw-leading-relaxed !tw-mb-0'>
          {`Feel free to reach out anytime. Here's our direct line:`}
        </p>
        <a href='tel:+14159680890' className='tw-text-primary tw-underline '>
          (415) 968-0890
        </a> 

        {/* Close Button */}
        <button
          onClick={handleClose}
          className='tw-mt-8 tw-w-full tw-bg-black tw-text-white tw-rounded-lg tw-px-5 tw-py-2 tw-font-semibold  tw-transition-colors hover:tw-opacity-90 tw-border-0 tw-cursor-pointer'
        >
          Close
        </button>
      </div>
    </div>
  );
};

