'use client';

import React, { useTransition } from 'react';
import { Card } from 'react-bootstrap';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import pendingIcon from '@/assets/doctor-portal/pending.svg';
import syncIcon from '@/assets/doctor-portal/telehealth.svg';
import approvedIcon from '@/assets/doctor-portal/approved.svg';
import { getCurrentMonthName } from '@/lib/utils/dashboardUtils';
import { ProviderDashboardStats } from '@/lib/types/providerDashboard';
import { ROUTES } from '@/constants';

interface StatCardProps {
  title: string;
  todayCount: number;
  monthlyCount: number;
  monthlyText: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  currentMonth: string;
  route: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  todayCount,
  monthlyCount,
  monthlyText,
  icon,
  iconWidth,
  iconHeight,
  currentMonth,
  route,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    NProgress.start();

    startTransition(() => {
      router.push(route);
    });
  };

  return (
    <Card
      className='border border-primary-light rounded-3'
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        opacity: isPending ? 0.7 : 1,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Card.Body className='p-4' style={{ minHeight: '8rem' }}>
        <div className='d-flex justify-content-between align-items-start h-100'>
          <div className='flex-grow-1 d-flex flex-column gap-3'>
            <h5 className='fw-normal text-dark-charcoal mb-0 fs-6 font-inter'>{title}</h5>
            <div className='d-flex flex-column gap-2'>
              <div className='d-flex align-items-center gap-1'>
                <span className='fs-5 fw-medium font-inter text-dark-gray'>{todayCount}</span>
                <span className='text-orange-brown fw-medium text-sm'>Today</span>
              </div>
              <div className='text-medium-gray fw-normal font-roboto text-xs'>
                {monthlyCount} {monthlyText} in {currentMonth}
              </div>
            </div>
          </div>
          <div>
            <Image src={icon} alt={title} width={iconWidth} height={iconHeight} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

interface DashboardStatsProps {
  dashboardStats: ProviderDashboardStats | undefined;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ dashboardStats }) => {
  const currentMonth = getCurrentMonthName();

  // Get real-time stats from Redux
  const realTimeStats = useSelector((state: RootState) => state.provider.dashboardStats);

  // Use real-time data if available, fallback to props
  const rawStats = realTimeStats || dashboardStats;

  // Extract the actual stats data from the nested structure
  const extractStats = (data: unknown) => {
    if (data && typeof data === 'object' && 'stats' in data) {
      return (data as { stats: unknown }).stats;
    }
    return data;
  };
  const stats = extractStats(rawStats);

  // Don't render if no stats data is available
  if (!stats) {
    return null;
  }

  // Safely extract nested data with fallbacks
  const statsTyped = stats as {
    encounters?: { pendingToday?: number; completedInCurrentMonth?: number };
    appointments?: { pendingToday?: number; completedInCurrentMonth?: number };
    approved?: { today?: number; inCurrentMonth?: number };
  };

  const encounters = statsTyped.encounters || { pendingToday: 0, completedInCurrentMonth: 0 };
  const appointments = statsTyped.appointments || { pendingToday: 0, completedInCurrentMonth: 0 };
  const approved = statsTyped.approved || { today: 0, inCurrentMonth: 0 };

  // Prepare stats data from API response with null safety
  const statsArray: StatCardProps[] = [
    {
      title: 'Pending Encounters',
      todayCount: encounters.pendingToday || 0,
      monthlyCount: encounters.completedInCurrentMonth || 0,
      monthlyText: 'completed',
      icon: pendingIcon,
      iconWidth: 46,
      iconHeight: 46,
      currentMonth,
      route: ROUTES.PROVIDER_PENDING_ENCOUNTERS,
    },
    {
      title: 'Sync Appointments',
      todayCount: appointments.pendingToday || 0,
      monthlyCount: appointments.completedInCurrentMonth || 0,
      monthlyText: 'completed',
      icon: syncIcon,
      iconWidth: 56,
      iconHeight: 56,
      currentMonth,
      route: ROUTES.PROVIDER_APPOINTMENTS,
    },
    {
      title: 'Approved',
      todayCount: approved.today || 0,
      monthlyCount: approved.inCurrentMonth || 0,
      monthlyText: 'approved',
      icon: approvedIcon,
      iconWidth: 35,
      iconHeight: 35,
      currentMonth,
      route: ROUTES.PROVIDER_APPROVED,
    },
  ];

  return (
    <div className='row g-4'>
      {statsArray.map((stat: StatCardProps, index: number) => (
        <div key={index} className='col-12 col-md-6 col-lg-4'>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
