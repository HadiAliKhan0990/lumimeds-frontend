'use client';

import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Column, Table } from '@/components/Dashboard/Table';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { Provider } from '@/store/slices/providerSlice';
import { RootState } from '@/store';
import { ROUTES } from '@/constants';
import { setPopup } from '@/store/slices/popupSlice';
import { setSearch, setMeta } from '@/store/slices/sortSlice';
import { setModal } from '@/store/slices/modalSlice';
import { TableCheckbox } from '@/components/Dashboard/TableCheckbox';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { getAge } from '@/lib';
import { FilterGroup, FilterGroup as ProviderFilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { formatProviderName } from '@/lib/utils/providerName';
import { Suspense, useEffect, useRef, useState } from 'react';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { useGetPatientsQuery } from '@/store/slices/patientsApiSlice';
import { useLazyGetArchivedProvidersQuery } from '@/store/slices/providersApiSlice';
import { IoArrowBack } from 'react-icons/io5';
import { Card, Spinner, Tab, Tabs } from 'react-bootstrap';
import { MdRestore } from 'react-icons/md';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';

const staticData: Patient[] = [
  {
    createdAt: '2025-06-04T07:03:43.975Z',
    dob: '2000-12-31',
    email: 'misbahnazir1356+50@gmail.com',
    firstName: 'Gopi',
    gender: 'male',
    id: 'fb8744a7-a36d-4805-8112-b5d6364d7205',
    lastName: 'Behan',
    orders: [
      {
        createdAt: '2025-06-04T07:03:43.982Z',
        id: '12d505ff-058b-41b6-aeee-4d34bb8f12ad',
        requestedPharmacy: '',
        requestedProductName: 'Semaglutide',
        status: 'Pending',
        nextRefillDate: '',
        remainingDosage: '',
        totalDosage: '',
      },
    ],
    state: 'United States',
    status: 'active',
  },
];

interface Meta {
  page: number;
  limit: number;
  totalPages?: number;
}

// Providers Content Component
const ProvidersContent = () => {
  const { windowWidth } = useWindowWidth();
  const dispatch = useDispatch();

  const timerSingleProviderToRestore = useRef<NodeJS.Timeout | undefined>(undefined);
  // State for infinite scrolling
  const [providersData, setProvidersData] = useState<{
    data: Provider[];
    meta: Meta;
  }>({
    data: [],
    meta: { page: 1, limit: 30, totalPages: 1 },
  });

  // Fetch providers data inside the component
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const status = useSelector((state: RootState) => state.sort.sortStatus);

  const [triggerProviders, { isFetching }] = useLazyGetArchivedProvidersQuery();

  const { data = [], meta } = providersData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  // Function to append new data to existing data
  const appendProvidersDataLocally = (currentData: typeof providersData, newData: { data: Provider[]; meta: Meta }) => {
    if (currentData?.data) {
      const existingIds = new Set(currentData.data.map((provider) => provider.id));
      const uniqueNewProviders = (newData?.data || []).filter((provider: Provider) => !existingIds.has(provider.id));

      return {
        data: [...currentData.data, ...uniqueNewProviders],
        meta: newData?.meta || currentData.meta,
      };
    } else {
      return {
        data: newData?.data || [],
        meta: newData?.meta,
      };
    }
  };

  // Function to update providers data
  const handleUpdateProviders = async ({
    meta,
    search,
    sortField,
    sortOrder,
    append = false,
    status,
  }: {
    meta: Meta;
    search?: string;
    sortField?: string;
    sortOrder?: string;
    append: boolean;
    status?: string | null;
  }) => {
    try {
      const { data: res } = await triggerProviders({
        ...(search && { search }),
        sortField,
        sortOrder,
        meta: {
          page: meta?.page || 1,
          limit: 30,
        },
        ...(status && { status }),
      });
      const { providers: newProviders } = res?.data || {};
      if (append) {
        setProvidersData((prev) =>
          appendProvidersDataLocally(prev, {
            data: newProviders || [],
            meta: res?.data?.meta || { page: 1, limit: 30, totalPages: 1 },
          })
        );
      } else {
        setProvidersData({ data: newProviders || [], meta: res?.data?.meta || { page: 1, limit: 30, totalPages: 1 } });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch more data for infinite scroll
  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateProviders({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortOrder,
        status,
        append: true,
      });
    }
  };

  // Listen for providers restored event to refetch data
  useEffect(() => {
    const handleProvidersRestored = (event?: CustomEvent) => {
      console.log('event', event);
      // Refetch the archived providers data
      handleUpdateProviders({
        search: search || '',
        sortOrder,
        status,
        append: false,
        meta: { page: 1, limit: 30 },
      });
    };

    handleProvidersRestored();

    window.addEventListener('providersRestored', handleProvidersRestored as EventListener);

    return () => {
      window.removeEventListener('providersRestored', handleProvidersRestored as EventListener);
    };
  }, [search, sortOrder, status]);

  const allProvidersLoaded = currentPage >= totalPages;

  const selectedProviders = useSelector((state: RootState) => state.selectedRows);

  const handleRestoreSelectedProviders = () => {
    dispatch(setModal({ modalType: 'Restore User' }));

    if (selectedProviders.length === 1) {
      const handler = () => {
        const foundProvider = data?.find((provider) => provider.id === selectedProviders[0]);

        const event = new CustomEvent('singleProviderToRestore', {
          detail: {
            provider: foundProvider,
          },
        });

        window.dispatchEvent(event);
      };

      if (timerSingleProviderToRestore.current) clearTimeout(timerSingleProviderToRestore.current);

      timerSingleProviderToRestore.current = setTimeout(handler, 100);
    }
  };

  const columns: Column<Provider>[] = [
    {
      header: windowWidth > 768 ? <TableCheckbox data={data} isHeader /> : <span className='d-none' />,
      renderCell: (o) => <TableCheckbox item={o} />,
    },
    {
      header: 'NAME',
      renderCell: (o) => (o?.provider ? formatProviderName(o?.provider?.firstName, o?.provider?.lastName) : 'N/A'),
      className: 'text-nowrap text-capitalize',
    },
    { header: 'email', renderCell: (o) => <span className='provider-email'>{o.email}</span>, className: 'text-nowrap' },
    {
      header: 'PHONE NO.',
      renderCell: (o) => formatUSPhoneWithoutPlusOne(o?.provider?.phoneNumber ?? '') || 'N/A',
      className: 'text-nowrap',
    },
    {
      header: 'STATUS',
      renderCell: (o) => (
        <span className={'status-badge ' + o.status?.toLowerCase()}>
          {o?.status?.includes('_') ? o?.status.replace('_', ' ') : o?.status}
        </span>
      ),
      className: 'text-nowrap text-capitalize',
    },
  ];
  return (
    <>
      <div className='row align-items-center mb-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4 col-xl-6'>Archived Providers</span>
        <div className={`col-lg-8 col-xl-6 text-end`}>
          <ProviderFilterGroup handleChange={() => null} />
        </div>
      </div>

      {selectedProviders.length > 0 && (
        <div className='d-flex align-items-center archived-card justify-content-md-between gap-3 flex-wrap mb-4'>
          <span className='text-sm d-none d-md-inline text-black'>Manage Providers</span>
          <div className={'d-flex align-items-center users-count-wrapper gap-3'}>
            <span className='text-sm users-count text-primary'>{selectedProviders.length} Selected</span>
            <button
              onClick={handleRestoreSelectedProviders}
              className='btn btn-primary d-flex align-items-center gap-2 justify-content-center'
            >
              <MdRestore />
              Restore
            </button>
            <TableCheckbox data={data} isHeader className='d-md-none' />
          </div>
        </div>
      )}

      <div className='d-lg-none user-mobile-cards'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allProvidersLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 280px)`}
        >
          <UsersMobileCards loading={isFetching && data.length === 0} data={data || []} columns={columns} />
        </InfiniteScroll>
      </div>

      <div className='table-responsive mt-5 d-none d-lg-block'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allProvidersLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 300px)'}
        >
          <div id='providers-table-top' />
          <Table data={data || []} columns={columns} isFetching={isFetching && data.length === 0} />
        </InfiniteScroll>
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Content = () => {
  const { push } = useRouter();
  const { windowWidth } = useWindowWidth();

  const selectedPatients = useSelector((state: RootState) => state.selectedRows);

  const data = staticData;

  const { search, sortStatus, meta, sortOrder, sortField } = useSelector((state: RootState) => state.sort);

  const { data: patientsData, isFetching } = useGetPatientsQuery({
    search,
    sortField,
    sortOrder,
    meta: { page: meta?.page ?? 1, limit: 30 },
    status: sortStatus,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (patientsData?.data.meta && !isFetching) {
      dispatch(setMeta(patientsData.data.meta));
    }
  }, [isFetching, data]);

  const handleRedirectToOrders = (u: Patient) => {
    const value = u?.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : undefined;
    dispatch(setSearch(value));
    push(`${ROUTES.ADMIN_ORDERS}?q=${value}`);
  };

  function handleRowClick(row: Patient) {
    dispatch(setPopup(true));
    dispatch(setPatient(row));
  }

  const columns: Column<Patient>[] = [
    {
      header: windowWidth > 768 ? <TableCheckbox data={data} isHeader /> : <span className='d-none' />,
      renderCell: (o: Patient) => <TableCheckbox item={o} />,
    },
    {
      header: 'PATIENT',
      renderCell: (o) => `${o?.firstName} ${o?.lastName}`,
      className: 'text-nowrap text-capitalize',
    },
    {
      header: 'AGE',
      renderCell: (o) => getAge(o?.dob),
    },
    { header: 'GENDER', accessor: 'gender', className: 'text-nowrap text-capitalize' },
    { header: 'STATE', accessor: 'state', className: 'text-nowrap text-capitalize' },
    {
      header: 'ORDERS',
      renderCell: (o) => (
        <span
          onClick={(event) => {
            event.stopPropagation();
            handleRedirectToOrders(o);
          }}
          className='text-xs text-primary text-decoration-underline fw-bold cursor-pointer'
        >
          Order History
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      renderCell: (o) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            dispatch(setPatient(o));
            // dispatch(setModal({ modalType: 'Restore User' }));
          }}
          className='btn btn-restore d-flex align-items-center gap-2 justify-content-center mx-auto'
        >
          Restore
        </button>
      ),
    },
  ];

  return (
    <>
      <div className='row align-items-center mb-4'>
        <span className='text-lg fw-medium d-none d-lg-block col-lg-4'>Archived Patients</span>
        <div className={`col-lg-8 text-end`}>
          <FilterGroup handleChange={() => null} />
        </div>
      </div>

      {selectedPatients.length > 0 && (
        <div className='d-flex align-items-center archived-card justify-content-md-between gap-3 flex-wrap mb-4'>
          <span className='text-sm d-none d-md-inline text-black'>Manage Archived Patients</span>
          <div className={'d-flex align-items-center users-count-wrapper gap-3'}>
            <span className='text-sm users-count text-primary'>{selectedPatients.length} Selected</span>
            <button
              // onClick={() => {
              //   dispatch(setModal({ modalType: 'Restore User' }));
              // }}
              className='btn btn-restore d-flex align-items-center gap-2 justify-content-center'
            >
              {/* <ArchiveArrowUp className='flex-shrink-0' size={18} /> */}
              Restore Selected
            </button>
            <TableCheckbox data={data} isHeader className='d-md-none' />
          </div>
        </div>
      )}

      <div className='d-lg-none user-mobile-cards'>
        <UsersMobileCards loading={isFetching} data={data || []} columns={columns} rowOnClick={handleRowClick} />
      </div>

      <div className='table-responsive mt-5 d-none d-lg-block'>
        <Table data={data || []} columns={columns} isFetching={isFetching} rowOnClick={handleRowClick} />
      </div>
    </>
  );
};

const PageContent = () => {
  const [activeTab, setActiveTab] = useState<'patients' | 'providers'>('providers');

  const searchParams = useSearchParams();

  const router = useRouter();

  // Handle query parameter for tab selection
  useEffect(() => {
    const tabType = searchParams.get('r');
    // if (tabType === 'patient' || tabType === 'patients') {
    //   setActiveTab('patients');
    // } else
    if (tabType === 'provider' || tabType === 'providers') {
      setActiveTab('providers');
    }
  }, [searchParams]);

  // Get the current tab type from query params for the back link
  const getCurrentTabType = () => {
    // if (activeTab === 'patients') {
    //   return 'patient';
    // } else
    if (activeTab === 'providers') {
      return 'provider';
    }
    return 'provider'; // default fallback
  };

  const tabChangeHandler = (k: 'patients' | 'providers') => {
    setActiveTab(k);

    router.replace(`/admin/users/archived?r=${k === 'patients' ? 'patient' : 'provider'}`);
  };
  return (
    <div className='d-flex flex-column gap-4'>
      <Link href={`${ROUTES.ADMIN_USERS}?r=${getCurrentTabType()}`} className='tw-flex tw-items-center tw-gap-2'>
        <IoArrowBack /> Back
      </Link>
      <Card body className='rounded-12 border-light zero-styles-mobile'>
        <Tabs
          className='underlined_tabs border-0 flex-row gap-0 mb-4'
          activeKey={activeTab}
          onSelect={(k) => tabChangeHandler(k as 'patients' | 'providers')}
        >
          {/* <Tab tabClassName='text-capitalize' eventKey='patients' title='Patients'>
            {activeTab === 'patients' && <Content />}
          </Tab> */}
          <Tab eventKey='providers' title='Providers'>
            {activeTab === 'providers' && <ProvidersContent />}
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
};

export default function ArchivedUsers() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
