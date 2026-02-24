'use client';

import { Error } from '@/lib/types';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useLazyGetSurveysQuery, useUpdateSurveyNameMutation } from '@/store/slices/surveysApiSlice';
import { setSurveys } from '@/store/slices/surveysSlice';
import { useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

export function EditSurveyName() {
  const dispatch = useDispatch();
  const modal = useSelector((state: RootState) => state.modal);
  const survey = modal.ctx as { id: string; name: string; onUpdate?: (surveyId: string, newName: string) => void };
  
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const search = useSelector((state: RootState) => state.sort.search);
  const meta = useSelector((state: RootState) => state.surveys.meta);
  const surveys = useSelector((state: RootState) => state.surveys.data);

  const { page = 1, limit = 10 } = meta || {};

  const [surveyName, setSurveyName] = useState(survey?.name || '');
  const [updateSurveyName, { isLoading }] = useUpdateSurveyNameMutation();
  const [triggerSurveys] = useLazyGetSurveysQuery();

  const submitRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!surveyName.trim()) {
      toast.error('Survey name cannot be empty');
      return;
    }

    if (surveyName.trim().length < 3) {
      toast.error('Survey name must be at least 3 characters long');
      return;
    }

    try {
      const { error, data } = await updateSurveyName({
        id: survey.id,
        name: surveyName.trim(),
      });

      if (error) {
        toast.error((error as Error)?.data?.message || 'Failed to update survey name');
      } else {
        toast.success(data?.message || 'Survey name updated successfully');
        
        if (surveys) {
          const updatedSurveys = surveys.map((s) =>
            s.id === survey.id ? { ...s, name: surveyName.trim() } : s
          );
          dispatch(setSurveys(updatedSurveys));
        }
        
        if (survey.onUpdate) {
          survey.onUpdate(survey.id, surveyName.trim());
        }
        
        dispatch(setModal({ modalType: undefined }));
        
        triggerSurveys({ page, limit, search, sortBy: sortStatus, sortOrder });
      }
    } catch (err) {
      toast.error('Error occurred while updating survey name');
      console.error(err);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <h5 className='fw-semibold mb-3'>Edit Survey Name</h5>
          <p className='text-sm mb-2' style={{ color: '#7E7E7E' }}>
            Survey Name
          </p>
          <input
            className='form-control shadow-none'
            type='text'
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            placeholder='Enter survey name'
            disabled={isLoading}
            autoFocus
          />
        </div>
        <button style={{ display: 'none' }} type='submit' ref={submitRef} />
      </form>
      <div className='d-flex align-items-center gap-2'>
        <button onClick={handleClose} className='btn btn-outline-primary flex-grow-1' disabled={isLoading}>
          Cancel
        </button>
        <button
          onClick={() => submitRef.current?.click()}
          className='btn btn-primary flex-grow-1'
          disabled={isLoading}
        >
          {isLoading ? <Spinner size='sm' /> : 'Save'}
        </button>
      </div>
    </>
  );
}

