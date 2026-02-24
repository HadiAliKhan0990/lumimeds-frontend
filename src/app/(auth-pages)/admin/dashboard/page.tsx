'use client';

import DashboardOverview from '@/components/Dashboard/admin/DashboardOverview';
import DashboardStatistics from '@/components/Dashboard/admin/DashboardStatistics';
import { useDispatch } from 'react-redux';
import { FiMenu } from 'react-icons/fi';
import { setSidebarOpen } from '@/store/slices/generalSlice';
import { DashboardOrders } from '@/components/Dashboard/admin/DashboardOrders';
import { useGetDashboardStatesQuery } from '@/store/slices/dashboardApiSlice';

export default function Admin() {
  const dispatch = useDispatch();

  useGetDashboardStatesQuery();

  return (
    <div className='d-flex flex-column gap-3'>
      {/* HEADER */}
      <div className='d-flex align-items-center gap-3'>
        <FiMenu size={24} className='cursor-pointer d-lg-none' onClick={() => dispatch(setSidebarOpen(true))} />
        <span className='text-4xl fw-medium'>Dashboard</span>
      </div>

      {/* DASHBOARD PANELS */}
      <DashboardOverview />
      <DashboardStatistics />
      <DashboardOrders />
    </div>
  );
}

