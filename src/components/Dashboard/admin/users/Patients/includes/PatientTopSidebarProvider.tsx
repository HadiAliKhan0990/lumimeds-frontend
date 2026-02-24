import TabsFilled from '@/components/Tabs/TabsFilled';
import PatientChatSidebar from './PatientChatSidebar';
import { SelectedPatient } from '@/store/slices/patientsApiSlice';
import { useState } from 'react';
import { PatientNotesSideBar } from './PatientNotesSideBar';

export interface PatientTopSidebarProviderProps extends React.ComponentPropsWithoutRef<'div'> {
  patientData?: SelectedPatient;
  showAdminChatToggle?: boolean;
}

export const PatientTopSidebarProvider = ({
  patientData,
  className,
  showAdminChatToggle = false,
}: PatientTopSidebarProviderProps) => {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <div className={className}>
      <TabsFilled
        tabs={[
          { title: 'Messages', value: 'messages' },
          { title: 'Notes', value: 'notes' },
        ]}
        defaultValue={activeTab}
        onChange={setActiveTab}
        className='!tw-w-full tw-mb-3'
        tabClassName={(activeTabValue) => {
          return `tw-flex-grow !tw-py-2 ${
            activeTab?.toLowerCase() === activeTabValue?.toLowerCase()
              ? ' !tw-bg-white !tw-text-primary tw-border tw-border-light'
              : ''
          }`;
        }}
        tabsFlexContainerClassName='tw-w-full !tw-bg-light-gray/40  tw-border tw-border-light-gray'
      />

      {activeTab === 'messages' ? (
        <PatientChatSidebar patientData={patientData} showAdminChatToggle={showAdminChatToggle} />
      ) : (
        <PatientNotesSideBar />
      )}
    </div>
  );
};
