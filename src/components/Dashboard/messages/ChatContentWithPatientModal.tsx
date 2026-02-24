'use client';

import { useState } from 'react';
import ChatContent from './ChatContent';
import { PatientModal } from './PatientModal';

interface Props {
  accessToken?: string;
}

export default function ChatContentWithPatientModal({ accessToken }: Readonly<Props>) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const [selectedPatientEmail, setSelectedPatientEmail] = useState<string | null>(null);

  const handlePatientClick = (patientId: string, patientName?: string, patientEmail?: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName || null);
    setSelectedPatientEmail(patientEmail || null);
    setShowPatientModal(true);
  };

  return (
    <>
      <ChatContent accessToken={accessToken} onPatientClick={handlePatientClick} />

      {/* Patient Modal */}
      <PatientModal
        show={showPatientModal}
        onHide={() => {
          setShowPatientModal(false);
          setSelectedPatientId(null);
          setSelectedPatientName(null);
          setSelectedPatientEmail(null);
        }}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
        patientEmail={selectedPatientEmail || undefined}
      />
    </>
  );
}
