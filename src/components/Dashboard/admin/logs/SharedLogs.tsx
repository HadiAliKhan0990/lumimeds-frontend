'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Column, Table } from '@/components/Dashboard/Table';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import {
  useLazyGetActivityLogsQuery,
  useLazyGetActivityLogsByUserQuery,
  ActivityLog,
} from '@/store/slices/activityLogsApiSlice';
import { setActivityLog } from '@/store/slices/activityLogSlice';
import { ActivityLogModal } from './ActivityLogModal';
import { setSearch } from '@/store/slices/sortSlice';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import Search from '@/components/Dashboard/Search';
import { debounce } from 'lodash';

const Content = () => {
  const dispatch = useDispatch();
  const [logsData, setLogsData] = useState<ActivityLog[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [triggerActivityLogs, { isFetching }] = useLazyGetActivityLogsQuery();
  const [triggerActivityLogsByUser, { isFetching: isFetchingByUser }] = useLazyGetActivityLogsByUserQuery();

  const userType = useSelector((state: RootState) => state.sort.userType);
  const search = useSelector((state: RootState) => state.sort.search);

  const debouncedDispatchSearch = useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim();
        dispatch(setSearch(trimmed || undefined));
      }, 1200),
    [dispatch]
  );

  useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  useEffect(
    () => () => {
      debouncedDispatchSearch.cancel();
    },
    [debouncedDispatchSearch]
  );

  // Map userType to API role parameter
  const getRoleFromUserType = (userType: string | null) => {
    switch (userType) {
      case 'Admin':
        return 'admin';
      case 'Patient':
        return 'patient';
      case 'Provider':
        return 'provider';
      default:
        return 'admin';
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLogsData([]);
      setMeta({ page: 1, totalPages: 1, total: 0 });

      try {
        if (search && search.trim()) {
          const result = await triggerActivityLogsByUser({
            email: search.trim(),
            page: 1,
            limit: 50,
          }).unwrap();

          if (result?.logs) {
            setLogsData(result.logs);
            setMeta(result.meta);
          }
        } else {
          const role = getRoleFromUserType(userType);
          const result = await triggerActivityLogs({
            role,
            page: 1,
            limit: 50,
          }).unwrap();

          if (result?.logs) {
            setLogsData(result.logs);
            setMeta(result.meta);
          }
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        setLogsData([]);
        setMeta({ page: 1, totalPages: 1, total: 0 });
      }
    };

    if (userType) {
      fetchLogs();
    }
  }, [userType, search, triggerActivityLogs, triggerActivityLogsByUser]);

  const loadMoreLogs = async () => {
    if ((meta?.page || 1) >= (meta?.totalPages || 1) || isFetching || isFetchingByUser) return;

    try {
      if (search && search.trim()) {
        const result = await triggerActivityLogsByUser({
          email: search.trim(),
          page: (meta?.page || 1) + 1,
          limit: 50,
        }).unwrap();

        if (result?.logs) {
          setLogsData((prev) => [...prev, ...result.logs]);
          setMeta(result.meta);
        }
      } else {
        const role = getRoleFromUserType(userType);
        const result = await triggerActivityLogs({
          role: role as 'admin' | 'patient' | 'provider',
          page: (meta?.page || 1) + 1,
          limit: 50,
        }).unwrap();

        if (result?.logs) {
          setLogsData((prev) => [...prev, ...result.logs]);
          setMeta(result.meta);
        }
      }
    } catch (error) {
      console.error('Error loading more logs:', error);
    }
  };

  // Handle row click to open modal
  const handleRowClick = (row: ActivityLog) => {
    dispatch(setActivityLog(row));
    setShowModal(true);
  };

  const columns: Column<ActivityLog>[] = [
    {
      header: 'USER',
      accessor: 'userEmail',
      renderCell: (row) => row.userEmail,
      className: 'text-start',
    },
    {
      header: 'ACTION',
      renderCell: (row) => `${row.method} ${row.endpoint}`,
      className: 'text-start',
    },
    {
      header: 'STATUS CODE',
      renderCell: (row) => (
        <span
          className={`badge ${
            row.statusCode >= 200 && row.statusCode < 300
              ? 'bg-success'
              : row.statusCode >= 400
              ? 'bg-danger'
              : 'bg-warning'
          }`}
        >
          {row.statusCode}
        </span>
      ),
    },
    {
      header: 'PERFORMED BY',
      renderCell: (row) => {
        const requestBodyData = row.requestBody as Record<string, unknown> | null;
        const adminId = requestBodyData?.adminId as string | undefined;
        const adminName = requestBodyData?.adminName as string | undefined;
        const adminEmail = requestBodyData?.adminEmail as string | undefined;
        
        if (adminId) {
          // If admin impersonation, show admin name or email
          const displayName = adminName || adminEmail || 'Admin';
          return <span className="text-truncate" style={{ maxWidth: '150px' }} title={displayName}>{displayName}</span>;
        }
        
        // Regular user action, show user name or email
        const displayName = row.userName || row.userEmail || 'User';
        return <span className="text-truncate" style={{ maxWidth: '150px' }} title={displayName}>{displayName}</span>;
      },
      className: 'text-start',
    },
    {
      header: 'DATE & TIME',
      renderCell: (row) => formatUSDateTime(row.createdAt),
    },
  ];

  const getTabTitle = () => {
    switch (userType) {
      case 'Admin':
        return 'Admin Logs';
      case 'Patient':
        return 'Patient Logs';
      case 'Provider':
        return 'Provider Logs';
      default:
        return 'Activity Logs';
    }
  };

  const allLogsLoaded = (meta?.page || 1) >= (meta?.totalPages || 1);

  return (
    <div className='shared_logs'>
      <ActivityLogModal show={showModal} onHide={() => setShowModal(false)} />

      {/* Mobile Search - following users page pattern */}
      <div className='d-lg-none'>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4'>
          <span className='text-base fw-semibold'>{getTabTitle()}</span>
          <Search
            className='w-100'
            placeholder='Search by email...'
            value={searchInput}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setSearchInput(value);
              // If input is cleared, immediately reset search (no debounce needed)
              if (!value.trim()) {
                debouncedDispatchSearch.cancel();
                dispatch(setSearch(undefined));
              } else {
                debouncedDispatchSearch(value);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                debouncedDispatchSearch.flush();
              }
            }}
          />
        </div>
      </div>

      <div className='row align-items-center mb-4'>
        <div className='d-none d-lg-flex align-items-center justify-content-between flex-wrap gap-2 w-100'>
          <span className='text-lg fw-medium d-none d-lg-block'>{getTabTitle()}</span>
          <div className='col-xl-2'>
            <Search
              className='w-100'
              placeholder='Search by email...'
              value={searchInput}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSearchInput(value);
                // If input is cleared, immediately reset search (no debounce needed)
                if (!value.trim()) {
                  debouncedDispatchSearch.cancel();
                  dispatch(setSearch(undefined));
                } else {
                  debouncedDispatchSearch(value);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  debouncedDispatchSearch.flush();
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className='table-responsive mt-5 d-none d-lg-block'>
        {(logsData?.length || 0) === 0 && !(isFetching || isFetchingByUser) ? (
          <div className='text-center py-5'>
            <p className='text-muted'>No activity logs found</p>
            {search && <p className='text-muted small'>Try searching with a different email address</p>}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={logsData?.length || 0}
            next={loadMoreLogs}
            hasMore={!allLogsLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner size='sm' />
              </div>
            }
            height={'calc(100vh - 300px)'}
          >
            <Table
              data={logsData}
              columns={columns}
              isFetching={(isFetching || isFetchingByUser) && (logsData?.length || 0) === 0}
              rowOnClick={handleRowClick}
            />
          </InfiniteScroll>
        )}
      </div>

      {/* Mobile view - using UsersMobileCards pattern */}
      <div className='d-lg-none user-mobile-cards'>
        <InfiniteScroll
          dataLength={logsData?.length || 0}
          next={loadMoreLogs}
          hasMore={!allLogsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 280px)`}
        >
          <MobileCard
            loading={(isFetching || isFetchingByUser) && (logsData?.length || 0) === 0}
            data={logsData || []}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};

export function SharedLogs() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
