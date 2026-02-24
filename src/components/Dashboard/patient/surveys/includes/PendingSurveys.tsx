'use client';

import toast from 'react-hot-toast';
import { Column, Table } from '@/components/Dashboard/Table';
import { PendingSurvey, useLazyGetPendingSurveysQuery } from '@/store/slices/surveysApiSlice';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { Error, MetaPayload } from '@/lib/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { isAxiosError } from 'axios';
import { PatientSurveyState } from '@/types/survey';
import { useRouter } from 'next/navigation';

interface PendingSurveysProps {
  surveys: PatientSurveyState;
  setSurveys: React.Dispatch<React.SetStateAction<PatientSurveyState>>;
}

export default function PendingSurveys({ surveys, setSurveys }: Readonly<PendingSurveysProps>) {
  const [triggerGetPendingSurveys, { isFetching }] = useLazyGetPendingSurveysQuery();
  const router = useRouter();

  const profile = useSelector((state: RootState) => state.patientProfile);
  const { data, meta } = surveys.pending;
  const { totalPages = 1 } = meta || {};

  async function handlePendingFormsOrders({ meta }: MetaPayload) {
    try {
      const result = await triggerGetPendingSurveys({ page: meta?.page || 1, limit: 10 }).unwrap();
      if (result.surveys && result.meta) {
        setSurveys((prev) => ({
          ...prev,
          pending: {
            data: result.surveys || [],
            meta: result.meta || { page: 1 },
          },
        }));
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error)?.data?.message || 'Failed to fetch pending surveys'
      );
    }
  }

  const columns: Column<PendingSurvey>[] = [
    {
      header: 'ACTIONS',
      renderCell: (s) => {
        let url = s.surveyUrl;

        // Only attach email for PRODUCT or INTAKE types, and only if we have an email
        const shouldAttachEmail = (s.type.type === 'PRODUCT' || s.type.type === 'INTAKE') && profile.email;

        if (shouldAttachEmail) {
          // Split URL into base and query parts
          const [base, query] = url.split('?');
          const params = new URLSearchParams(query || '');

          // Only add email if it doesn't already exist in the URL
          if (!params.has('email')) {
            params.set('email', profile.email || '');

            // Reconstruct the URL
            const newQuery = params.toString();
            url = newQuery ? `${base}?${newQuery}` : base;
          }
        }

        return (
          <a
            href={s.surveyUrl ? url : '#'}
            target='_blank'
            rel='noopener noreferrer'
            className={`tw-bg-primary tw-no-underline tw-text-white tw-px-3 tw-py-1.5 tw-rounded-md tw-text-sm tw-whitespace-nowrap tw-font-medium tw-transition-all hover:tw-bg-primary/80${s.surveyUrl ? '' : ' tw-opacity-50 tw-cursor-not-allowed tw-pointer-events-none'
              }`}
          >
            Complete
          </a>
        );
      },
    },
    {
      header: 'FORM NAME',
      accessor: 'name',
      className: 'text-nowrap',
    },
    {
      header: 'ASSIGNED DATE',
      renderCell: (s) => formatUSDateTime(s.createdAt),
    },
    { header: 'Form Type', renderCell: (o) => o.type.name },
    {
      header: 'ORDER ID',
      className: 'text-nowrap',
      renderCell: (s) => {
        const displayOrderId = s.submissionMetadata?.uniqueOrderId || s.submissionMetadata?.orderId || s.orderId;
        const orderIdForNavigation = s.submissionMetadata?.orderId || s.orderId;
        
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
    {
      header: 'FORM STATUS',
      className: 'tw-whitespace-nowrap',
      renderCell: (s) => (
        <span
          className={`tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-medium ${s.isSubmissionRequired ? 'tw-bg-rose-50 tw-text-rose-600' : 'tw-bg-slate-100 tw-text-slate-500'
            }`}
        >
          {s.isSubmissionRequired ? 'Required' : 'Optional'}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className='table-responsive'>
        <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} />
      </div>
      {totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={handlePendingFormsOrders} />}
    </>
  );
}
