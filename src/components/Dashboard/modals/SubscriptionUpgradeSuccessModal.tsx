'use client';

import { Modal } from 'react-bootstrap';
import { SuccessCircleCheck } from '@/components/Icon/SuccessCircleCheck';

interface SubscriptionUpgradeSuccessModalProps {
  show: boolean;
  onClose: () => void;
  subscriptionName?: string;
}

export const SubscriptionUpgradeSuccessModal = ({
  show,
  onClose,
  subscriptionName = 'Compounded Tirzepatide (GLP-1/GIP) Weight loss Injections Value 3-Month Subscription',
}: Readonly<SubscriptionUpgradeSuccessModalProps>) => {
  return (
    <Modal
      show={show}
      centered
      backdrop='static'
      keyboard={false}
      className='subscription-upgrade-success-modal'
      contentClassName='tw-bg-transparent tw-border-0 tw-max-w-[390px] tw-mx-auto'
    >
      <Modal.Body className='!tw-p-0'>
        <div className='tw-bg-[#1751D0] tw-rounded-md tw-text-white tw-text-center tw-p-6 md:tw-p-8'>
          <div className='tw-mb-6 tw-font-secondary'>
            {/* Success Icon */}
            <div className='tw-flex tw-justify-center tw-mb-4'>
              <div className='tw-rounded-full tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-white/20'>
                <SuccessCircleCheck size={36} circleFill='rgba(255,255,255,0.2)' checkmarkStroke='#ffffff' />
              </div>
            </div>

            {/* Heading */}
            <h3 className='tw-text-xl md:tw-text-2xl tw-font-semibold tw-mb-4 tw-text-white'>
              Subscription activated
            </h3>

            {/* Body Text */}
            <p className='tw-text-sm md:tw-text-base tw-text-white tw-leading-relaxed tw-opacity-95 tw-mb-3'>
              Your subscription for <strong>{subscriptionName}</strong> has been activated successfully.
            </p>

            {/* Update Delay Note */}
            <p className='tw-text-base tw-font-bold tw-text-white tw-mb-0'>
              It may take a few minutes for the update to reflect in your dashboard.
            </p>
          </div>

          {/* Action Button */}
          <div className='tw-flex tw-justify-center'>
            <button
              onClick={onClose}
              className='tw-bg-white tw-text-black tw-px-8 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-base hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 tw-w-full tw-max-w-[280px] tw-font-secondary'
            >
              OK, got it
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};