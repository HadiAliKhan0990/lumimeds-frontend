import Users from '@/components/Dashboard/admin/users';
import ChatWrapper from '@/components/Dashboard/admin/users/Patients/includes/ChatWrapper';
import { getAuth } from '@/lib/tokens';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ r?: string; q?: string }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { r, q } = await searchParams;
  const { accessToken } = await getAuth();

  return (
    <ChatWrapper accessToken={accessToken}>
      <Users role={r} query={q} />
    </ChatWrapper>
  );
}
