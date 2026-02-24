'use client';

import AppointmentsHeading from './includes/AppointmentsHeading';
import AppointmentsTitle from './includes/AppointmentsTitle';
import AppointmentsFilters from './includes/AppointmentsFilters';
import AdminAppointmentsTable from './includes/AdminAppointmentsTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { fetcher } from '@/lib/fetcher';
import { useDebounce } from '@/hooks/useDebounce';
import { Appointment, Meta, SortFieldKey, StatusLabel } from '@/types/appointment';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { Response } from '@/lib/types';

interface ApiResponse extends Response {
  data: { appointments: Appointment[]; meta: Meta };
}

interface StatsResponse extends Response {
  data: {
    total: number;
    today: number;
    statusCounts: Record<Appointment['status'], number>;
  };
}

const statusLabel: StatusLabel = {
  scheduled: 'Scheduled',
  pending_confirmation: 'Pending',
  completed: 'Completed',
  patient_no_show: 'Patient No-Show',
  doctor_no_show: 'Doctor No-Show',
  canceled: 'Canceled',
  rescheduled: 'Rescheduled',
  reverted: 'Reverted',
  Sent_To_Pharmacy: 'Sent To Pharmacy',
  Drafted: 'Drafted',
};

// Filtered status label for the filter dropdown (only showing 4 options)
const filteredStatusLabel: Partial<StatusLabel> = {
  scheduled: 'Scheduled',
  pending_confirmation: 'Pending',
  rescheduled: 'Rescheduled',
  canceled: 'Canceled',
};

export default function Appointments() {
  const [search, setSearch] = useState('');
  // const [assignTo, setAssignTo] = useState<string | undefined>(undefined);

  // const handleSetAssignTo = (value: string | undefined) => {
  //   setAssignTo(value);
  // };
  const [status, setStatus] = useState<Appointment['status'] | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [sortField] = useState<SortFieldKey>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC' | ''>('');
  // const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [limit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // const [assignLoading, setAssignLoading] = useState(false);
  const [rows, setRows] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const baseQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    if (startDate) {
      params.set('startDate', startDate);
      params.set('endDate', startDate);
    }
    if (sortField) params.set('sortField', sortField);
    if (sortOrder) params.set('sortOrder', sortOrder);
    params.set('limit', String(limit));
    return params.toString();
  }, [debouncedSearch, status, startDate, sortField, sortOrder, limit]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetcher<StatsResponse>('/appointments/stats');
      if (res?.success) setStats(res.data);
    } catch { }
  }, []);

  const loadData = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setRows([]);
      } else {
        setLoadingMore(true);
      }

      try {
        const page = reset ? 1 : currentPage + 1;
        const query = `${baseQuery}&page=${page}`;
        const res = await fetcher<ApiResponse>(`/appointments?${query}`);

        if (!res?.success) throw new Error(res?.message || 'Failed to fetch');

        if (reset) {
          setRows(res.data.appointments);
        } else {
          setRows((prev) => [...prev, ...res.data.appointments]);
        }

        setCurrentPage(page);
        setHasMore(res.data.appointments.length === limit && page < res.data.meta.totalPages);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load appointments';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [baseQuery, currentPage, limit]
  );

  const fetchMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadData(false);
    }
  }, [loadData, loadingMore, hasMore]);

  useEffect(() => {
    loadData(true);
  }, [baseQuery]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const headerCountToday = stats?.today ?? 0;

  // const handleSelectAll = (checked: boolean) => {
  //   setSelectAll(checked);
  //   if (checked) {
  //     const enabledRowIds = new Set(rows.filter((row) => row.status !== 'completed').map((row) => row.id));
  //     setSelectedRows(enabledRowIds);
  //   } else {
  //     setSelectedRows(new Set());
  //   }
  // };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    setSelectedRows(newSelectedRows);

    // const enabledRows = rows.filter((row) => row.status !== 'completed');
    // setSelectAll(newSelectedRows.size === enabledRows.length && enabledRows.length > 0);
  };

  // const handleAssign = async () => {
  //   if (!assignTo || selectedRows.size === 0) return;

  //   setAssignLoading(true);
  //   try {
  //     const appointmentIds = Array.from(selectedRows);
  //     const response = await fetcher<AssignProviderResponse>('/appointments/assign-provider', {
  //       method: 'POST',
  //       data: {
  //         providerId: assignTo,
  //         appointmentIds,
  //       },
  //     });

  //     if (response?.success) {
  //       setSelectedRows(new Set());
  //       setSelectAll(false);
  //       setAssignTo(undefined);
  //       loadData(true);
  //       toast.success('Provider assigned successfully');
  //     } else {
  //       toast.error(response?.message || 'Failed to assign provider');
  //     }
  //   } catch (error: unknown) {
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to assign provider';
  //     toast.error(errorMessage);
  //   } finally {
  //     setAssignLoading(false);
  //   }
  // };

  const handleDecline = async (appointment: Appointment) => {
    try {
      const response = await fetcher<Response>('/appointments/decline', {
        method: 'POST',
        data: {
          appointmentId: appointment.id,
          reason: 'Admin Decline',
        },
      });

      if (response?.success) {
        loadData(true);
        toast.success('Appointment declined successfully');
      } else {
        toast.error(response?.message || 'Failed to decline appointment');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline appointment';
      toast.error(errorMessage);
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    if (appointment.rescheduleUrl) {
      window.open(appointment.rescheduleUrl, '_blank');
    }
  };

  return (
    <div className='container-fluid pb-1 ms-0 me-0 ps-0 pe-0'>
      <MobileHeader title='Appointments & Telehealth' className='mb-3 d-lg-none' />
      <AppointmentsHeading />

      <Card className='shadow-sm rounded-12 border-light mt-2'>
        <Card.Header className='bg-white border-0 pt-2 pb-0'>
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3'>
            <div className='flex-column mt-1 flex-sm-row align-items-sm-center gap-3'>
              <AppointmentsTitle todayCount={headerCountToday} />
              {/* <ProviderSelection
                selectAll={selectAll}
                setSelectAll={handleSelectAll}
                selectedRowsCount={selectedRows.size}
                assignTo={assignTo}
                setAssignTo={handleSetAssignTo}
                onAssign={handleAssign}
                assignLoading={assignLoading}
              /> */}
            </div>

            <AppointmentsFilters
              search={search}
              setSearch={setSearch}
              startDate={startDate}
              setStartDate={setStartDate}
              status={status}
              setStatus={(v) => setStatus(v as Appointment['status'])}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              statusLabel={filteredStatusLabel as StatusLabel}
            />
          </div>
        </Card.Header>

        <Card.Body className='p-3'>
          <InfiniteScroll
            dataLength={rows.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner className='border-2' />
              </div>
            }
            height={'calc(100vh - 235px)'}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#c1c1c1 transparent',
            }}
          >
            <AdminAppointmentsTable
              data={rows}
              loading={loading}
              statusLabel={statusLabel}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onDecline={handleDecline}
              onReschedule={handleReschedule}
            />
          </InfiniteScroll>
        </Card.Body>
      </Card>
    </div>
  );
}
