'use client';
import React, { useState } from 'react';
import { ProvideraccountDetails } from './ProvideraccountDetails';
import TabsFilled from '@/components/Tabs/TabsFilled';
import { useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { IoMdArrowBack } from 'react-icons/io';
import LicensedStates from '@/components/Dashboard/provider/licensed-states';
import { LicensedStatesHeader } from '@/components/Dashboard/provider/licensed-states/includes/header';
import { NotificationBell } from '@/components/Notifications';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useMounted } from '@/hooks/usemounted';

export const ProvidersProfilePage = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'LICENSE'>('PROFILE');

  const { windowWidth } = useWindowWidth();

  const { mounted } = useMounted();

  const isMobile = windowWidth <= 494;

  return (
    <div className='tw-flex tw-flex-col tw-gap-6'>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-mb-2'>
          <IoMdArrowBack size={24} className='tw-cursor-pointer bouncing-effect' onClick={() => router.back()} />

          <MobileHeader title='Profile' classNameTitle='!tw-text-[2rem]' />
        </div>

        <NotificationBell />
      </div>

      <div className='tw-flex tw-flex-wrap tw-gap-2 tw-justify-between tw-items-center'>
        <TabsFilled
          defaultValue='PROFILE'
          tabs={[
            { title: 'Provider Profile', value: 'PROFILE' },
            { title: 'Licensed States', value: 'LICENSE' },
          ]}
          onChange={(value) => setActiveTab(value as 'PROFILE' | 'LICENSE')}
        />
        <div
          className={`${
            activeTab === 'LICENSE' ? 'tw-visible col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 ' : 'tw-invisible'
          }`}
        >
          <LicensedStatesHeader />
        </div>
      </div>

      {activeTab === 'PROFILE' && (
        <div className={`${isMobile && mounted ? 'tw--mt-14' : ''}`}>
          <ProvideraccountDetails />
        </div>
      )}

      {activeTab === 'LICENSE' && <LicensedStates />}
    </div>
  );
};
