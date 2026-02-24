'use client';

import Modal from '@/components/elements/Modal';
import { ROUTES } from '@/constants';
import Link from 'next/link';
import ArrowVideoAppointment from '../Icon/ArrowVideoAppointment';
import VideoAppointment from '../Icon/VideoAppointment';

interface VideAppointmentModalProps {
  show?: boolean;
  onHide?: () => void;
}

const VideAppointmentModal = ({ show = false, onHide }: VideAppointmentModalProps) => {
  const handleClose = () => {
    onHide?.();
  };
  const instructions = [
    {
      number: 1,
      boldText: 'Login to your portal',
      restText: 'to access your account and view appointment details.',
    },
    {
      number: 2,
      boldText: 'Check your email',
      restText: 'for a message titled "LumiMeds - Schedule Your Appointment".',
    },
    {
      number: 3,
      boldText: 'Navigate to Appointments',
      restText: 'in your portal and join your video call at the scheduled time.',
    },
  ];

  return (
    <Modal
      isOpen={show}
      onClose={handleClose}
      size='sm'
      showCloseButton={true}
      disabledBodyPadding={true}
      className='tw-max-w-[455px]'
      bodyClassName='tw-max-h-none tw-overflow-visible tw-p-0'
    >
      <div className='tw-w-full tw-bg-white tw-rounded-lg md:tw-p-8 tw-p-4'>
        {/* Header Section - Icon and Title */}
        <div className='tw-flex tw-flex-col tw-items-center tw-pt-0 tw-pb-2'>
          {/* Video Camera Icon in Light Blue Circle */}
          <div className='tw-w-16 tw-h-16 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-4 tw-bg-[#DBEAFE]'>
            <VideoAppointment />
          </div>

          {/* Title */}
          <h2 className='tw-text-2xl tw-font-bold tw-text-gray-800 tw-m-0 tw-text-center'>
            Video Consultation Required
          </h2>
        </div>

        {/* Description */}
        <div className='tw-pb-6'>
          <p className='tw-text-base tw-text-gray-600 tw-mb-0 tw-text-center'>
            To complete your order, please schedule a brief video appointment with one of our licensed doctors.
          </p>
        </div>

        {/* Instructions Section with Light Blue Background */}
        <div className='tw-mb-6 tw-p-3 md:tw-p-6 tw-rounded-xl tw-bg-gradient-to-r tw-from-[#EFF6FF] tw-to-[#EEF2FF]'>
          <div className='tw-space-y-4'>
            {instructions.map((instruction) => (
              <div key={instruction.number} className='tw-flex tw-items-start tw-gap-3'>
                {/* Number Circle */}
                <div className='tw-w-8 tw-h-8 tw-rounded-full tw-bg-white tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 tw-mt-0.5 tw-shadow-[0px_1px_2px_0px_#0000000D]'>
                  <span className='tw-text-blue-500 tw-text-sm tw-font-bold'>{instruction.number}</span>
                </div>

                {/* Instruction Text */}
                <p className='tw-text-sm tw-text-gray-800 tw-mb-0'>
                  <span className='tw-font-bold'>{instruction.boldText}</span> {instruction.restText}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <div className='tw-pb-4'>
          <Link
            href={ROUTES.PATIENT_LOGIN}
            className='tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3 tw-px-6 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-colors tw-duration-200 tw-no-underline tw-shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A]'
          >
            <ArrowVideoAppointment />
            <p className='tw-w-44 tw-mb-0 tw-text-center'>Login to Portal</p>
          </Link>
        </div>

        {/* Help Text */}
        <div className='tw-pb-0'>
          <p className='tw-text-sm tw-text-gray-500 tw-mb-0 tw-text-center'>
            Need help? Contact us at{' '}
            <a href='tel:+14159680890' className='tw-text-blue-600 hover:tw-text-blue-700 tw-no-underline'>
              (415) 968-0890
            </a>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VideAppointmentModal;
