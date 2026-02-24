'use client';

import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/helper';
import { Error } from '@/lib/types';
import { useDeleteSurveyMutation } from '@/store/slices/surveysApiSlice';
import { Survey } from '@/store/slices/surveySlice';
import { isAxiosError } from 'axios';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FiEdit2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { PiLinkSimpleLight } from 'react-icons/pi';

interface Props {
  survey: Survey;
  onUpdateSurveyName?: (surveyId: string, newName: string) => void;
  onDeleteSuccess?: (surveyId: string) => void;
}

export function ActionsCell({ survey, onUpdateSurveyName, onDeleteSuccess }: Readonly<Props>) {
  const dispatch = useDispatch();

  const [deleteSurvey, { isLoading }] = useDeleteSurveyMutation();

  const isDisabled = survey.isSystemGenerated || survey.isActive;

  let tooltipMessage = '';
  if (survey.isSystemGenerated) {
    tooltipMessage = 'This is a system-generated form and cannot be deleted.';
  } else if (survey.isActive) {
    tooltipMessage = 'This form is active and cannot be deleted.';
  }

  const handleDelete = async () => {
    try {
      const { success, message } = await deleteSurvey(survey.id || '').unwrap();
      if (success) {
        onDeleteSuccess?.(survey.id || '');
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data.message);
      } else {
        toast.error((err as Error).data.message || 'Error occurred while deleting survey');
      }
    }
  };

  const handleCopy = async () => {
    if (survey.surveyPublicUrl) {
      await copyToClipboard(survey.surveyPublicUrl);
      toast.success('Survey Public URL Copied Successfully!');
    } else {
      toast.error('Public URL for this Survey does not exist!');
    }
  };

  const handleEditName = () => {
    dispatch(
      setModal({
        modalType: 'Edit Survey Name',
        ctx: { id: survey.id, name: survey.name, onUpdate: onUpdateSurveyName },
      })
    );
  };

  return (
    <div className={'d-flex align-items-center gap-2'}>
      <button onClick={handleEditName} className='btn icon-btn primary' title='Edit Survey Name'>
        <FiEdit2 />
      </button>

      {isDisabled ? (
        <OverlayTrigger overlay={<Tooltip id={`delete-${survey.id}`}>{tooltipMessage}</Tooltip>}>
          <div>
            <button className='btn icon-btn danger' disabled>
              {isLoading ? <Spinner size='sm' /> : <RiDeleteBin6Line />}
            </button>
          </div>
        </OverlayTrigger>
      ) : (
        <button className='btn icon-btn danger' onClick={handleDelete} disabled={isLoading}>
          {isLoading ? <Spinner size='sm' /> : <RiDeleteBin6Line />}
        </button>
      )}

      {survey.surveyPublicUrl &&
        (survey.type?.type === 'GENERAL' || survey.type?.type === 'INTAKE') &&
        survey.isActive && (
          <button onClick={handleCopy} className='btn icon-btn primary'>
            <PiLinkSimpleLight />
          </button>
        )}
    </div>
  );
}
