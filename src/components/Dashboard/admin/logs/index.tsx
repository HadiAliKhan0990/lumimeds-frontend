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
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { AdminLogs } from '@/components/Dashboard/admin/logs/AdminLogs';
import { PatientLogs } from '@/components/Dashboard/admin/logs/PatientLogs';
import { ProviderLogs } from '@/components/Dashboard/admin/logs/ProviderLogs';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { unselectAll } from '@/store/slices/selectedRowsSlice';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  role?: string;
  query?: string;
}

export default function Logs({ role }: Readonly<Props>) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = useSelector((state: RootState) => state.sort.userType);

  const tabs = [
    {
      title: 'Admin',
      component: <AdminLogs />,
      eventKey: 'Admin',
    },
    {
      title: 'Patient',
      component: <PatientLogs />,
      eventKey: 'Patient',
    },
    {
      title: 'Provider',
      component: <ProviderLogs />,
      eventKey: 'Provider',
    },
  ];

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
    const rParam = searchParams.get('r');
    if (rParam === 'admin') {
      dispatch(setUserType('Admin'));
    } else if (rParam === 'patient') {
      dispatch(setUserType('Patient'));
    } else if (rParam === 'provider') {
      dispatch(setUserType('Provider'));
    } else if (role === 'provider') {
      dispatch(setUserType('Provider'));
    } else {
      dispatch(setUserType('Admin'));
    }
    return () => {
      handleChange();
    };
  }, [role, searchParams, dispatch, handleChange]);

  return (
    <>
      <div className='d-lg-none'>
        <MobileHeader title='Logs' className='mb-4' />
      </div>

      <div className='d-lg-flex d-none align-items-center justify-content-between flex-wrap gap-2 mb-4'>
        <span className='text-2xl fw-semibold'>System Logs</span>
      </div>

      <Card body className='rounded-12 border-light zero-styles-mobile'>
        <Tabs
          id='logs-tabs'
          className='underlined_tabs border-0 flex-row gap-0'
          activeKey={(userType as string) ?? 'Patient'}
          onSelect={(k) => {
            dispatch(setSortOrder(undefined));
            dispatch(setSortField(undefined));
            dispatch(setSearch(''));
            dispatch(setSearchString(''));
            if (k) dispatch(setUserType(k as TabTypes));

            if (k) router.replace(`/admin/logs?r=${k?.toLowerCase()}`);
          }}
        >
          {tabs.map(({ title, component, eventKey }) => (
            <Tab className='mt-4' key={title} eventKey={eventKey} title={title}>
              {component}
            </Tab>
          ))}
        </Tabs>
      </Card>
    </>
  );
}
