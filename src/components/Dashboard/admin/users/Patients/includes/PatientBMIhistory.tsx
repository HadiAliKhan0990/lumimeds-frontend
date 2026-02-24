'use client';

import { useEffect } from 'react';
import { useLazyGetPatientBmiHistoryQuery } from '@/store/slices/patientsApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { RootState } from '@/store';
import { formatUSDateShort } from '@/helpers/dateFormatter';
import { Modal } from '@/components/elements';

export interface PatientBMIhistoryProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  patientId: string;
  patient?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    bio?: {
      height?: number;
      weight?: number | string;
      bmi?: number;
    };
    [key: string]: unknown;
  }; // Add patient data prop
}

export default function PatientBMIhistory(props: PatientBMIhistoryProps) {
  const { isOpen, onClose, title = 'BMI History', patientId, patient: patientProp } = props;
  const dispatch = useDispatch();
  const patientFromStore = useSelector((state: RootState) => state.patient);

  // Use patient prop if available, otherwise fall back to store
  const patient =
    patientProp ||
    (patientFromStore as {
      id?: string;
      firstName?: string;
      lastName?: string;
      bio?: {
        height?: number;
        weight?: number | string;
        bmi?: number;
      };
      [key: string]: unknown;
    });

  const [getPatientBmiHistory, { isFetching: isLoading, data: bmiHistories = [] }] = useLazyGetPatientBmiHistoryQuery();

  // Fallback values
  const fallbackWeight = '--';
  const fallbackHeight = '--';

  useEffect(() => {
    if (isOpen && patientId) {
      getPatientBmiHistory(patientId);
    }
  }, [isOpen, patientId]);

  const handleUpdateMetrics = () => {
    // Close the current BMI History modal
    onClose();

    // Use patient's bio data with fallback values
    dispatch(
      setModal({
        modalType: 'Edit Patient Body Metrics',
        ctx: {
          height: patient?.bio?.height,
          weight: patient?.bio?.weight,
          bmi: patient?.bio?.bmi,
        },
      })
    );
  };

  const footer = (
    <div className='tw-flex tw-justify-between tw-items-center tw-w-full'>
      <button
        type='button'
        className='tw-flex tw-items-center tw-gap-2 tw-bg-transparent tw-border-0 tw-p-0'
        onClick={handleUpdateMetrics}
      >
        <p className='!tw-mb-0 tw-border !tw-border-[#292D32] tw-rounded-md tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center'>
          +
        </p>
        Update Metrics
      </button>
      <button
        type='button'
        className='tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
        onClick={onClose}
      >
        Dismiss
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size='lg'
      footer={footer}
      showFooter={true}
      isLoading={isLoading}
      loadingText='Loading BMI history...'
      bodyClassName='tw-min-h-96'
    >
      {!isLoading && bmiHistories.length > 0 ? (
        <div className='tw-w-full tw-overflow-x-auto'>
          {/* Header Row */}
          <div className='tw-bg-[#F5F9FF] tw-px-3 sm:tw-px-6 tw-py-4 tw-rounded-t-lg tw-border-b tw-border-gray-200'>
            <div className='tw-grid tw-grid-cols-4 tw-gap-2 sm:tw-gap-4 md:tw-gap-8 tw-min-w-[270px]'>
              <div className='tw-font-semibold tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[100px] sm:tw-min-w-[140px]'>
                DATE
              </div>
              <div className='tw-font-semibold tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[60px] sm:tw-min-w-[80px] tw-pl-4 sm:tw-pl-0'>
                BMI
              </div>
              <div className='tw-font-semibold tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[80px] sm:tw-min-w-[100px]'>
                WEIGHT
              </div>
              <div className='tw-font-semibold tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[80px] sm:tw-min-w-[100px]'>
                HEIGHT
              </div>
            </div>
          </div>

          {/* Data Rows */}
          <div className='tw-overflow-hidden'>
            {bmiHistories.map(({ timestamp, bmi, weight, heightFeet, heightInches }, index) => {
              const formattedBmi = (() => {
                const numericBmi = Number(bmi);
                if (!Number.isFinite(numericBmi)) return '--';
                const withTwoDecimals = numericBmi.toFixed(2);
                return withTwoDecimals.replace(/\.?0+$/, '');
              })();

              // Format weight display
              const formattedWeight = weight ? `${weight} lbs` : fallbackWeight;

              // Format height display
              const formattedHeight = (() => {
                if (heightFeet && heightInches) {
                  return `${heightFeet}'${heightInches}`;
                } else if (heightFeet) {
                  return `${heightFeet}'`;
                } else if (heightInches) {
                  return `${heightInches}"`;
                }
                return fallbackHeight;
              })();

              return (
                <div
                  key={index}
                  className={`tw-px-3 sm:tw-px-6 tw-py-4 tw-border-b tw-border-gray-100 hover:tw-bg-gray-50 tw-transition-colors ${
                    index === bmiHistories.length - 1 ? 'tw-border-b-0' : ''
                  }`}
                >
                  <div className='tw-grid tw-grid-cols-4 tw-gap-2 sm:tw-gap-4 md:tw-gap-8 tw-min-w-[270px]'>
                    <div className='tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[100px] sm:tw-min-w-[140px] tw-truncate'>
                      {formatUSDateShort(timestamp) || '--'}
                    </div>
                    <div className='tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[60px] sm:tw-min-w-[80px] tw-pl-4 sm:tw-pl-0'>
                      {formattedBmi}
                    </div>
                    <div className='tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[80px] sm:tw-min-w-[100px]'>
                      {formattedWeight}
                    </div>
                    <div className='tw-text-gray-900 tw-text-xs sm:tw-text-sm tw-min-w-[80px] sm:tw-min-w-[100px]'>
                      {formattedHeight}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !isLoading ? (
        <p className='py-3 text-center text-muted small m-0'>No BMI history available.</p>
      ) : null}
    </Modal>
  );
}
