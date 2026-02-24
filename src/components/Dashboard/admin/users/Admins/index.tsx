'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AdminUserType, useLazyGetAdminsQuery, useDeactivateAdminMutation, useToggleEmailEnabledMutation } from '@/store/slices/adminApiSlice';
import { Column, Table } from '@/components/Dashboard/Table';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { Button, Spinner, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Error, MetaPayload } from '@/lib/types';
import { capitalizeFirst, formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { ReInviteAction } from '@/components/Dashboard/admin/users/Admins/includes/ReInviteAction';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { isAxiosError } from 'axios';

export const Admins = () => {
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const userType = useSelector((state: RootState) => state.sort.userType);

  const admins = useSelector((state: RootState) => state.admins.data);
  const meta = useSelector((state: RootState) => state.admins.meta);
  const user = useSelector((state: RootState) => state.user);

  const [triggerAdmins, { isFetching }] = useLazyGetAdminsQuery();
  const [deactivateAdminMutation, { isLoading: isDeactivating }] = useDeactivateAdminMutation();
  const [toggleEmailEnabledMutation, { isLoading: isTogglingEmail }] = useToggleEmailEnabledMutation();

  const [adminToDeactivate, setAdminToDeactivate] = useState<AdminUserType | null>(null);

  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const handleUpdateAdmins = async ({ meta: newMeta, search, sortOrder, sortStatus }: MetaPayload) => {
    try {
      await triggerAdmins({
        search,
        page: newMeta?.page || 1,
        limit: newMeta?.limit || 30,
        sortOrder,
        status: sortStatus,
      }).unwrap();
    } catch (e) {
      console.log(e);
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateAdmins({
        meta: { page: currentPage + 1, limit: meta.limit },
        search,
        sortOrder,
        sortStatus,
      } as MetaPayload);
    }
  };

  const handleDeactivate = async () => {
    if (!adminToDeactivate) return;

    try {
      const { success, message } = await deactivateAdminMutation({ adminId: adminToDeactivate.id }).unwrap();

      if (success) {
        toast.success(message || 'Admin deactivated successfully');
        handleUpdateAdmins({ search, sortOrder, meta, sortStatus });
      } else {
        toast.error(message || 'Failed to deactivate admin');
      }
    } catch (error) {
      let message = 'Error while deactivating admin';

      if (isAxiosError(error) && error.response?.data) {
        message = error.response.data.message || message;
      } else if ((error as Error).data) {
        message = (error as Error).data.message || message;
      }

      toast.error(message);
    } finally {
      setAdminToDeactivate(null);
    }
  };

  const handleToggleEmailEnabled = async (admin: AdminUserType, isEmailEnabled: boolean) => {
    try {
      const { success, message } = await toggleEmailEnabledMutation({
        adminId: admin.id,
        isEmailEnabled,
      }).unwrap();

      if (success) {
        toast.success(message || `Email notifications ${isEmailEnabled ? 'enabled' : 'disabled'} successfully`);
        handleUpdateAdmins({ search, sortOrder, meta, sortStatus });
      } else {
        toast.error(message || 'Failed to toggle email enabled status');
      }
    } catch (error) {
      let message = 'Error while toggling email enabled status';

      if (isAxiosError(error) && error.response?.data) {
        message = error.response.data.message || message;
      } else if ((error as Error).data) {
        message = (error as Error).data.message || message;
      }

      toast.error(message);
    }
  };

  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  const columns: Column<AdminUserType>[] = [
    {
      header: 'NAME',
      renderCell: (admin) => (admin.firstName ? `${admin.firstName} ${admin.lastName}` : '-'),
    },
    {
      header: 'EMAIL',
      accessor: 'email',
    },
    {
      header: 'PHONE NO.',
      renderCell: (admin) => (admin?.contactNumber ? formatUSPhoneWithoutPlusOne(admin.contactNumber ?? '') : '-'),
    },
    {
      header: 'STATUS',
      renderCell: (admin) => (
        <span className={`status-badge ${admin.status?.toLowerCase()}`}>{capitalizeFirst(admin.status)}</span>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            header: 'EMAIL ENABLED',
            renderCell: (admin: AdminUserType) => (
              <Form.Check
                type='switch'
                id={`email-enabled-${admin.id}`}
                checked={admin.isEmailEnabled ?? true}
                onChange={(e) => handleToggleEmailEnabled(admin, e.target.checked)}
                disabled={isTogglingEmail}
              />
            ),
          },
        ]
      : []),
    {
      header: 'ACTIONS',
      renderCell: (admin) =>
        admin.status?.toLowerCase() === 'active' ? (
          <Button
            variant='outline-danger'
            size='sm'
            className='d-flex align-items-center justify-content-center gap-2'
            onClick={() => setAdminToDeactivate(admin)}
            disabled={isDeactivating}
          >
            Deactivate
          </Button>
        ) : (
          <ReInviteAction handleChange={handleUpdateAdmins} admin={admin} />
        ),
    },
  ];

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      handleUpdateAdmins({ meta, search, sortOrder, sortStatus });
    }
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userType]);

  useEffect(() => {
    if (userType === 'Admin') {
      handleUpdateAdmins({ meta: { page: 1, limit: 30 } as MetaPayload['meta'] });
    }
  }, [userType]);

  return (
    <>
      <div className='row align-items-center tw-mb-4'>
        <span className='text-lg fw-medium d-none d-md-block col-md-3 col-lg-4 col-xl-6'>Admins</span>
        <div className={`col-lg-8 col-xl-6 col-md-9 text-end`}>
          <FilterGroup handleChange={handleUpdateAdmins} />
        </div>
      </div>

      <div className='d-md-none user-mobile-cards'>
        <InfiniteScroll
          dataLength={admins.length}
          next={fetchMore}
          hasMore={currentPage < totalPages}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 330px)`}
        >
          <UsersMobileCards loading={isFetching && admins.length === 0} data={admins} columns={columns} />
        </InfiniteScroll>
      </div>

      <div className='table-responsive d-none d-md-block'>
        <InfiniteScroll
          dataLength={admins.length}
          next={fetchMore}
          hasMore={currentPage < totalPages}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 256px)'}
        >
          <Table data={admins} columns={columns} isFetching={isFetching && admins.length === 0} />
        </InfiniteScroll>
      </div>

      <ConfirmationModal
        show={!!adminToDeactivate}
        onHide={() => setAdminToDeactivate(null)}
        onConfirm={handleDeactivate}
        title='Deactivate Admin'
        message={
          adminToDeactivate
            ? `Are you sure you want to deactivate ${adminToDeactivate.firstName} ${adminToDeactivate.lastName}? They will no longer be able to access the admin portal.`
            : ''
        }
        confirmLabel='Deactivate'
        cancelLabel='Cancel'
        loading={isDeactivating}
      />
    </>
  );
};
