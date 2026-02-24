'use client';

import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { QueryPageTitleWrapper } from '@/components/ProvidersModule/components/QueryPageTitleWrapper';
import { NotificationBell } from '@/components/Notifications';
import CalendlyButton from '@/components/Dashboard/provider/CalendlyButton';

export const ApprovedHeader: React.FC = () => {
  return (
    <QueryPageTitleWrapper>
      <MobileHeader title='Approved' className='mb-4' />
      <div className='d-flex flex-column flex-md-row-reverse align-items-md-center align-items-end gap-2'>
        <NotificationBell />
        <CalendlyButton />
      </div>
    </QueryPageTitleWrapper>
  );
};
