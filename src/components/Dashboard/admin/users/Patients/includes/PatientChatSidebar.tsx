'use client';

import { useState } from 'react';
import { PatientChatContent } from '@/components/Dashboard/admin/users/Patients/includes/PatientChatContent';
import { AdminChatContent } from '@/components/Dashboard/admin/users/Patients/includes/AdminChatContent';

export type ChatType = 'patient' | 'admin';

interface PatientChatSidebarProps {
  patientData?: {
    id?: string;
    general?: {
      firstName?: string;
      lastName?: string;
    };
    [key: string]: unknown;
  };
  showAdminChatToggle?: boolean;
}

export default function PatientChatSidebar({ patientData, showAdminChatToggle = false }: PatientChatSidebarProps) {
  // Default to 'admin' on Approved page, 'patient' on other routes
  const [chatType, setChatType] = useState<ChatType>(showAdminChatToggle ? 'admin' : 'patient');

  return (
    <div className='patient_sidebar position-relative flex-column d-flex tw-h-[97%]'>
      {chatType === 'admin' ? (
        <AdminChatContent
          showAdminChatToggle={showAdminChatToggle}
          chatType={chatType}
          onChatTypeChange={setChatType}
        />
      ) : (
        <PatientChatContent
          patientData={patientData}
          showAdminChatToggle={showAdminChatToggle}
          chatType={chatType}
          onChatTypeChange={setChatType}
        />
      )}
    </div>
  );
}
