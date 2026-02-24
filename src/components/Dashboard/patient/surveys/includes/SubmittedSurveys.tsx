'use client';

import SurveyResponsesModal from '@/components/Dashboard/patient/surveys/includes/SurveyResponsesModal';
import { Column, Table } from '@/components/Dashboard/Table';
import { useState } from 'react';
import { CompletedSurvey, MetaPayload } from '@/lib/types';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { useLazyGetCompletedSurveysQuery } from '@/store/slices/surveysApiSlice';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { PatientSurveyState } from '@/types/survey';
import { useRouter } from 'next/navigation';

interface Props {
  surveys: PatientSurveyState;
  setSurveys: React.Dispatch<React.SetStateAction<PatientSurveyState>>;
}

export default function SubmittedSurveys({ surveys, setSurveys }: Readonly<Props>) {
  const [selectedSurvey, setSelectedSurvey] = useState<CompletedSurvey>();
  const { data, meta } = surveys.completed;
  const router = useRouter();

  const [triggerGetCompletedSurveys, { isFetching }] = useLazyGetCompletedSurveysQuery();

  const { totalPages = 1 } = meta || {};

  async function handleCompletedFormsOrders({ meta }: MetaPayload) {
    try {
      const result = await triggerGetCompletedSurveys(meta || {}).unwrap();
      if (result) {
        setSurveys((prev) => ({
          ...prev,
          completed: {
            data: result.responses || [],
            meta: result.meta || { page: 1 },
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const columns: Column<CompletedSurvey>[] = [
    {
      header: 'ACTIONS',
      renderCell: (o) => (
        <button
          onClick={() => setSelectedSurvey(o)}
          className='tw-bg-primary tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-whitespace-nowrap tw-font-medium tw-transition-all hover:tw-bg-primary/90'
          type='button'
        >
          View Response
        </button>
      ),
    },
    {
      header: 'FORM NAME',
      accessor: 'name',
    },
    {
      header: 'SUBMITTED DATE',
      renderCell: (s) => formatUSDateTime(s.updatedAt),
    },
    {
      header: 'FORM TYPE',
      renderCell: (o) => o.surveyType.name,
    },
    {
      header: 'ORDER ID',
      className: 'text-nowrap',
      renderCell: (s) => {
        const displayOrderId = s.submissionMetadata?.uniqueOrderId || s.submissionMetadata?.orderId;
        const orderIdForNavigation = s.submissionMetadata?.orderId;
        
        if (!orderIdForNavigation) {
          return <span className='text-muted'>-</span>;
        }
        
        return (
          <button
            onClick={() => router.push(`/patient/orders/${orderIdForNavigation}?returnTo=forms`)}
            className='btn btn-link p-0 text-primary text-decoration-underline border-0 bg-transparent'
            style={{ cursor: 'pointer' }}
          >
            {displayOrderId}
          </button>
        );
      },
    },
  ];

  return (
    <>
      <div className='table-responsive'>
        <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} />
      </div>
      {totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={handleCompletedFormsOrders} />}

      <SurveyResponsesModal survey={selectedSurvey} onClose={() => setSelectedSurvey(undefined)} />
    </>
  );
}
