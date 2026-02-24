'use client';

import { Modal } from 'react-bootstrap';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import { IoMdCheckmark } from 'react-icons/io';
import BlueLoader from '@/assets/blue-loader.svg';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import VisaIcon from '@/components/Icon/VisaIcon';
import { useState, useEffect } from 'react';

interface SubscriptionUpgradeConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (selectedPaymentMethodId: string) => void;
  isLoading?: boolean;
  paymentMethods?: PaymentMethod[];
}

export const SubscriptionUpgradeConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  isLoading = false,
  paymentMethods = [],
}: SubscriptionUpgradeConfirmationModalProps) => {
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

  // Set default selected payment method when modal opens or payment methods change
  useEffect(() => {
    if (show && paymentMethods.length > 0) {
      // Always select the first payment method
      setSelectedPaymentMethodId(paymentMethods[0]?.id || null);
    }
  }, [show, paymentMethods]);

  const handleConfirm = () => {
    if (selectedPaymentMethodId) {
      onConfirm(selectedPaymentMethodId);
    }
  };

  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
  };

  return (
    <Modal
      show={show}
      centered
      backdrop='static'
      keyboard={false}
      className='subscription-upgrade-confirmation-modal'
      contentClassName='tw-bg-transparent tw-border-0 tw-max-w-[390px] tw-mx-auto'
    >
      <Modal.Body className='!tw-p-0'>
        {!isLoading && (
          <button
            onClick={onClose}
            className='tw-absolute tw-top-3 tw-right-3 tw-z-10 tw-p-1.5 hover:tw-bg-white/20 tw-rounded-full tw-transition-colors tw-duration-200 tw-text-white'
            aria-label='Close modal'
          >
            <IoClose className='tw-w-6 tw-h-6' />
          </button>
        )}

        <div
          className={`${
            isLoading ? 'tw-bg-white' : 'tw-bg-[#1751D0]'
          } tw-rounded-md tw-text-center tw-p-6 md:tw-p-8`}
        >
          <div className='tw-mb-6 tw-font-secondary'>
            {isLoading ? (
              <>
                <h3 className='tw-text-xl md:tw-text-2xl tw-font-semibold tw-mb-4 tw-text-gray-800'>
                  Upgrading to Subscription
                </h3>
                <p className='tw-text-sm md:tw-text-base tw-text-gray-600 tw-mb-6'>
                  Please wait while we are processing your Order
                </p>
                <div className='tw-flex tw-items-center tw-justify-center tw-py-4'>
                  <Image
                    src={BlueLoader}
                    alt='Loading'
                    width={128}
                    height={128}
                    className='tw-animate-spin'
                  />
                </div>
              </>
            ) : (
              <>
                <h3 className='tw-text-xl md:tw-text-2xl tw-font-semibold tw-mb-4 tw-text-white'>
                  Confirm Subscription Upgrade
                </h3>
                <p className='tw-text-sm md:tw-text-base tw-text-white tw-leading-relaxed tw-opacity-95 tw-mb-4'>
                  By confirming, you acknowledge that you are starting a subscription and that your subscription will
                  automatically renew after the initial term.
                </p>

                {/* Payment Method Selection */}
                {paymentMethods.length > 0 && (
                  <div className='tw-mt-4 tw-text-left'>
                    <p className='tw-text-sm tw-font-medium tw-text-white tw-mb-3 tw-opacity-90'>Select Payment Method:</p>
                    <div className='tw-space-y-2'>
                      {paymentMethods.map((paymentMethod) => {
                        const isSelected = selectedPaymentMethodId === paymentMethod.id;
                        return (
                          <button
                            key={paymentMethod.id}
                            type='button'
                            onClick={() => handlePaymentMethodSelect(paymentMethod.id)}
                            className={`tw-w-full tw-p-3 tw-rounded-lg tw-border-2 tw-text-left tw-transition-all tw-duration-200 ${
                              isSelected
                                ? 'tw-border-white tw-bg-white/20'
                                : 'tw-border-white/30 tw-bg-white/10 hover:tw-bg-white/15'
                            }`}
                          >
                            <div className='tw-flex tw-items-center tw-gap-3'>
                              <VisaIcon width={38} height={24} />
                              <div className='tw-flex tw-flex-col tw-flex-1 tw-min-w-0'>
                                <span className='tw-font-medium tw-text-white tw-text-sm tw-truncate'>
                                  {paymentMethod.brand} ending in {paymentMethod.last_four_digits}
                                </span>
                                <span className='tw-text-white tw-opacity-80 tw-text-xs'>
                                  Expires {paymentMethod?.expiry?.split('-').reverse().join('/')}
                                </span>
                              </div>
                              <div className='tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'>
                                {isSelected ? (
                                  <div className='tw-w-5 tw-h-5 tw-rounded-full tw-bg-white tw-text-[#1751D0] tw-flex tw-items-center tw-justify-center'>
                                    <IoMdCheckmark size={14} />
                                  </div>
                                ) : (
                                  <div className='tw-w-5 tw-h-5 tw-rounded-full tw-border-2 tw-border-white/50' />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isLoading && (
            <div className='tw-flex tw-justify-center'>
              <button
                onClick={handleConfirm}
                disabled={isLoading || !selectedPaymentMethodId}
                className='tw-bg-white tw-text-black tw-px-8 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-base hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 tw-w-full tw-max-w-[280px] tw-font-secondary disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};
