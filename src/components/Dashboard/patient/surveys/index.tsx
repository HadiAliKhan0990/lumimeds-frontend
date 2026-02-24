'use client';

import PendingSurveys from '@/components/Dashboard/patient/surveys/includes/PendingSurveys';
import SubmittedSurveys from '@/components/Dashboard/patient/surveys/includes/SubmittedSurveys';
import { useLazyGetCompletedSurveysQuery, useLazyGetPendingSurveysQuery } from '@/store/slices/surveysApiSlice';
import { Tabs, TabPanel } from '@/components/elements';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { MdOutlineWarningAmber } from 'react-icons/md';
import { useLazyGetPatientProfileQuery } from '@/store/slices/userApiSlice';
import { useRouter } from 'next/navigation';
import { SurveysTabType } from '@/types/patientSurveys';
import { setGlobalPendingSurveysTotal } from '@/store/slices/patientSurveysSlice';
import { PatientSurveyState } from '@/types/survey';

export const Surveys = () => {
  const { refresh } = useRouter();
  const dispatch = useDispatch();

  const [activeKey, setActiveKey] = useState<SurveysTabType>('pending');
  const [surveys, setSurveys] = useState<PatientSurveyState>({
    pending: { data: [], meta: { page: 1 } },
    completed: { data: [], meta: { page: 1 } },
  });

  const [triggerGetPendingSurveys] = useLazyGetPendingSurveysQuery();
  const [triggerGetCompletedSurveys] = useLazyGetCompletedSurveysQuery();
  const [triggerGetPatientProfile] = useLazyGetPatientProfileQuery();

  const patientProfile = useSelector((state: RootState) => state.patientProfile);

  const isPendingSubmission = patientProfile?.user?.status === 'pending_submission';

  // Function to fetch all surveys
  const fetchAllSurveys = async () => {
    try {
      const [pendingSurveys, completedSurveys] = await Promise.all([
        triggerGetPendingSurveys({ page: 1 }).unwrap(),
        triggerGetCompletedSurveys({ page: 1 }).unwrap(),
      ]);

      if (pendingSurveys.surveys && pendingSurveys.meta) {
        setSurveys((prev) => ({
          ...prev,
          pending: {
            data: pendingSurveys.surveys || [],
            meta: pendingSurveys.meta || { page: 1 },
          },
        }));
        dispatch(setGlobalPendingSurveysTotal(pendingSurveys?.meta?.total || 0));
      }

      if (completedSurveys.responses && completedSurveys.meta) {
        setSurveys((prev) => ({
          ...prev,
          completed: {
            data: completedSurveys.responses || [],
            meta: completedSurveys.meta || { page: 1 },
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      await fetchAllSurveys();

      if (isPendingSubmission) {
        refresh();
        await triggerGetPatientProfile();
      }
    }
  };

  const tabs = useMemo(
    () => [
      {
        label: (
          <span className='tw-flex tw-items-center tw-justify-center tw-gap-3 tw-font-semibold'>
            Pending
            <span className='tw-bg-red-500 tw-text-white tw-rounded-full tw-px-2 tw-py-0.5 tw-text-xs tw-font-bold tw-min-w-[20px] tw-text-center'>
              {surveys.pending.meta?.total || 0}
            </span>
          </span>
        ),
        value: 'pending',
      },
      {
        label: (
          <span className='tw-flex tw-items-center tw-justify-center tw-gap-3 tw-font-semibold'>
            Submitted
            <span className='tw-bg-red-500 tw-text-white tw-rounded-full tw-px-2 tw-py-0.5 tw-text-xs tw-font-bold tw-min-w-[20px] tw-text-center'>
              {surveys.completed.meta?.total || 0}
            </span>
          </span>
        ),
        value: 'submitted',
      },
    ],
    [surveys.pending.meta?.total, surveys.completed.meta?.total]
  );

  // Initial fetch on component mount
  useEffect(() => {
    fetchAllSurveys();
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeKey, isPendingSubmission]); // Added dependencies

  return (
    <>
      <h1 className='display-6 mb-5'>Intake Forms</h1>

      {/* Disclaimer */}
      {isPendingSubmission ? (
        <div className='alert alert-danger text-start mb-5 d-flex gap-3' role='alert'>
          <MdOutlineWarningAmber className='flex-shrink-0' size={24} />
          <div>
            <strong className='d-block mb-1'>Important Notice:</strong>
            <span>
              Your order is pending until we receive your completed intake form. Please submit it at your earliest
              convenience to avoid any delays in processing. You can find the form in the Pending Forms section below.
            </span>
          </div>
        </div>
      ) : null}

      <Tabs
        tabs={tabs}
        activeTab={activeKey}
        onTabChange={(value) => setActiveKey(value as SurveysTabType)}
        className='tw-mb-6'
      />
      <TabPanel value={activeKey} index='pending'>
        <PendingSurveys surveys={surveys} setSurveys={setSurveys} />
      </TabPanel>
      <TabPanel value={activeKey} index='submitted'>
        <SubmittedSurveys surveys={surveys} setSurveys={setSurveys} />
      </TabPanel>
    </>
  );
};
