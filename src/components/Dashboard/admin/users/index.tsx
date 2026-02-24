'use client';

import { RootState } from '@/store';
import {
  setMeta,
  setSearch,
  setSearchString,
  setSortField,
  setSortOrder,
  setSortStatus,
  setUserType,
  TabTypes,
} from '@/store/slices/sortSlice';
import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa6';
import { FiDownload } from 'react-icons/fi';
import { setModal } from '@/store/slices/modalSlice';
import { Card, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { Patients } from '@/components/Dashboard/admin/users/Patients';
import { Providers } from '@/components/Dashboard/admin/users/Providers';
import { Admins } from '@/components/Dashboard/admin/users/Admins';
import { Agents } from '@/components/Dashboard/admin/users/Agents';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { unselectAll } from '@/store/slices/selectedRowsSlice';
import { useRouter } from 'next/navigation';
import { ProviderApprovalReportModal } from '@/components/Dashboard/admin/users/Providers/includes/ProviderApprovalReportModal';

interface Props {
  role?: string;
  query?: string;
}

export default function Users({ role, query }: Readonly<Props>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);

  const userType = useSelector((state: RootState) => state.sort.userType);
  const adminProfile = useSelector((state: RootState) => state.user);

  // Tab configuration without instantiating components
  const tabs = [
    { title: 'Patients', eventKey: 'Patient' },
    { title: 'Providers', eventKey: 'Provider' },
    ...(adminProfile?.isSuperAdmin ? [{ title: 'Admins', eventKey: 'Admin' }] : []),
    { title: 'Agents', eventKey: 'Agent' },
  ];

  // Lazy render function - only instantiates the active tab component
  const renderActiveTab = () => {
    switch (userType) {
      case 'Patient':
        return <Patients role={role} query={query} />;
      case 'Provider':
        return <Providers role={role} query={query} />;
      case 'Admin':
        return <Admins />;
      case 'Agent':
        return <Agents query={query} />;
      default:
        return <Patients role={role} query={query} />;
    }
  };

  const handleChange = useCallback(() => {
    dispatch(unselectAll());
    dispatch(setSortStatus(undefined));
    dispatch(setSortOrder(undefined));
    dispatch(setMeta({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    handleChange();
  }, [userType, handleChange]);

  useEffect(() => {
    if (role === 'agent') {
      dispatch(setUserType('Agent'));
    } else if (role === 'admin') {
      dispatch(setUserType('Admin'));
    } else if (role === 'provider') {
      dispatch(setUserType('Provider'));
    } else {
      dispatch(setUserType('Patient'));
    }
    return () => {
      handleChange();
    };
  }, [role, dispatch, handleChange]);

  return (
    <>
      <div className='d-lg-none'>
        <MobileHeader
          title='Users'
          actions={
            <>
              {/* {userType && userType !== 'Agent' && (
                <Dropdown.Item as={Link} href={'/admin/users/archived'}>
                  Archived {userType === 'Provider' ? 'Providers' : 'Patients'}
                </Dropdown.Item>
              )} */}
              {userType === 'Provider' && (
                <>
                  <Dropdown.Item
                    as='button'
                    className='d-flex align-items-center gap-2'
                    onClick={() => dispatch(setModal({ modalType: 'Invite New Provider' }))}
                  >
                    <FaPlus />
                    Invite
                  </Dropdown.Item>
                  {adminProfile?.isSuperAdmin && (
                    <Dropdown.Item
                      as='button'
                      className='d-flex align-items-center gap-2'
                      onClick={() => setShowReportModal(true)}
                    >
                      <FiDownload />
                      Export Report
                    </Dropdown.Item>
                  )}
                </>
              )}
              {userType === 'Admin' && (
                <Dropdown.Item
                  as='button'
                  className='d-flex align-items-center gap-2'
                  onClick={() => dispatch(setModal({ modalType: 'Invite New Admin' }))}
                >
                  <FaPlus />
                  Invite Admin
                </Dropdown.Item>
              )}
              {userType && userType === 'Agent' && (
                <Dropdown.Item
                  as='button'
                  className='d-flex align-items-center gap-2'
                  onClick={() => dispatch(setModal({ modalType: 'Add Agent' }))}
                >
                  <FaPlus />
                  Add
                </Dropdown.Item>
              )}
            </>
          }
          className='mb-4'
        />
      </div>

      <div className='d-lg-flex d-none align-items-center justify-content-between flex-wrap gap-2 mb-4'>
        <span className='text-2xl fw-semibold'>Users</span>
        <div className='d-flex align-items-center gap-2'>
          {/* {userType && userType !== 'Agent' && userType !== 'Admin' && userType !== 'Patient' && (
            <Link
              href={`/admin/users/archived?r=${userType?.toLowerCase()}`}
              className={
                'btn btn-light border border-secondary text-sm fw-medium py-2 d-flex align-items-center justify-content-center gap-2'
              }
            >
              Archived {userType === 'Provider' ? 'Providers' : 'Patients'}
            </Link>
          )} */}
          {userType === 'Provider' && (
            <>
              <button
                className='btn btn-light border border-secondary text-sm fw-medium py-2 d-flex align-items-center justify-content-center gap-2'
                onClick={() => dispatch(setModal({ modalType: 'Invite New Provider' }))}
              >
                <FaPlus />
                <span>Invite</span>
              </button>
              {adminProfile?.isSuperAdmin && (
                <button
                  className='btn btn-light border border-secondary text-sm fw-medium py-2 d-flex align-items-center justify-content-center gap-2'
                  onClick={() => setShowReportModal(true)}
                >
                  <FiDownload />
                  <span>Export Report</span>
                </button>
              )}
            </>
          )}
          {userType === 'Admin' && (
            <button
              className='btn btn-light border border-secondary text-sm fw-medium py-2 d-flex align-items-center justify-content-center gap-2'
              onClick={() => dispatch(setModal({ modalType: 'Invite New Admin' }))}
            >
              <FaPlus />
              <span>Invite Admin</span>
            </button>
          )}
          {userType && userType === 'Agent' && (
            <button
              className='btn btn-light border border-secondary text-sm fw-medium py-2 d-flex align-items-center justify-content-center gap-2'
              onClick={() => dispatch(setModal({ modalType: 'Add Agent' }))}
            >
              <FaPlus />
              <span>Add Agent</span>
            </button>
          )}
        </div>
      </div>

      <Card body className='rounded-12 border-light zero-styles-mobile'>
        <Tabs
          id='users-tabs'
          className='underlined_tabs border-0 flex-row gap-0'
          activeKey={(userType as string) ?? 'Patient'}
          onSelect={(k) => {
            dispatch(setSortOrder(undefined));
            dispatch(setSortField(undefined));
            dispatch(setSearch(''));
            dispatch(setSearchString(''));
            if (k) dispatch(setUserType(k as TabTypes));

            if (k) router.replace(`/admin/users?r=${k?.toLowerCase()}`);
          }}
        >
          {tabs.map(({ title, eventKey }) => (
            <Tab className='tw-mt-4' key={title} eventKey={eventKey} title={title}>
              {userType === eventKey && renderActiveTab()}
            </Tab>
          ))}
        </Tabs>
      </Card>
      <ProviderApprovalReportModal show={showReportModal} onHide={() => setShowReportModal(false)} />
    </>
  );
}
