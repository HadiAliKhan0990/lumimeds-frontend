import { CheckboxInput, CheckboxLabel, CheckboxText } from '@/components/Checkbox/Checkbox';
import ReactSelect from 'react-select';
import React, { useState } from 'react';
import { commonStylesQuePageFilters } from './QueuePageFilters';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

export interface QuePageBulkActionPalleteProps extends React.ComponentPropsWithoutRef<'div'> {
  onAssign: ({ notes, callBack }: { notes: string; callBack: () => void }) => void;
  onSelectAll: () => void;
  isAllChecked: boolean;
  isAssigningToAdmin: boolean;
  shoudAlloConfirmModal: boolean;
}

type BulkActionOption = {
  label: string;
  value: string;
  requiresNotes?: boolean;
  placeholder?: string;
};

const bulkActionOptions: BulkActionOption[] = [
  { label: 'Intake form missing', value: 'intake-form-missing' },
  { label: 'Telepath Notes Missing', value: 'telepath-notes-missing' },
  { label: 'Wrong DOB', value: 'wrong-dob' },
  {
    label: 'Update the intake form',
    value: 'update-intake-form',
    requiresNotes: true,
    placeholder: 'Describe what needs to be updated in the intake form',
  },
  { label: 'Missing Previous Prescription', value: 'missing-previous-prescription' },
  {
    label: 'Patient Risk',
    value: 'patient-risk',
    requiresNotes: true,
    placeholder: 'Describe the risk or additional clinical context',
  },
  { label: 'Does not meet BMI', value: 'does-not-meet-bmi' },
];

export const QuePageBulkActionPallete = ({
  onAssign,
  onSelectAll,
  isAllChecked,
  isAssigningToAdmin,
  shoudAlloConfirmModal,
  ...props
}: QuePageBulkActionPalleteProps) => {
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkActionOption | null>(null);

  const [show, setShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (!selectedBulkAction) {
      toast.error('Kindly select a revert reason to proceed');
      return;
    }

    if (!shoudAlloConfirmModal) {
      toast.error('Kindly select at least one order to revert');
      return;
    }

    if (selectedBulkAction.requiresNotes) {
      setShow(true);
      return;
    }

    try {
      setIsProcessing(true);
      onAssign({
        notes: selectedBulkAction.label,
        callBack: () => {
          onHide();
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.log(error);
      toast.error('Failed to revert to admin');
      setIsProcessing(false);
    }
  };

  const onHide = () => {
    setSelectedBulkAction(null);
    setShow(false);
    setNotes('');
  };

  const onConfirm = () => {
    if (!selectedBulkAction) {
      toast.error('Kindly select a revert reason to proceed');
      return;
    }

    const trimmedNotes = notes.trim();

    if (selectedBulkAction.requiresNotes && trimmedNotes === '') {
      toast.error('Please add notes for this revert reason');
      return;
    }

    try {
      setIsProcessing(true);
      onAssign({
        notes: selectedBulkAction.requiresNotes ? trimmedNotes : selectedBulkAction.label,
        callBack: () => {
          onHide();
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.log(error);
      toast.error('Failed to revert to admin');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        show={show}
        onHide={onHide}
        onConfirm={onConfirm}
        loading={isAssigningToAdmin || isProcessing}
        title='Revert to Admin'
        message={
          <div className='form-group'>
            <label htmlFor='notes' className='form-label text-start w-100'>
              {selectedBulkAction?.label || 'Notes'}
            </label>
            <textarea
              id='notes'
              className='form-control text-start'
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={selectedBulkAction?.placeholder || 'Enter notes here...'}
            />
          </div>
        }
        confirmLabel='Yes, Revert'
        cancelLabel='Cancel'
      />
      <div {...props} className='w-100 tw-grid tw-grid-cols-12 tw-gap-2 tw-items-center'>
        <div className='tw-col-span-12 sm:tw-col-span-6 lg:tw-col-span-5 xl:tw-col-span-4 tw-flex tw-gap-4'>
          <CheckboxLabel htmlFor='select-all' className='!tw-justify-start tw-flex-shrink-0 tw-w-fit'>
            <CheckboxInput id='select-all' onChange={onSelectAll} checked={isAllChecked} />
            <CheckboxText>Select All</CheckboxText>
          </CheckboxLabel>
          <div className='tw-flex-grow'>
            <ReactSelect
              className={`tw-w-full`}
              styles={commonStylesQuePageFilters}
              options={bulkActionOptions ?? []}
              value={selectedBulkAction}
              placeholder='Select Bulk Action'
              onChange={(option) => {
                setSelectedBulkAction(option as BulkActionOption);
                setNotes('');
              }}
              classNames={{
                control: () => `tw-w-full tw-truncate`,
                placeholder: () => `tw-truncate`,
                menuList: () => `ls-scroll-container tw-max-h-60`,
              }}
            />
          </div>
        </div>

        <button
          className={`btn btn-primary tw-col-span-12 sm:tw-col-span-2 text-nowrap tw-w-full sm:tw-w-fit`}
          onClick={handleAssign}
          disabled={isAssigningToAdmin || isProcessing}
        >
          Apply
        </button>
      </div>
    </>
  );
};
