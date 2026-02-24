'use client';

import { useState, useEffect } from 'react';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ReactDatePicker } from '@/components/elements';

interface OnHoldModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (reminderDate: string, reason?: string) => void;
  loading?: boolean;
}

export const OnHoldModal = ({ show, onHide, onConfirm, loading = false }: OnHoldModalProps) => {
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setReminderDate(null);
      setReason('');
      setError('');
    }
  }, [show]);

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!reminderDate) {
      setError('Reminder date is required');
      return;
    }

    const trimmedReason = reason.trim();
    const formattedDate = formatDateToYYYYMMDD(reminderDate);
    
    onConfirm(formattedDate, trimmedReason || undefined);
  };

  const handleHide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setError('');
    onHide();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ConfirmationModal
        show={show}
        onHide={handleHide}
        onConfirm={handleConfirm}
        loading={loading}
        title='Put Order On Hold'
        confirmLabel='Save Changes'
        cancelLabel='Cancel'
        dialogClassName='modal-dialog-centered'
        backdrop='static'
        message={
          <div className='w-100' onClick={(e) => e.stopPropagation()}>
            <div className='form-group mb-3'>
              <label htmlFor='reminder-date' className='form-label text-start w-100 fw-semibold'>
                Reminder Date <span className='text-danger'>*</span>
              </label>
              <ReactDatePicker
                id='reminder-date'
                selected={reminderDate}
                onChange={(date) => {
                  setReminderDate(date);
                  setError('');
                }}
                onKeyDown={() => {}}
                minDate={new Date()}
                dateFormat='MM/dd/yyyy'
                placeholderText='Select or type date (MM/DD/YYYY)'
                className={error ? 'is-invalid' : ''}
                required
              />
              {error && <div className='invalid-feedback text-start d-block'>{error}</div>}
            </div>

            <div className='form-group'>
              <label htmlFor='hold-reason' className='form-label text-start w-100 fw-semibold'>
                Reason <span className='text-muted fw-normal'>(Optional)</span>
              </label>
              <textarea
                id='hold-reason'
                className='form-control text-start'
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Enter reason for putting order on hold...'
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

