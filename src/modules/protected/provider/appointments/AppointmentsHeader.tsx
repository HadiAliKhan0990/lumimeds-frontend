'use client';

import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { QueryPageTitleWrapper } from '@/components/ProvidersModule/components/QueryPageTitleWrapper';
import { NotificationBell } from '@/components/Notifications';
import CalendlyButton from '@/components/Dashboard/provider/CalendlyButton';

interface AppointmentsHeaderProps {
  onCreateAppointment?: () => void;
}

export const AppointmentsHeader = ({}:Readonly<AppointmentsHeaderProps>) => {
  return (
    <QueryPageTitleWrapper>
      <MobileHeader title='Sync Appointments' className='mb-4' />
      <div className='d-flex align-items-center gap-3'>
        {/* <button
          className='btn btn-outline-secondary py-1 d-flex align-items-center gap-1'
          onClick={onCreateAppointment}
        >
          <span className='fs-5' style={{ paddingBottom: '2px' }}>
            +
          </span>{' '}
          Create New Appointment
        </button> */}
        {/* <NotificationIconButton /> */}
        <div className='d-flex flex-column flex-md-row-reverse align-items-md-center align-items-end gap-2'>
          <NotificationBell />
          <CalendlyButton />
        </div>
        {/* <NotificationBell /> */}
      </div>
    </QueryPageTitleWrapper>
  );
};
