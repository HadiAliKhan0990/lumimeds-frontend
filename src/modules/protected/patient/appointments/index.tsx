'use client';

import React, { useState } from 'react';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { QueryPageTitleWrapper } from '@/components/ProvidersModule/components/QueryPageTitleWrapper';
import { ProvidersPageContainer } from '@/components/ProvidersModule/components/ProvidersPageContainer';
import { Card, Spinner } from 'react-bootstrap';
import {
  QueuePageFiltersTitle,
  QueuePageTitleAndFiltersWrapper,
} from '@/components/ProvidersModule/components/QueuePageTitleAndFiltersContainer';
import { VisitsIcon } from '@/components/Icon/VisitsIcon';
import { QuepageContentContainer } from '@/components/ProvidersModule/components/QuepageContentContainer';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EncounterSortField } from '@/store/slices/ordersApiSlice';
import { removePlusMinusSigns } from '@/lib/helper';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { RenderWRTRecentDate } from '@/components/Dates/RenderWRTRecentDate';
import { formatProviderName } from '@/lib/utils/providerName';
import { PatientAppointment } from '../../../../types/patientAppointments';
import {
  useDelinePatientAppointMentMutation,
  useLazyGetPatientAppointmentsQuery,
  useReschedulePatientAppointMentMutation,
} from '@/store/slices/patientsApiSlice';
import ConfirmationModal from '@/components/ConfirmationModal';
import { DateTimeField } from '@/components/Dates/DateTimeField';
import toast from 'react-hot-toast';
import { StatusLabel } from '@/types/appointment';

export const PatientAppointMentPage = () => {
  interface EncountersState {
    data: PatientAppointment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
    filters: {
      search: string;
      date?: string;
      status?: { label: string; value: keyof StatusLabel };
      sortBy?: { label: string; value: string };
      sortOrder?: string;
    };
    localState: {
      appointmentId: string;
      reason: string;
      newScheduledAt: string;
      newEndsAt: string;
      openedModal: string;
    };
  }

  const initialState: EncountersState = {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      total: 0,
    },
    filters: {
      search: '',
    },
    localState: {
      appointmentId: '',
      reason: '',
      newScheduledAt: '',
      newEndsAt: '',
      openedModal: '',
    },
  };

  const [state, setState] = useState<EncountersState>(initialState);

  const [getAppointments, { isFetching: isPendingEncountersLoading }] = useLazyGetPatientAppointmentsQuery();

  const [delinePatientAppointMent, { isLoading: isPendingDelineLoading }] = useDelinePatientAppointMentMutation();

  const [reschedulePatientAppointMent, { isLoading: isPendingRescheduleLoading }] =
    useReschedulePatientAppointMentMutation();

  const { appointmentId, reason, newScheduledAt, newEndsAt, openedModal } = state.localState;

  const handleUpdateEncounters = async ({
    search = state.filters.search,
    date = state.filters.date,
    status = state.filters.status,
    sortBy = state.filters.sortBy,
    sortOrder = state.filters.sortOrder,
    page = state.pagination.currentPage,
    append = false,
    shouldScrollToTop = true,
  }: {
    search?: string;
    date?: string;
    status?: { label: string; value: keyof StatusLabel };
    sortBy?: { label: string; value: string };
    sortOrder?: string;
    page?: number;
    append?: boolean;
    shouldScrollToTop?: boolean;
  }) => {
    try {
      const sortByValue = removePlusMinusSigns(sortBy?.value ?? '') as EncounterSortField;

      // Build end-of-day ISO string for the provided date (UTC end of that day)
      let endOfDayIso: string | undefined = undefined;

      if (date) {
        const end = new Date().setHours(23, 59, 59, 999);

        endOfDayIso = new Date(end).toISOString();
      }

      const result = await getAppointments({
        ...(search && { search }),
        ...(date && {
          startDate: date,
          endDate: endOfDayIso,
        }),
        ...(status?.value && { status: status.value }),
        ...(sortByValue && { sortField: sortByValue as EncounterSortField }),
        ...(sortOrder && { sortOrder }),
        ...(sortByValue && sortOrder && { sortField: sortByValue, sortOrder }),
        page,
        limit: 10,
      }).unwrap();

      const { appointments, meta } = result;

      setState((prev) => ({
        ...prev,
        data: append ? [...prev.data, ...appointments] : (appointments as PatientAppointment[]),
        pagination: {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          total: meta.total,
        },
      }));

      if (!append && shouldScrollToTop) {
        await scrollToTop();
      }
    } catch (error) {
      console.error('Failed to fetch encounters:', error);
    }
  };

  const scrollToTop = async () => {
    const topRef = document.getElementById('encounters-table-top');
    if (topRef) {
      topRef.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  };

  // Initial load
  React.useEffect(() => {
    handleUpdateEncounters({ shouldScrollToTop: false });
  }, []);

  const handleRowClick = (row: PatientAppointment) => {
    console.log(row);
  };

  const declineAppointment = () => {
    if (!reason) {
      toast.error('Please enter a reason');
      return;
    }

    delinePatientAppointMent({
      appointmentId,
      reason,
    })
      .unwrap()
      .then(() => {
        resetStateAndRefetch();
      });
  };

  const rescheduleAppointment = () => {
    if (!newScheduledAt || !newEndsAt) {
      toast.error('Please select a start and end date');
      return;
    }

    if (new Date(newScheduledAt) > new Date(newEndsAt)) {
      toast.error('Scheduled start date must be before the end date');
      return;
    }

    reschedulePatientAppointMent({
      appointmentId,
      newScheduledAt,
      newEndsAt,
      reason,
    })
      .unwrap()
      .then(() => {
        resetStateAndRefetch();
      });
  };

  const columns: Column<PatientAppointment>[] = [
    {
      header: 'PROVIDER DETAILS',
      renderCell: (row) => {
        return (
          <div className='d-flex   align-items-center gap-4 mx-auto'>
            <div className='d-flex flex-column'>
              <span className='text-small text-start'>
                {formatProviderName(row.provider.firstName, row.provider.lastName)}
              </span>
            </div>
          </div>
        );
      },
      className: 'text-start',
    },
    // {
    //   header: 'Email',
    //   renderCell: (row) => {
    //     return <div className='text-small d-flex justify-content-start'>{row.provider.email ?? 'N/A'}</div>;
    //   },
    //   className: 'text-start',
    // },
    // {
    //   header: 'Phone No.',
    //   renderCell: (row) => {
    //     return <div>{formatUSPhone(row?.provider?.phoneNumber ?? 'N/A')}</div>;
    //   },
    //   className: 'text-start',
    // },
    {
      header: 'Scheduled',
      renderCell: (row) => {
        let finalDate = <span>N/A</span>;

        if (row.scheduledAt) {
          finalDate = (
            <div className='d-flex flex-wrap gap-2 text-muted'>
              <span>{formatUSDateTime(row.scheduledAt)}</span>
              <RenderWRTRecentDate className='bg-medium-light-gray px-1 rounded-1' date={row.scheduledAt} />
            </div>
          );
        }

        return <div className='d-flex flex-wrap gap-2 align-items-center'>{finalDate}</div>;
      },
      className: 'text-start',
    },
    {
      header: 'Created At',
      renderCell: (row) => {
        let finalDate = <span>N/A</span>;

        if (row?.createdAt) {
          finalDate = (
            <div className='d-flex flex-wrap gap-2 text-muted'>
              <span>{formatUSDateTime(row.createdAt)}</span>
              <RenderWRTRecentDate className='bg-medium-light-gray px-1 rounded-1' date={row.createdAt} />
            </div>
          );
        }

        return <div className='d-flex flex-wrap gap-2 justify-content-start  align-items-center'>{finalDate}</div>;
      },
      className: 'text-start',
    },
    // {
    //   header: 'State',
    //   renderCell: (row) => {
    //     const stateName = row?.shipping_state;

    //     if (!stateName)
    //       return (
    //         <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
    //           —
    //         </span>
    //       );

    //     const stateCode = statesAbbreviations?.[stateName as keyof typeof statesAbbreviations] ?? '';

    //     const fullStateName = `${stateName} ${stateCode ? `, ${stateCode}` : ''}`;

    //     return (
    //       <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
    //         {fullStateName}
    //       </span>
    //     );
    //   },
    //   className: 'text-start',
    // },

    {
      header: 'Status',
      renderCell: (row) => {
        return (
          <div className={`text-small status-badge ${row?.status?.toLowerCase()}`}>
            {row?.status?.split('_')?.join(' ')}
          </div>
        );
      },
      className: 'text-start',
    },
    {
      header: 'Actions',
      renderCell: (row) => {
        if (row.status === 'completed') {
          return <span className='text-muted text-center v'>-</span>;
        }

        const showReschedule = !!row.rescheduleUrl;

        const showDecline = !!row.cancelUrl;

        const showVisit = !!row.scheduledEventUri;

        return showReschedule || showDecline || showVisit ? (
          <div className='d-flex gap-2 flex-wrap'>
            {showVisit && (
              <button
                className='btn btn-sm  btn-outline-primary'
                onClick={(event) => {
                  event.stopPropagation();

                  window.open(row.scheduledEventUri ?? '', '_blank');
                }}
              >
                Join
              </button>
            )}
            {showReschedule && (
              <button
                className='btn btn-sm  btn-outline-primary'
                onClick={(event) => {
                  event.stopPropagation();

                  window.open(row.rescheduleUrl ?? '', '_blank');
                }}
              >
                {isPendingRescheduleLoading ? <Spinner size='sm' /> : 'Reschedule'}
              </button>
            )}

            {showDecline && (
              <button
                type='button'
                className='btn btn-sm btn-outline-danger'
                onClick={(event) => {
                  event.stopPropagation();

                  window.open(row.cancelUrl ?? '', '_blank');
                }}
              >
                {isPendingDelineLoading ? <Spinner size='sm' /> : 'Decline'}
              </button>
            )}
          </div>
        ) : (
          <span>-</span>
        );
      },
      className: 'text-start',
    },
  ];

  const fetchMore = () => {
    if (state.pagination.currentPage < state.pagination.totalPages && !isPendingEncountersLoading) {
      handleUpdateEncounters({
        page: state.pagination.currentPage + 1,
        append: true,
      });
    }
  };

  // const handleSearch = (searchTerm: string) => {
  //   setState((prev) => ({
  //     ...prev,
  //     pagination: {
  //       ...prev.pagination,
  //       currentPage: 1,
  //       totalPages: 0,
  //       total: 0,
  //     },
  //     filters: {
  //       ...prev.filters,
  //       search: searchTerm,
  //     },
  //     data: [],
  //   }));

  //   handleUpdateEncounters({
  //     search: searchTerm,
  //     page: 1,
  //   });
  // };

  // const handleDateChange = (newDate: string) => {
  //   setState((prev) => ({
  //     ...prev,
  //     pagination: {
  //       ...prev.pagination,
  //       currentPage: 1,
  //       totalPages: 0,
  //       total: 0,
  //     },
  //     filters: {
  //       ...prev.filters,
  //       date: newDate,
  //     },
  //     data: [],
  //   }));
  //   handleUpdateEncounters({ date: newDate, page: 1 });
  // };

  // const handleStatusChange = (newStatus: { label: string; value: keyof StatusLabel }) => {
  //   setState((prev) => ({
  //     ...prev,
  //     filters: {
  //       ...prev.filters,
  //       status: newStatus,
  //     },
  //   }));
  //   handleUpdateEncounters({ status: newStatus, page: 1 });
  // };

  // const handleSortChange = (newSortBy?: { label: string; value: string }, newSortOrder?: string) => {
  //   setState((prev) => ({
  //     ...prev,
  //     pagination: {
  //       ...prev.pagination,
  //       currentPage: 1,
  //       totalPages: 0,
  //       total: 0,
  //     },
  //     filters: {
  //       ...prev.filters,
  //       sortBy: newSortBy,
  //       sortOrder: newSortOrder,
  //     },
  //     data: [],
  //   }));
  //   handleUpdateEncounters({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
  // };

  const resetStateAndRefetch = () => {
    setState(initialState);

    // Refetch encounters with reset state
    handleUpdateEncounters({
      page: 1,
      append: false,
      date: '',
      status: { label: '', value: '' as keyof StatusLabel },
      sortBy: { label: '', value: '' as string },
      sortOrder: '',
      search: '',
    });
  };

  return (
    <ProvidersPageContainer id='encounters-table-top'>
      <ConfirmationModal
        show={!!openedModal}
        onHide={() => setState((prev) => ({ ...prev, localState: initialState.localState }))}
        onConfirm={openedModal === 'reschedule' ? rescheduleAppointment : declineAppointment}
        loading={isPendingRescheduleLoading || isPendingDelineLoading}
        title={openedModal === 'reschedule' ? 'Reschedule Appointment' : 'Decline Appointment'}
        message={
          <div className='d-flex flex-column gap-4'>
            {openedModal === 'reschedule' && (
              <RescheduleModal
                onNewScheduledAtChange={(newScheduledAt) =>
                  setState((prev) => ({ ...prev, localState: { ...prev.localState, newScheduledAt } }))
                }
                onNewEndsAtChange={(newEndsAt) =>
                  setState((prev) => ({ ...prev, localState: { ...prev.localState, newEndsAt } }))
                }
                newScheduledAt={newScheduledAt}
                newEndsAt={newEndsAt}
              />
            )}
            <textarea
              className='form-control'
              placeholder={openedModal === 'reschedule' ? 'Reason for Reschedule' : 'Reason for Decline'}
              value={reason}
              onChange={(e) =>
                setState((prev) => ({ ...prev, localState: { ...prev.localState, reason: e.target.value } }))
              }
            />
          </div>
        }
      />
      <QueryPageTitleWrapper>
        <MobileHeader title='Appointments' showMenuButton={false} />
      </QueryPageTitleWrapper>
      <Card body className='rounded-12  border-light'>
        <QuepageContentContainer>
          <QueuePageTitleAndFiltersWrapper>
            <QueuePageFiltersTitle
              pageTitle={
                <span>
                  Upcoming Appointments{' '}
                  <span className='text-muted fw-normal fs-6'>({state.pagination.total} Today)</span>{' '}
                </span>
              }
              icon={<VisitsIcon className='text-muted' size={24} />}
            ></QueuePageFiltersTitle>
            {/* <QueuePageFiltersWrapper>
              <QueuePageSearchFilter onSearch={handleSearch} />
              <QueuePageDateFilter onDateChange={handleDateChange} value={state.filters.date ?? ''} />
              <QueuePageStatusFilter
                onStatusChange={handleStatusChange}
                value={
                  state.filters.status?.value
                    ? { label: state.filters.status.label, value: state.filters.status.value }
                    : { label: 'Status', value: '' as keyof StatusLabel }
                }
              />
              <QueuePageSortFilter
                onSortChange={handleSortChange}
                value={
                  {
                    label: state.filters.sortOrder
                      ? state.filters.sortOrder === 'DESC'
                        ? 'New'
                        : 'Oldest'
                      : 'Sort By',
                    value: state.filters.sortBy?.value ?? '',
                  } as { label: string; value: string }
                }
                sortOptions={sortOptions}
              />
            </QueuePageFiltersWrapper> */}
          </QueuePageTitleAndFiltersWrapper>
          <div className='d-lg-none'>
            <InfiniteScroll
              dataLength={state.data.length}
              next={fetchMore}
              hasMore={state.pagination.currentPage < state.pagination.totalPages}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={`calc(100vh - 350px)`}
            >
              <MobileCard
                rowOnClick={handleRowClick}
                loading={isPendingEncountersLoading && state.data.length === 0}
                data={state.data}
                columns={columns}
              />
            </InfiniteScroll>
          </div>

          <div className='d-none d-lg-block'>
            <InfiniteScroll
              dataLength={state.data.length}
              next={fetchMore}
              hasMore={state.pagination.currentPage < state.pagination.totalPages}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={'calc(100vh - 272px)'}
            >
              <Table
                rowOnClick={handleRowClick}
                data={state.data}
                columns={columns}
                isFetching={isPendingEncountersLoading && state.data.length === 0}
              />
            </InfiniteScroll>
          </div>
        </QuepageContentContainer>
      </Card>
    </ProvidersPageContainer>
  );
};

interface RescheduleModalProps extends React.ComponentPropsWithoutRef<'div'> {
  onNewScheduledAtChange: (newScheduledAt: string) => void;
  onNewEndsAtChange: (newEndsAt: string) => void;
  newScheduledAt: string;
  newEndsAt: string;
}

const RescheduleModal = ({
  onNewScheduledAtChange,
  onNewEndsAtChange,
  newScheduledAt,
  newEndsAt,
}: RescheduleModalProps) => {
  return (
    <div className='d-flex flex-column gap-4'>
      <DateTimeField
        placeholderText='Select Reschedule start date & time'
        maxDate={new Date()}
        value={newScheduledAt}
        onChangeDate={(date) => onNewScheduledAtChange(date as string)}
        className='flex-grow-1'
      />

      <DateTimeField
        placeholderText='Select Reschedule end date & time'
        maxDate={new Date()}
        value={newEndsAt}
        onChangeDate={(date) => onNewEndsAtChange(date as string)}
        className='flex-grow-1'
      />
    </div>
  );
};
