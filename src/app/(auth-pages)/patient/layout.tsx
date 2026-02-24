import ChatWrapper from '@/components/Dashboard/patient/messages/ChatWrapper';
import PatientLayout from '@/components/Layouts/PatientLayout';
import { PendingSubmissionGuard } from '@/components/Auth/PendingSubmissionGuard';
import { getAuth } from '@/lib/tokens';
import { getPatientProfile } from '@/services/patient';
import { PropsWithChildren } from 'react';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default async function PatientDashboardLayout({ children }: Readonly<PropsWithChildren>) {
  const { accessToken } = await getAuth();
  const profile = accessToken ? await getPatientProfile() : undefined;

  return (
    <ChatWrapper accessToken={accessToken}>
      <PendingSubmissionGuard profile={profile} />
      <PatientLayout profile={profile} accessToken={accessToken}>
        {children}
      </PatientLayout>
    </ChatWrapper>
  );
}
