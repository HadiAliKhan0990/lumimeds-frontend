'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import ProductIntakeResponsePopup from '@/components/Dashboard/admin/forms/popup/SingleFormResponse';
import Link from 'next/link';
import { Column, Table } from '@/components/Dashboard/Table';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Spinner } from 'react-bootstrap';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import {
  FormSubmissionsType,
  useLazyGetSurveysSubmissionQuery,
  useLazyGetSurveyResponseQuery,
  SurveySubmission,
} from '@/store/slices/surveysApiSlice';
import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { setSurvey } from '@/store/slices/surveySlice';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { formatRelativeTime } from '@/lib/helper';

interface Props {
  type: FormSubmissionsType;
}

export default function ProductIntake({ type }: Readonly<Props>) {
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [allSurveys, setAllSurveys] = useState<SurveySubmission[]>([]);
  const [open, setOpen] = useState(false);

  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const response = useSelector((state: RootState) => state.surveyResponse);
  const survey = useSelector((state: RootState) => state.survey);

  const [triggerSurveys, { data, isFetching }] = useLazyGetSurveysSubmissionQuery();
  const [getSurveyResponse] = useLazyGetSurveyResponseQuery();

  const surveys = data?.submissions || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const memoizedSurveys = useMemo(() => surveys, [JSON.stringify(surveys)]);

  useEffect(() => {
    if (currentPage === 1) {
      setAllSurveys(memoizedSurveys);
    } else if (memoizedSurveys.length > 0) {
      setAllSurveys((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = memoizedSurveys.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [memoizedSurveys, currentPage]);

  const loadIntakes = async ({ meta, search, sortOrder }: MetaPayload) => {
    try {
      await triggerSurveys({
        page: meta?.page,
        limit: 30,
        type,
        search: search || '',
        sortOrder: sortOrder || 'DESC',
      });
      setCurrentPage(meta?.page || 1);
    } catch (err) {
      console.error('Error loading intakes:', err);
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      const nextPage = currentPage + 1;
      loadIntakes({ meta: { page: nextPage, limit: 30 }, search: search, sortOrder: sortOrder || 'DESC' });
    }
  };

  const handleShowResponses = async (response: SurveySubmission) => {
    try {
      await getSurveyResponse(response.id);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching survey response:', error);
    }
  };

  const handleCloseResponse = () => {
    setOpen(false);
  };

  const columns: Column<SurveySubmission>[] = [
    {
      header: 'NAME',
      renderCell: (o) =>
        o.submittedByType?.toLowerCase() === 'patient' ||
        o.submittedByType?.toLowerCase() === 'provider' ||
        o.submittedByType?.toLowerCase() === 'general' ? (
          <Link
            href={{
              pathname: '/admin/users',
              query: { q: o.submittedByName, r: o.submittedByType?.toLowerCase() },
            }}
            className='text-nowrap'
          >
            {o.submittedByName ?? 'N/A'}
          </Link>
        ) : (
          o.submittedByName
        ),
    },
    {
      header: 'RESPONDENT',
      renderCell: (item) => item.submittedByType,
    },
    {
      header: 'DATE OF RESPONSE',
      renderCell: (item) => (
        <div className='d-flex align-items-center gap-2'>
          <span>{formatUSDateTime(item.createdAt || '')}</span>
          <span className='badge bg-light text-muted rounded-pill'>{formatRelativeTime(item.createdAt || '')}</span>
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      renderCell: (item) => (
        <button
          type='button'
          className='text-xs text-nowrap btn btn-link p-0'
          onClick={() => {
            dispatch(setSurvey(item));
            handleShowResponses(item);
          }}
        >
          View Response
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (type === 'PRODUCT_INTAKE') {
      loadIntakes({ meta: { page: 1, limit: 30 }, search: search || '', sortOrder: sortOrder || 'DESC' });
    }
  }, [search, sortOrder]);

  const allIntakesLoaded = currentPage >= totalPages;

  return (
    <>
      <ProductIntakeResponsePopup
        show={open}
        surveyName={survey.surveyName ?? ''}
        response={response}
        onHide={handleCloseResponse}
      />

      <div className='row align-items-center mb-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4'>Product Intake</span>
        <div className='col-lg-8 text-end'>
          <FilterGroup handleChange={loadIntakes} />
        </div>
      </div>

      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={allSurveys.length}
          next={fetchMore}
          hasMore={!allIntakesLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 270px)'}
        >
          <MobileCard loading={isFetching && allSurveys.length === 0} data={allSurveys} columns={columns} />
        </InfiniteScroll>
      </div>

      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={allSurveys.length}
          next={fetchMore}
          hasMore={!allIntakesLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 272px)'}
        >
          <Table data={allSurveys} columns={columns} isFetching={isFetching && allSurveys.length === 0} />
        </InfiniteScroll>
      </div>
    </>
  );
}
