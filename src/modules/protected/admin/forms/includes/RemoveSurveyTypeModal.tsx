'use client';

import toast from 'react-hot-toast';
import { useDeleteSurveyTypeMutation } from '@/store/slices/surveysApiSlice';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { Spinner } from 'react-bootstrap';
import { Modal } from '@/components/elements';
import { SurveyType } from '@/store/slices/surveyTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { removeSurveyTypeByIndex } from '@/store/slices/surveyTypesSlice';
import { AppDispatch, RootState } from '@/store';
import { useMemo } from 'react';

interface RemoveSurveyTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSurveyType: SurveyType | null;
}

export function RemoveSurveyTypeModal({ isOpen, onClose, selectedSurveyType }: Readonly<RemoveSurveyTypeModalProps>) {
  const dispatch = useDispatch<AppDispatch>();

  const surveyTypes = useSelector((state: RootState) => state.surveyTypes);

  const [deleteSurveyTypeMutation, { isLoading }] = useDeleteSurveyTypeMutation();

  const selectedSurveyTypeIndex = useMemo(() => {
    if (!selectedSurveyType?.id) {
      return -1;
    }

    return surveyTypes.findIndex((type) => type.id === selectedSurveyType.id);
  }, [surveyTypes, selectedSurveyType?.id]);

  const handleClose = () => {
    onClose();
  };

  const handleRemove = async () => {
    if (!selectedSurveyType?.id) {
      toast.error('Invalid survey type');
      return;
    }

    try {
      const { success, message } = await deleteSurveyTypeMutation(selectedSurveyType.id).unwrap();
      if (success) {
        dispatch(removeSurveyTypeByIndex(selectedSurveyTypeIndex));
        toast.success(message);
        handleClose();
      } else {
        toast.error(message || 'Failed to remove survey type');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Failed to remove survey type');
      } else {
        toast.error((error as Error).data.message || 'Failed to remove survey type');
      }
    }
  };

  const footer = (
    <>
      <button className='btn-outline-primary flex-grow-1 btn' onClick={handleClose} type={'button'}>
        No
      </button>
      <button
        disabled={isLoading || !selectedSurveyType?.id}
        className='flex-grow-1 btn-primary btn d-flex align-items-center justify-content-center gap-2'
        onClick={handleRemove}
      >
        {isLoading && <Spinner size='sm' className='border-2' />}
        Yes
      </button>
    </>
  );

  return (
    <Modal footer={footer} isOpen={isOpen} title='Remove Type?' size='sm'>
      <div className='tw-text-muted tw-text-sm tw-text-center'>
        Are you sure you want to remove type “{selectedSurveyType?.name}”?
      </div>
    </Modal>
  );
}
