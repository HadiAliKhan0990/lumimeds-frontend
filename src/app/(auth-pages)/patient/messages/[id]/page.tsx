import { redirect } from 'next/navigation';
import PatientChat from '@/components/Dashboard/patient/messages';
import { isValidUUID } from '@/lib/utils/validation';
import { ROUTES } from '@/constants';

interface CareChatProps {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function CareChat({ params, searchParams }: Readonly<CareChatProps>) {
  const [{ id = '' }, { title = '' }] = await Promise.all([params, searchParams]);

  // Validate that id is a valid UUID before making API calls
  if (!id || !isValidUUID(id)) {
    redirect(ROUTES.PATIENT_MESSAGES);
  }

  return <PatientChat chatId={id} title={title} />;
}
