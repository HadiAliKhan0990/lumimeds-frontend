'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import ProviderSidebar from '@/components/Dashboard/admin/users/Providers/includes/ProviderSidebar';
import { Provider, setProvider } from '@/store/slices/providerSlice';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { Column, Table } from '@/components/Dashboard/Table';
import { TableCheckbox } from '@/components/Dashboard/TableCheckbox';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { ArchiveArrowDown } from '@/components/Icon/ArchiveArrowDown';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { formatUSPhoneWithoutPlusOne, scrollToTop } from '@/lib/helper';
import { useLazyGetProvidersQuery, usePauseProviderMutation } from '@/store/slices/providersApiSlice';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Error, MetaPayload } from '@/lib/types';
import { Spinner, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { setSearch, setSortOrder, setSortStatus, setSortField, SortState } from '@/store/slices/sortSlice';
import { unselectAll } from '@/store/slices/selectedRowsSlice';
import { formatProviderName } from '@/lib/utils/providerName';
import { FaSync } from 'react-icons/fa';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { RowActions } from './includes/RowActions';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';

type ProvidersType = {
  data: Provider[];
  meta: SortState['meta'];
};

interface Props {
  role?: string;
  query?: string;
}

export const Providers = ({ role, query }: Readonly<Props>) => {
  const dispatch = useDispatch();

  const [providersData, setProvidersData] = useState<ProvidersType>({
    data: [] as Provider[],
    meta: { page: 1, limit: 30 },
  });

  const [open, setOpen] = useState(false);
  const [initialView, setInitialView] = useState<'details' | 'chatLogs'>('details');

  const timer = useRef<NodeJS.Timeout | undefined>(undefined);

  const [triggerProviders, { isFetching }] = useLazyGetProvidersQuery();
  const [pauseProvider] = usePauseProviderMutation();
  const [pausingProviderId, setPausingProviderId] = useState<string | null>(null);

  const selectedProviders = useSelector((state: RootState) => state.selectedRows);

  const { data = [], meta } = providersData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const userType = useSelector((state: RootState) => state.sort.userType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const isSuperAdmin = useSelector((state: RootState) => state.user.isSuperAdmin);
  const userRole = useSelector((state: RootState) => state.user.role);

  const appendProvidersDataLocally = (currentData: ProvidersType, newData: ProvidersType): ProvidersType => {
    if (currentData?.data) {
      const getId = (p: Provider) => p?.id ?? (p as unknown as { userId?: string })?.userId ?? '';
      const existingIds = new Set(currentData.data.map((provider) => getId(provider)));
      const uniqueNewProviders = (newData?.data || [])
        .map((p) => ({ ...p, id: p?.id ?? (p as unknown as { userId?: string })?.userId }))
        .filter((provider) => !existingIds.has(getId(provider)));

      return {
        data: [...currentData.data, ...uniqueNewProviders],
        meta: newData?.meta || currentData.meta,
      };
    } else {
      // If no existing data, return the new data
      return {
        data: newData?.data || [],
        meta: newData?.meta,
      };
    }
  };

  async function handleUpdateProviders({
    meta,
    search,
    sortField,
    sortOrder,
    sortStatus,
    append = false,
  }: MetaPayload) {
    try {
      const { data: res } = await triggerProviders({
        search,
        sortField,
        sortOrder,
        meta: { page: meta?.page ?? 1, limit: 30 },
        ...(sortStatus && { status: sortStatus }),
      });
      const { providers: newProviders } = res?.data || {};

      const mappedNewProviders = (newProviders || []).map((p: Provider) => ({
        ...p,
        id: p?.id ?? (p as unknown as { userId?: string })?.userId,
      }));
      if (append) {
        setProvidersData((prev) =>
          appendProvidersDataLocally(prev, { data: mappedNewProviders || [], meta: res?.data.meta })
        );
      } else {
        await scrollToTop('providers-table-top');
        setProvidersData({ data: mappedNewProviders || [], meta: res?.data.meta });
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Error fetching providers'
          : (error as Error)?.data?.message || 'Error fetching providers'
      );
    }
  }

  function handleRowClick(row: Provider) {
    dispatch(setProvider(row));
    setInitialView('details');
    setOpen(true);
  }

  function handleOpenChatLogs(provider: Provider, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    dispatch(setProvider(provider));
    setInitialView('chatLogs');
    setOpen(true);
  }

  const handleArchiveProviders = () => {
    if (selectedProviders.length === 0) return;

    // Open confirmation modal
    dispatch(setModal({ modalType: 'Archive Providers' }));

    // If single provider is selected, dispatch event with provider data
    if (selectedProviders.length === 1) {
      const handler = () => {
        const provider = data.find((p) => p.id === selectedProviders[0]);

        if (provider) {
          const event = new CustomEvent('singleProviderToArchive', {
            detail: { provider },
          });
          window.dispatchEvent(event);
        }
      };

      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(handler, 100);
    }
  };

  const handlePauseProvider = async (e: React.ChangeEvent<HTMLInputElement>, provider: Provider): Promise<void> => {
    e.stopPropagation();

    const providerId = provider.provider?.id;
    if (!providerId) {
      toast.error('Provider ID not found');
      return;
    }

    const currentlyPaused = provider.provider?.isPaused ?? false;
    const newPausedState = !currentlyPaused;

    setPausingProviderId(providerId);

    try {
      await pauseProvider({ providerId, isPaused: newPausedState }).unwrap();

      setProvidersData((prev) => ({
        ...prev,
        data: prev.data.map((p) =>
          p.provider?.id === providerId ? { ...p, provider: { ...p.provider, isPaused: newPausedState } } : p
        ),
      }));

      toast.success(
        `Provider ${provider.provider?.firstName} ${provider.provider?.lastName} has been ${
          newPausedState ? 'paused' : 'unpaused'
        } successfully`
      );
    } catch (error) {
      toast.error('Failed to update provider status');
      console.error('Error pausing provider:', error);
    } finally {
      setPausingProviderId(null);
    }
  };

  const handleUpdateAutoOrdersLimit = (providerId: string, autoOrdersLimit: number) => {
    setProvidersData((prev) => ({
      ...prev,
      data: prev.data.map((p) => {
        if (p.provider?.id === providerId) {
          return {
            ...p,
            provider: p.provider
              ? ({
                  ...p.provider,
                  autoOrdersLimit,
                } as typeof p.provider)
              : p.provider,
          };
        }
        return p;
      }),
    }));
  };

  const handleProviderSuspended = (updatedProvider: Provider) => {
    setProvidersData((prev) => ({
      ...prev,
      data: prev.data.map((p) => {
        const getId = (provider: Provider) =>
          provider?.id ?? (provider as unknown as { userId?: string })?.userId ?? '';
        if (getId(p) === getId(updatedProvider)) {
          return {
            ...p,
            status: updatedProvider.status ?? p.status,
            isSuspended: updatedProvider.isSuspended ?? p.isSuspended,
            suspendReason:
              updatedProvider.isSuspended === false ? undefined : updatedProvider.suspendReason ?? p.suspendReason,
          };
        }
        return p;
      }),
    }));
  };

  const handleProviderAutomationToggled = (providerId: string, toggleAutomation: boolean) => {
    setProvidersData((prev) => ({
      ...prev,
      data: prev.data.map((p) =>
        p.provider?.id === providerId ? { ...p, provider: { ...p.provider, toggleAutomation } } : p
      ),
    }));
  };

  const columns: Column<Provider>[] = [
    // {
    //   header: <TableCheckbox data={data} isHeader className='tw-mr-2 -tw-mt-2 md:tw-mt-0 md:tw-mr-0' />,
    //   renderCell: (o) => <TableCheckbox item={o} className='tw-mr-2 -tw-mt-2 md:tw-mt-0 md:tw-mr-0' />,
    // },
    {
      header: 'PAUSE',
      renderCell: (o) => {
        const isPaused = o.provider?.isPaused ?? false;
        const isActiveProvider = o.status?.toLowerCase() === 'active';
        const isCurrentlyPausing = pausingProviderId === o.provider?.id;
        const isDisabled = isCurrentlyPausing || !isActiveProvider;

        return (
          <div
            className={`${!isActiveProvider ? 'tw-opacity-50' : ''}`}
            onClick={(e) => e.stopPropagation()}
            title={!isActiveProvider ? 'Only active providers can be paused' : ''}
          >
            <Form.Check
              className='ps-0 status-toggle'
              type='switch'
              checked={isPaused}
              onChange={(e) => handlePauseProvider(e, o)}
              disabled={isDisabled}
            />
          </div>
        );
      },
    },
    {
      header: 'NAME',
      renderCell: (o) => o?.provider && formatProviderName(o?.provider?.firstName, o?.provider?.lastName),
      className: 'text-nowrap text-capitalize',
    },
    { header: 'EMAIL', renderCell: (o) => <span className='provider-email'>{o.email}</span>, className: 'text-nowrap' },
    {
      header: 'PHONE NO.',
      renderCell: (o) => formatUSPhoneWithoutPlusOne(o?.provider?.phoneNumber ?? ''),
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
    {
      header: 'AUTOMATION',
      renderCell: (o) => {
        const isAutomationEnabled = o.provider?.toggleAutomation ?? false;
        return (
          <span className={`status-badge ${isAutomationEnabled ? 'active' : 'inactive'}`}>
            {isAutomationEnabled ? 'ON' : 'OFF'}
          </span>
        );
      },
      className: 'text-nowrap text-center',
    },
    {
      header: 'UNREAD MESSAGES',
      renderCell: (o) => {
        const unreadCount = o.unreadMessageCount ?? 0;
        const hasUnread = unreadCount > 0;

        const iconButton = (
          <button
            type='button'
            className={`tw-relative tw-inline-flex tw-items-center tw-justify-center tw-bg-transparent tw-border-0 tw-p-1 tw-rounded-md tw-transition-all ${
              hasUnread ? 'tw-cursor-pointer hover:tw-bg-primary/10' : 'tw-cursor-default tw-opacity-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (hasUnread) {
                handleOpenChatLogs(o, e);
              }
            }}
            disabled={!hasUnread}
          >
            <IoChatbubblesOutline className={`tw-size-6 ${hasUnread ? 'tw-text-primary' : 'tw-text-gray-400'}`} />
            {hasUnread && (
              <div className='tw-absolute tw-inline-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-text-xs tw-text-white tw-bg-red-500 tw-border-2 tw-border-white tw-border-buffer tw-rounded-full tw--top-2 tw--end-2'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </button>
        );

        return (
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={`unread-tooltip-${o.id}`}>
                {hasUnread ? `Click to view unread messages` : 'No unread messages'}
              </Tooltip>
            }
          >
            {iconButton}
          </OverlayTrigger>
        );
      },
      className: 'text-nowrap text-center',
    },
    {
      header: 'ACTIONS',
      renderCell: (o: Provider) => (
        <RowActions
          provider={o}
          isSuperAdmin={isSuperAdmin ?? false}
          isAdmin={userRole === 'admin'}
          onUpdateAutoOrdersLimit={handleUpdateAutoOrdersLimit}
          onProviderSuspended={handleProviderSuspended}
          onProviderAutomationToggled={handleProviderAutomationToggled}
        />
      ),
      className: 'text-start cursor-pointer',
    },
  ];

  useEffect(() => {
    if (query) {
      if (
        role === 'provider' &&
        data &&
        data.length > 0 &&
        (query.includes(data[0]?.provider?.firstName ?? '') || query.includes(data[0]?.provider?.lastName ?? ''))
      ) {
        dispatch(setProvider(data[0]));
        setOpen(true);
      }
    }
  }, [data, query, role]);

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateProviders({
        meta: { page: currentPage + 1 },
        append: true,
        search,
        sortField,
        sortOrder,
        sortStatus,
      });
    }
  };

  useEffect(() => {
    if (userType === 'Provider') {
      handleUpdateProviders({
        meta: { page: 1 },
        search,
        sortField,
        sortOrder,
        sortStatus,
      });
    }
  }, [userType, search, sortField, sortOrder, sortStatus]);

  useEffect(() => {
    const onRefresh = () => {
      // Reset all filters to default values
      dispatch(setSearch(''));
      dispatch(setSortOrder(''));
      dispatch(setSortStatus(null));
      dispatch(setSortField(''));

      // Reset the providers data state to initial values
      setProvidersData({
        data: [] as Provider[],
        meta: { page: 1, limit: 30 },
      });
      // Then fetch fresh data with default filters
      handleUpdateProviders({ meta: { page: 1 } });
    };

    const onProvidersArchived = () => {
      // Reset pagination and refetch providers
      setProvidersData({
        data: [] as Provider[],
        meta: { page: 1, limit: 30 },
      });

      // Clear selected providers
      dispatch(unselectAll());

      // Refetch providers from page 1
      handleUpdateProviders({
        meta: { page: 1 },
        search,
        sortOrder,
        sortStatus,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('providers:refresh', onRefresh);
      window.addEventListener('providersArchived', onProvidersArchived);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('providers:refresh', onRefresh);
        window.removeEventListener('providersArchived', onProvidersArchived);
      }
    };
  }, [search, sortOrder, sortStatus]);

  // Detect screen size - only render one version
  const isDesktop = useMediaQuery('(min-width: 992px)');

  const allProvidersLoaded = currentPage >= totalPages;

  return (
    <>
      <div className='row align-items-center mb-2 tw-md:tw-mb-4'>
        {isDesktop && <span className='text-lg fw-medium col-lg-4 col-xl-6'>Providers</span>}
        <div className={`col-lg-8 col-xl-6`}>
          {isDesktop && (
            <div className='row g-2 align-items-center justify-content-end flex-nowrap'>
              <div className='col'>
                <FilterGroup handleChange={handleUpdateProviders} />
              </div>
              <div className='col-auto'>
                <button
                  type='button'
                  className='btn btn-outline-primary d-flex align-items-center shadow-none px-3 text-nowrap'
                  onClick={() =>
                    handleUpdateProviders({
                      meta: { page: 1 },
                      search,
                      sortOrder,
                      sortStatus,
                    })
                  }
                  aria-label='Refresh Providers'
                  title='Refresh'
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {!isDesktop && (
            <div className='row g-2'>
              <div className='col-12'>
                <FilterGroup handleChange={handleUpdateProviders} />
              </div>
              <div className='col-12 d-flex justify-content-end'>
                <button
                  type='button'
                  className='btn-outline-primary tw-bg-white border d-flex align-items-center shadow-none px-2'
                  onClick={() =>
                    handleUpdateProviders({
                      meta: { page: 1 },
                      search,
                      sortOrder,
                      sortStatus,
                    })
                  }
                  aria-label='Refresh Providers'
                  title='Refresh'
                >
                  <FaSync size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedProviders.length > 0 && (
        <div className='d-flex align-items-center archived-card justify-content-md-between gap-3 flex-wrap mb-4'>
          <span className='text-sm d-none d-md-inline text-black'>Manage Providers</span>
          <div className={'d-flex align-items-center users-count-wrapper gap-3'}>
            <span className='text-sm users-count text-primary'>{selectedProviders.length} Selected</span>
            <button
              onClick={handleArchiveProviders}
              className='btn btn-primary d-flex align-items-center gap-2 justify-content-center'
            >
              <ArchiveArrowDown className='flex-shrink-0' size={18} />
              Archive Providers
            </button>
            <TableCheckbox data={data} isHeader className='d-md-none' />
          </div>
        </div>
      )}
      <div className='tw-mt-4'>
        {/* Mobile version - only renders on mobile */}
        {!isDesktop && (
          <div className='user-mobile-cards'>
            <InfiniteScroll
              dataLength={data.length}
              next={fetchMore}
              hasMore={!allProvidersLoaded}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={`calc(100vh - 330px)`}
            >
              <UsersMobileCards
                loading={isFetching && data.length === 0}
                rowOnClick={handleRowClick}
                data={data}
                columns={columns}
              />
            </InfiniteScroll>
          </div>
        )}

        {/* Desktop version - only renders on desktop */}
        {isDesktop && (
          <div className='table-responsive'>
            <InfiniteScroll
              dataLength={data.length}
              next={fetchMore}
              hasMore={!allProvidersLoaded}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={'calc(100vh - 256px)'}
            >
              <div id='providers-table-top' />
              <Table
                data={data}
                columns={columns}
                isFetching={isFetching && data.length === 0}
                rowOnClick={handleRowClick}
              />
            </InfiniteScroll>
          </div>
        )}
      </div>

      <ProviderSidebar show={open} onHide={() => setOpen(false)} initialView={initialView} />
    </>
  );
};
