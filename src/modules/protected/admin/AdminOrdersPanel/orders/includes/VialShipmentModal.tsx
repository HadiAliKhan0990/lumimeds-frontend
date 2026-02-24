'use client';

import toast from 'react-hot-toast';
import { formatUSDate } from '@/helpers/dateFormatter';
import { useRecordVialShipmentMutation } from '@/store/slices/ordersApiSlice';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Modal, ReactDatePicker } from '@/components/elements';
import { CircularProgress } from '@/components/elements/CircularProgress';

interface VialShipmentModalProps {
  show: boolean;
  onHide: () => void;
  orderId: string;
  currentShippedVials?: number;
  planCount?: number;
  onSuccess?: (newShippedVials: number) => void;
  productName?: string;
  planDuration?: string;
  latestShipmentReminderDate?: string;
}

export const VialShipmentModal = ({
  show,
  onHide,
  orderId,
  currentShippedVials = 0,
  planCount = 0,
  onSuccess,
  productName,
  planDuration,
  latestShipmentReminderDate,
}: VialShipmentModalProps) => {
  const [totalShippedVials, setTotalShippedVials] = useState<number>(currentShippedVials);
  const [nextReminderDate, setNextReminderDate] = useState<Date | null>(null);
  const [isFinalShipment, setIsFinalShipment] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [recordVialShipment, { isLoading }] = useRecordVialShipmentMutation();

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setTotalShippedVials(currentShippedVials);
      setNextReminderDate(null);
      setIsFinalShipment(false);
      setErrors({});
    }
  }, [show, currentShippedVials]);

  // Disable date picker when final shipment is checked
  useEffect(() => {
    if (isFinalShipment) {
      setNextReminderDate(null);
    }
  }, [isFinalShipment]);

  const handleSubmit = async () => {
    // Validation
    const newErrors: { [key: string]: string } = {};

    // Validate total shipped vials: must be >= 0 and <= planCount
    if (totalShippedVials < 0) {
      newErrors.totalShippedVials = 'Number of vials cannot be negative';
    }

    if (planCount > 0 && totalShippedVials > planCount) {
      newErrors.totalShippedVials = `Total vials cannot exceed plan count (${planCount})`;
    }

    if (!isFinalShipment && !nextReminderDate) {
      newErrors.nextReminderDate = 'Please select a reminder date or mark as final shipment';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log('Recording vial shipment with data:', {
        orderId,
        totalShippedVials,
        nextReminderDate: nextReminderDate ? format(nextReminderDate, 'yyyy-MM-dd') : undefined,
        isFinalShipment,
      });

      const result = await recordVialShipment({
        orderId,
        vialsShipped: totalShippedVials, // Send total value (not increment)
        nextReminderDate: nextReminderDate ? format(nextReminderDate, 'yyyy-MM-dd') : undefined,
        isFinalShipment,
        // isIncrement is not set (defaults to false), so backend treats it as total
      }).unwrap();

      console.log('Vial shipment recorded successfully:', result);

      toast.success('Vial shipment recorded successfully');
      onSuccess?.(totalShippedVials);
      onHide();
    } catch (error: unknown) {
      console.error('Error recording vial shipment:', error);
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message || 'Failed to record vial shipment';
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onHide}
      title='Record Vial Shipment'
      size='md'
      bodyClassName='!tw-overflow-y-visible'
      footer={
        <div className='tw-grid tw-grid-cols-2 tw-gap-3 tw-w-full'>
          <button
            type='button'
            disabled={isLoading}
            className='tw-w-full tw-px-4 tw-py-2 tw-border tw-border-primary tw-rounded-lg tw-bg-white tw-text-primary tw-font-medium hover:tw-bg-primary/10 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none'
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={isLoading}
            className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-font-medium hover:tw-bg-primary/90 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-flex tw-items-center tw-justify-center tw-gap-2'
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
          >
            {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4 !tw-text-white' />}
            Record Shipment
          </button>
        </div>
      }
      showFooter
    >
      <div>
        {productName && (
          <span
            className='tw-inline-block tw-mb-4 tw-px-3 tw-py-2 tw-bg-[#3F434B] tw-text-white tw-font-medium tw-rounded'
            style={{ whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'left' }}
          >
            {productName} {planDuration}
          </span>
        )}

        <form>
          <div className='tw-mb-4'>
            <label htmlFor='totalShippedVials' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Total Vials Shipped
            </label>
            <input
              id='totalShippedVials'
              type='number'
              min='0'
              max={planCount > 0 ? planCount : undefined}
              value={totalShippedVials}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setTotalShippedVials(0);
                  setErrors({ ...errors, totalShippedVials: '' });
                  return;
                }
                const value = Number.parseInt(raw, 10);
                if (!Number.isNaN(value)) {
                  setTotalShippedVials(value);
                  setErrors({ ...errors, totalShippedVials: '' });
                }
              }}
              className={`tw-w-full tw-px-3 tw-py-1.5 tw-border tw-rounded-md focus:tw-border-primary ${
                errors.totalShippedVials ? 'tw-border-red-500' : 'tw-border-gray-300'
              }`}
            />
            {errors.totalShippedVials && (
              <div className='tw-text-red-500 tw-text-sm tw-mt-1'>{errors.totalShippedVials}</div>
            )}
            {planCount > 0 && (
              <div className='tw-text-gray-500 tw-text-sm tw-mt-1'>
                Plan count: {planCount} vials (0 to {planCount} allowed)
              </div>
            )}
          </div>

          <div className='tw-mb-4'>
            <label htmlFor='isFinalShipment' className='tw-flex tw-items-center tw-gap-2 tw-cursor-pointer'>
              <input
                id='isFinalShipment'
                type='checkbox'
                checked={isFinalShipment}
                onChange={(e) => setIsFinalShipment(e.target.checked)}
                className='tw-w-4 tw-h-4 tw-accent-primary tw-rounded'
              />
              <span className='tw-text-sm tw-font-medium tw-text-gray-700'>Mark as Final Shipment</span>
            </label>
          </div>

          {!isFinalShipment && (
            <div className='tw-mb-4'>
              <label
                id='nextReminderDate-label'
                htmlFor='nextReminderDate'
                className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'
              >
                Next Reminder Date
              </label>
              <div className='tw-relative'>
                <ReactDatePicker
                  id='nextReminderDate'
                  selected={nextReminderDate}
                  onChange={(date: Date | null) => {
                    setNextReminderDate(date);
                    setErrors({ ...errors, nextReminderDate: '' });
                  }}
                  minDate={new Date()}
                  dateFormat='MM/dd/yyyy'
                  placeholderText='Select date'
                  isClearable
                />
              </div>
              {errors.nextReminderDate && (
                <div className='tw-text-red-500 tw-text-sm tw-mt-1'>{errors.nextReminderDate}</div>
              )}
            </div>
          )}

          {latestShipmentReminderDate && (
            <div className='tw-mb-4'>
              <span className='tw-text-sm tw-text-gray-700'>Next Shipment Date: </span>
              <span className='tw-text-sm tw-font-medium tw-text-gray-900'>
                {formatUSDate(latestShipmentReminderDate)}
              </span>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
