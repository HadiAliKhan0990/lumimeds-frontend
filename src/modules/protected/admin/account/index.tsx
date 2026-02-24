'use client';

import Profile from '@/modules/protected/admin/account/profile';
import BlastMessagesReport from '@/modules/protected/admin/account/report';
import { useState } from 'react';
import { TabPanel, Tabs } from '@/components/elements';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';

interface Props {
  accessToken?: string;
}

export default function AdminAccount({ accessToken = '' }: Readonly<Props>) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Profile', value: 0 },
    { label: 'Blast Messages Report', value: 1 },
  ];

  const handleTabChange = (value: number | string) => {
    setActiveTab(value as number);
  };

  return (
    <>
      <MobileHeader title='Account Settings' className='tw-mb-4' />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className='tw-mt-4'>
        <TabPanel value={activeTab} index={0}>
          <Profile />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <BlastMessagesReport accessToken={accessToken} />
        </TabPanel>
      </div>
    </>
  );
}
