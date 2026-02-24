'use client';

import { Modal } from 'react-bootstrap';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import ThreeVialsImage from '@/assets/threevials.svg';
import { SUBSCRIPTION_UPGRADE } from '@/constants';

interface SubscriptionUpgradeModalProps {
  show: boolean;
  onClose: () => void;
  onShowConfirmation?: () => void;
}

export const SubscriptionUpgradeModal = ({
  show,
  onClose,
  onShowConfirmation,
}: SubscriptionUpgradeModalProps) => {
  const upgradePercentage = SUBSCRIPTION_UPGRADE.PERCENTAGE;
  const upgradePrice = SUBSCRIPTION_UPGRADE.PRICE;

  const handleUpgradeClick = () => {
    onClose(); // Close current modal
    onShowConfirmation?.(); // Open confirmation modal
  };
  return (
    <Modal
      show={show}
      centered
      backdrop='static'
      keyboard={false}
      className='subscription-upgrade-modal'
      contentClassName='tw-bg-transparent tw-border-0 tw-max-w-[390px] tw-mx-auto'
    >
      <Modal.Body className='!tw-p-0'>
        <button
          onClick={onClose}
          className='tw-absolute tw-top-3 tw-right-3 tw-z-10 tw-p-1.5 hover:tw-bg-white/20 tw-rounded-full tw-transition-colors tw-duration-200 tw-text-white'
          aria-label='Close modal'
        >
          <IoClose className='tw-w-6 tw-h-6' />
        </button>

        <div className='tw-bg-[#1751D0] tw-rounded-md tw-text-white tw-text-center'>
          <div className='tw-flex tw-justify-center tw-items-center tw-pt-9'>
            <Image
              src={ThreeVialsImage}
              alt='Compounded GLP-1/GIP Vials'
              width={192}
              height={200}
              className='tw-object-contain'
            />
          </div>
          <div className='tw-mb-4 tw-max-w-[246px] md:tw-max-w-[363px] mx-auto tw-font-secondary'>
            <h2 className='tw-text-2xl md:tw-text-3xl lg:tw-text-4xl tw-leading-tight'>
              <span className='tw-line-through' style={{ textDecorationThickness: '1.5px' }}>
                $649
              </span>
              <span> Subscription <span className='tw-font-semibold'>in only ${upgradePrice}</span></span>
            </h2>
          </div>

          <div className='tw-flex tw-items-center tw-justify-center tw-max-w-[304px] tw-h-[126px] mx-auto'>
            <p className='tw-text-sm md:tw-text-base tw-font-secondary tw-font-medium tw-text-[#FFFDF6] tw-mb-0'>
              Yahoo! You are eligible for a discounted upgrade with {upgradePercentage} Discount applied. Pay only ${upgradePrice} for $649
              Subscription
            </p>
            </div>
            <button
              onClick={handleUpgradeClick}
              className='tw-bg-white tw-text-black tw-font-dm-sans tw-px-2 md:tw-px-4 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium md:tw-text-base hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 tw-w-full md:tw-w-auto tw-font-secondary tw-mt-8 tw-mb-12 tw-max-w-[260px] md:tw-max-w-full'
            >
              Upgrade to Value 3-Month Subscription
            </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
