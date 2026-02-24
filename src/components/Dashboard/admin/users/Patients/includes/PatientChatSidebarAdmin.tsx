'use client';

import { useEffect, useState } from 'react';
import { PatientChatContentAdmin } from '@/components/Dashboard/admin/users/Patients/includes/PatientChatContentAdmin';
import { NotesContent } from '@/components/Dashboard/admin/users/Patients/includes/NotesContent';

type Props = {
  defaultActiveTab?: 'messages' | 'notes';
  onTabChange?: (tab: 'messages' | 'notes') => void;
};

export default function PatientChatSidebarAdmin({ defaultActiveTab = 'messages', onTabChange }: Readonly<Props>) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notes'>(defaultActiveTab);

  const handleTabAChange = (tab: 'messages' | 'notes') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);
  return (
    <div className='patient_sidebar position-relative flex-column h-100 d-flex'>
      <div className='tab_container position-relative border p-1 rounded-2 border-c-light d-flex align-items-center mb-3'>
        {['messages', 'notes'].map((label) => (
          <button
            key={label}
            className={`tab_button fw-medium position-relative text-capitalize p-0 bg-transparent flex-grow-1 ${
              activeTab === label ? 'active' : ''
            }`}
            onClick={() => handleTabAChange(label as 'messages' | 'notes')}
          >
            {label}
          </button>
        ))}
        <div className='indicator' style={{ left: activeTab === 'messages' ? '4px' : '50%' }} />
      </div>

      {activeTab === 'messages' ? <PatientChatContentAdmin /> : <NotesContent />}
    </div>
  );
}