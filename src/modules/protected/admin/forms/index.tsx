'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa6';
import { useLazyGetSurveysQuery, useLazyGetSurveyTypesQuery } from '@/store/slices/surveysApiSlice';
import { useRouter } from 'next/navigation';
import { Card, Dropdown, Spinner } from 'react-bootstrap';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Column, Table } from '@/components/Dashboard/Table';
import { setSurvey, Survey } from '@/store/slices/surveySlice';
import { ROUTES } from '@/constants';
import { setPopup } from '@/store/slices/popupSlice';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { AddNewSurveyModal } from '@/modules/protected/admin/forms/includes/AddNewSurveyModal';
import { ActiveSwitchCell } from '@/components/Dashboard/admin/forms/ActiveSwitchCell';
import { ActionsCell } from '@/components/Dashboard/admin/forms/ActionsCell';
import { SortState } from '@/store/slices/sortSlice';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { scrollToTop } from '@/lib/helper';
import { ManageSurveyTypes } from '@/modules/protected/admin/forms/includes/ManageSurveyTypesModal';
import { RemoveSurveyTypeModal } from '@/modules/protected/admin/forms/includes/RemoveSurveyTypeModal';
import { SurveyType } from '@/store/slices/surveyTypeSlice';

type SurveyFormType = {
  data: Survey[];
  meta: SortState['meta'];
};

export default function Forms() {
  const dispatch = useDispatch();
  const { push } = useRouter();

  const [surveysData, setSurveysData] = useState<SurveyFormType>({
    data: [],
    meta: { page: 1, limit: 30, total: 0, totalPages: 0 },
  });
  const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);
  const [isManageSurveyTypesOpen, setIsManageSurveyTypesOpen] = useState(false);
  const [isRemoveSurveyTypeOpen, setIsRemoveSurveyTypeOpen] = useState(false);
  const [selectedSurveyType, setSelectedSurveyType] = useState<SurveyType | null>(null);

  const surveyTypes = useSelector((state: RootState) => state.surveyTypes);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const { data, meta } = surveysData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerSurveys, { isFetching }] = useLazyGetSurveysQuery();
  const [triggerSurveyTypes] = useLazyGetSurveyTypesQuery();

  const appendSurveysDataLocally = (currentData: SurveyFormType, newSurveyData: SurveyFormType): SurveyFormType => {
    if (currentData?.data) {
      const existingIds = new Set(currentData.data.map((survey) => survey.id));
      const uniqueNewSurveys = (newSurveyData?.data || []).filter((survey) => !existingIds.has(survey.id));
      return {
        data: [...currentData.data, ...uniqueNewSurveys],
        meta: {
          ...currentData.meta,
          page: newSurveyData?.meta?.page || 1,
          limit: 30,
          total: newSurveyData?.meta?.total,
          totalPages: newSurveyData?.meta?.totalPages,
        },
      };
    } else {
      return {
        data: newSurveyData?.data || [],
        meta: newSurveyData?.meta || { page: 1, limit: 30 },
      };
    }
  };

  async function handleUpdateSurveys({ meta, search, sortStatus, sortOrder, append = false }: MetaPayload) {
    try {
      const { data: res } = await triggerSurveys({
        page: meta?.page,
        limit: 30,
        ...(search && { search }),
        sortOrder,
        sortBy: sortStatus,
      });
      const { surveyData: newSurveyData } = res || {};

      if (append) {
        setSurveysData((prevData) =>
          appendSurveysDataLocally(prevData, {
            data: newSurveyData || [],
            meta: {
              page: res?.page || 1,
              limit: 30,
              total: res?.total || undefined,
              totalPages: res?.totalPages || undefined,
            },
          })
        );
      } else {
        await scrollToTop('forms-table-top');
        setSurveysData({
          data: newSurveyData || [],
          meta: {
            page: res?.page || 1,
            limit: 30,
            total: res?.total || undefined,
            totalPages: res?.totalPages || undefined,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateSurveys({
        meta: { page: currentPage + 1 },
        append: true,
        sortOrder,
        search,
        sortStatus,
      });
    }
  };

  const handleAddClick = () => setIsAddSurveyModalOpen(true);
  const handleManageTypesOpen = () => setIsManageSurveyTypesOpen(true);
  const handleManageTypesClose = () => setIsManageSurveyTypesOpen(false);

  const handleRemoveSurveyTypeClose = () => {
    setIsRemoveSurveyTypeOpen(false);
    setSelectedSurveyType(null);
  };

  const handleRemoveSurveyType = (type: SurveyType) => {
    setSelectedSurveyType(type);
    setIsRemoveSurveyTypeOpen(true);
  };

  const handleUpdateSurveyName = (surveyId: string, newName: string) => {
    setSurveysData((prevData) => ({
      ...prevData,
      data: prevData.data.map((survey) => (survey.id === surveyId ? { ...survey, name: newName } : survey)),
    }));
  };

  const handleRemoveSurvey = (surveyId: string) => {
    setSurveysData((prevData) => {
      const filteredData = prevData.data.filter((survey) => survey.id !== surveyId);

      if (!prevData.meta) {
        return prevData;
      }

      const updatedMeta = { ...prevData.meta };
      const limit = updatedMeta.limit ?? 30;
      updatedMeta.limit = limit;

      if (typeof updatedMeta?.total === 'number') {
        const newTotal = Math.max(updatedMeta.total - 1, 0);
        updatedMeta.total = newTotal;

        const recalculatedTotalPages = Math.ceil(newTotal / limit);
        updatedMeta.totalPages = recalculatedTotalPages;
        if (typeof updatedMeta.page === 'number') {
          updatedMeta.page = Math.min(updatedMeta.page, Math.max(recalculatedTotalPages, 1));
        }
      }

      if (typeof updatedMeta.total !== 'number' && typeof updatedMeta.totalPages === 'number') {
        const recalculatedTotalPages = Math.ceil(filteredData.length / limit);
        updatedMeta.totalPages = recalculatedTotalPages;
        if (typeof updatedMeta.page === 'number') {
          updatedMeta.page = Math.min(updatedMeta.page, Math.max(recalculatedTotalPages, 1));
        }
      }

      const finalMeta: SurveyFormType['meta'] = {
        ...updatedMeta,
        page: updatedMeta.page ?? 1,
        limit,
      };

      return {
        data: filteredData,
        meta: finalMeta,
      };
    });
  };

  const columns: Column<Survey>[] = [
    {
      header: 'ACTIVE',
      renderCell: (o) => <ActiveSwitchCell survey={o} onSuccess={() => handleUpdateSurveys({ meta: { page: 1 } })} />,
    },
    { header: 'TYPE', renderCell: (o) => o.type?.type, className: 'text-nowrap' },
    {
      header: 'FORM NAME',
      renderCell: (o) => (
        <button
          type='button'
          className='btn btn-link p-0 text-sm text-start'
          onClick={() => {
            dispatch(setSurvey(o));
            localStorage.setItem('lumimeds_savedSurvey', JSON.stringify(o));
            push(ROUTES.ADMIN_FORM_BUILDER);
          }}
        >
          {o.name}
        </button>
      ),
    },
    {
      header: 'FORM TYPE',
      className: 'text-nowrap',
      renderCell: (o) => (o.isSystemGenerated ? 'System Generated' : 'Manual Generated'),
    },
    {
      header: 'DATE CREATED',
      renderCell: (o) => formatUSDateTime(o.createdAt),
    },
    {
      header: 'CREATED BY',
      className: 'text-nowrap text-capitalize',
      renderCell: (o) =>
        o.createdBy?.firstName || o.createdBy?.lastName ? `${o.createdBy?.firstName} ${o.createdBy?.lastName}` : '-',
    },
    {
      header: 'TOTAL RESPONSES',
      renderCell: (o) => (
        <button
          className='btn-no-style text-primary fw-bold text-decoration-underline'
          onClick={() => {
            dispatch(setPopup(true));
            dispatch(setSurvey(o));
          }}
        >
          {o.totalResponses}
        </button>
      ),
    },
    {
      header: 'ACTIONS',
      renderCell: (o) => (
        <ActionsCell survey={o} onUpdateSurveyName={handleUpdateSurveyName} onDeleteSuccess={handleRemoveSurvey} />
      ),
    },
  ];

  useEffect(() => {
    handleUpdateSurveys({ meta: { page: 1 } });
  }, []);

  useEffect(() => {
    if (surveyTypes.length === 0) {
      triggerSurveyTypes();
    }
  }, []);

  const allSurveysLoaded = currentPage >= totalPages;
  return (
    <>
      <div className='d-lg-none'>
        <MobileHeader
          title='Forms'
          actions={
            <>
              <Dropdown.Item as='button' onClick={handleManageTypesOpen}>
                Manage Types
              </Dropdown.Item>
              <Dropdown.Item as='button' className='d-flex align-items-center gap-2' onClick={handleAddClick}>
                <FaPlus />
                Create New
              </Dropdown.Item>
            </>
          }
          className='mb-4'
        />
        <FilterGroup handleChange={handleUpdateSurveys} />
        <div className='small-text-cards'>
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={!allSurveysLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner className='border-2' />
              </div>
            }
            height={'calc(100vh - 230px)'}
          >
            <MobileCard loading={isFetching && data.length === 0} data={data || []} columns={columns} />
          </InfiniteScroll>
        </div>
      </div>
      <div className='d-lg-flex d-none align-items-center justify-content-between gap-2 mb-4'>
        <h1 className='m-0 text-2xl fw-semibold'>Forms</h1>
        <div className='d-flex align-items-center gap-3'>
          <button type={'button'} className='btn btn-primary' onClick={handleManageTypesOpen}>
            Manage Types
          </button>
          <button
            type={'button'}
            className='btn btn-primary d-flex align-items-center gap-2 justify-content-center'
            onClick={handleAddClick}
          >
            <FaPlus />
            <span>Create New</span>
          </button>
        </div>
      </div>

      <Card body className='rounded-12 d-none d-lg-block border-light'>
        <div className='mb-3'>
          <FilterGroup handleChange={handleUpdateSurveys} />
        </div>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allSurveysLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={'calc(100vh - 206px)'}
        >
          <div id='forms-table-top' />
          <Table data={data || []} columns={columns} isFetching={isFetching && data.length === 0} />
        </InfiniteScroll>
      </Card>

      {/* Modals */}

      <AddNewSurveyModal isOpen={isAddSurveyModalOpen} onClose={() => setIsAddSurveyModalOpen(false)} />
      <ManageSurveyTypes
        isOpen={isManageSurveyTypesOpen}
        onClose={handleManageTypesClose}
        onRemoveSurveyType={handleRemoveSurveyType}
      />
      <RemoveSurveyTypeModal
        selectedSurveyType={selectedSurveyType}
        isOpen={isRemoveSurveyTypeOpen}
        onClose={handleRemoveSurveyTypeClose}
      />
    </>
  );
}
