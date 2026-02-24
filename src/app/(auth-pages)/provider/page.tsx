'use client';

import { Container, Spinner, Alert } from 'react-bootstrap';
import DashboardStats from '../../../components/Dashboard/provider/dashbaordStats';
import UpcomingTelehealth from '../../../components/Dashboard/provider/upcomingTelehealth';
import MessagingSystem from '../../../components/Dashboard/provider/MessagingSystem';
import { useGetProviderDashboardStatsQuery } from '@/store/slices/providerDashboardApiSlice';
import { setDashboardStats } from '@/store/slices/providerSlice';
import NotificationBell from '@/components/Notifications/NotificationBell';
import { FiMenu, FiInfo } from 'react-icons/fi';
import { setSidebarOpen } from '@/store/slices/generalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { setModal } from '@/store/slices/modalSlice';
import CalendlyButton from '@/components/Dashboard/provider/CalendlyButton';
import { formatProviderName } from '@/lib/utils/providerName';
import { isProviderAvailableForVideoVisits } from '@/lib/utils/providerSurvey';
import { shouldShowCalendlyFeature, shouldHideCalendlyFeature } from '@/helpers/featureFlags';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { data: apiDashboardStats, isLoading: isLoadingStats, error: statsError } = useGetProviderDashboardStatsQuery();

  const realTimeDashboardStats = useSelector((state: RootState) => state.provider.dashboardStats);

  const dashboardStats = realTimeDashboardStats || apiDashboardStats;
  const isLoading = isLoadingStats;

  const calendlyState = useSelector((state: RootState) => state.calendly);

  useEffect(() => {
    if (apiDashboardStats && !realTimeDashboardStats) {
      dispatch(setDashboardStats(apiDashboardStats));
    }
  }, [apiDashboardStats, realTimeDashboardStats, dispatch]);

  const isCalendlyLoaded = calendlyState.isLoaded;

  const calendlyStatus = calendlyState.status;

  const isCalendlyLoading = calendlyState.isLoading;

  const providerInfo = useSelector((state: RootState) => state.user);
  const providerData = useSelector((state: RootState) => state.provider);

  const providerName = formatProviderName(providerInfo?.firstName, providerInfo?.lastName);

  const availableForVideoVisits = isProviderAvailableForVideoVisits(providerData);

  const isProviderAvailable = providerInfo?.isAvailable !== false;
  const isProviderPaused = providerInfo?.isPaused === true;

  const showCalendly = shouldShowCalendlyFeature(providerInfo?.email);
  const hideCalendly = shouldHideCalendlyFeature(providerInfo?.email);

  useEffect(() => {
    const showModal = showCalendly;
    if (
      showModal &&
      isCalendlyLoaded &&
      !calendlyStatus?.authorized &&
      !isCalendlyLoading &&
      availableForVideoVisits &&
      isProviderAvailable &&
      providerInfo?.firstName
    ) {
      dispatch(setModal({ modalType: 'Connect Calendly' }));
    }
  }, [
    isCalendlyLoaded,
    calendlyStatus?.authorized,
    dispatch,
    isCalendlyLoading,
    availableForVideoVisits,
    isProviderAvailable,
    providerInfo?.firstName,
  ]);

  if (isLoading || !providerInfo?.firstName) {
    return (
      <Container fluid className=''>
        <h1>Dashboard</h1>
        <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
          <Spinner>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (statsError) {
    return (
      <Container fluid className=''>
        <h1>Dashboard</h1>
        <div className='py-5'>
          <Alert variant='danger'>Failed to load dashboard data. Please try again later.</Alert>
        </div>
      </Container>
    );
  }

  return (
    <div className=' d-flex flex-column gap-4 tw-overflow-y-visible provider-dashboard-container'>
      {isProviderPaused && (
        <Alert variant='warning' className='mb-0 d-flex align-items-center gap-2'>
          <strong>⚠️ Account Paused:</strong> Your account is currently paused by an admin. You cannot receive new
          patients.
        </Alert>
      )}
      <div className='d-flex flex-column  gap-2 mb-4'>
        <div className='d-flex flex-grow-1 justify-content-between align-items-md-center flex-wrap  gap-2'>
          <div className='flex-grow-1 d-flex align-items-center gap-2'>
            <FiMenu size={24} className='cursor-pointer d-lg-none' onClick={() => dispatch(setSidebarOpen(true))} />
            <div className='flex-grow-1'>
              <div className='w-80 fs-2 fw-medium text-capitalize text-truncate'>{providerName}</div>
            </div>
          </div>
          <div className='d-flex flex-grow-1 flex-sm-grow-0 justify-content-end  align-items-center gap-2'>
            {showCalendly && isCalendlyLoaded && calendlyStatus?.authorized && (
              <div
                className='cursor-pointer'
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => dispatch(setModal({ modalType: 'Connect Calendly' }))}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dispatch(setModal({ modalType: 'Connect Calendly' }));
                  }
                }}
                aria-label='Calendly Settings'
              >
                <FiInfo size={20} />
              </div>
            )}

            {hideCalendly &&
              isCalendlyLoaded &&
              !calendlyStatus?.authorized &&
              availableForVideoVisits &&
              isProviderAvailable && <CalendlyButton />}
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className='flex-grow-1 overflow-y-auto overflow-x-hidden d-flex flex-column gap-4'>
        <DashboardStats dashboardStats={dashboardStats} />
        <div className='overflow-y-auto flex-grow-1 d-flex flex-column flex-lg-row gap-4'>
          <UpcomingTelehealth dashboardStats={dashboardStats} />

          <MessagingSystem dashboardStats={dashboardStats} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
