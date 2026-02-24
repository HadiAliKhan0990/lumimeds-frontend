'use client';

import Link from 'next/link';
import { Modal } from '@/components/elements';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { PatientProfile } from '@/store/slices/patientProfileSlice';
import { HiClipboardCheck } from 'react-icons/hi';

interface PendingSubmissionGuardProps {
  profile?: PatientProfile;
}

export function PendingSubmissionGuard({ profile }: Readonly<PendingSubmissionGuardProps>) {
  const pathname = usePathname();

  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleNavigateToForms = () => {
    setOpenModal(false);
  };

  const footer = (
    <>
      <button type='button' className='btn btn-outline-primary w-100' onClick={handleClose}>
        Remind Me Later
      </button>
      <Link href={ROUTES.PATIENT_FORMS} onClick={handleNavigateToForms} className='btn btn-primary w-100'>
        Complete Forms
      </Link>
    </>
  );

  useEffect(() => {
    const shouldDisplayModal =
      profile?.user?.status === 'pending_submission' &&
      pathname !== ROUTES.PATIENT_SURVEYS &&
      pathname !== ROUTES.PATIENT_FORMS &&
      !pathname.includes(ROUTES.PATIENT_MESSAGES) &&
      !pathname.includes(ROUTES.PATIENT_FIRST_LOGIN_UPDATE);

    setOpenModal(shouldDisplayModal);
  }, [pathname, profile?.user?.status]);

  return (
    <Modal
      size='lg'
      title='Action Needed: Submit Your Forms'
      footer={footer}
      isOpen={openModal}
      onClose={handleClose}
      closeOnBackdropClick={false}
      footerClassName='tw-flex-col sm:tw-flex-row sm:tw-justify-end'
    >
      <div className='tw-space-y-4 tw-py-4 tw-pb-6'>
        <div className='tw-space-y-1'>
          <p className='tw-text-base tw-font-semibold tw-text-gray-900'>We still need a final submission from you.</p>
          <p className='tw-text-sm tw-text-gray-600'>
            Finishing now keeps your care plan moving—providers review everything once these forms are submitted.
          </p>
        </div>

        <div className='tw-flex tw-items-start tw-gap-3 tw-rounded-lg tw-border tw-border-blue-100 tw-bg-blue-50 tw-p-4'>
          <span className='tw-flex tw-h-9 tw-w-9 tw-flex-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-text-blue-600'>
            <HiClipboardCheck className='tw-h-5 tw-w-5' aria-hidden='true' />
          </span>
          <div className='tw-space-y-1 tw-mt-2'>
            <p className='tw-text-sm tw-font-semibold tw-text-blue-900'>Next step: submit the required forms</p>
            <p className='tw-text-xs sm:tw-text-sm tw-text-blue-900'>
              We have everything ready for you — tap Complete Forms to review and finish in just a few minutes.
            </p>
          </div>
        </div>

        <p className='tw-text-xs tw-text-gray-500'>Need help? You can reach our support team anytime.</p>
      </div>
    </Modal>
  );
}
