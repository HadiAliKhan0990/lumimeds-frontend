'use client';

import toast from 'react-hot-toast';
import { Error } from '@/lib/types';
import { useUpdateSurveyStatusMutation } from '@/store/slices/surveysApiSlice';
import { Survey } from '@/store/slices/surveySlice';
import { Form, Spinner } from 'react-bootstrap';
import { isAxiosError } from 'axios';

interface Props {
  survey: Survey;
  onSuccess: () => void;
}

export const ActiveSwitchCell = ({ survey, onSuccess }: Props) => {
  const [updateSurveyStatus, { isLoading }] = useUpdateSurveyStatusMutation();

  async function handleUpdateStatus() {
    try {
      const { success, message } = await updateSurveyStatus({
        id: survey.id || '',
        isActive: !survey.isActive,
      }).unwrap();
      if (success) {
        toast.success(message);
        onSuccess();
      } else {
        toast.error(message);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error((error as Error).data.message || 'Error occurred while deleting survey');
      }
    }
  }

  return isLoading ? (
    <Spinner size='sm' />
  ) : (
    <Form.Check
      type='switch'
      disabled={survey.isSystemGenerated}
      checked={survey.isActive ?? false}
      onChange={handleUpdateStatus}
    />
  );
};
