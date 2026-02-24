import AdminOrdersPanel from '@/modules/protected/admin/AdminOrdersPanel';
import ChatWrapper from '@/components/Dashboard/admin/users/Patients/includes/ChatWrapper';
import { getAuth } from '@/lib/tokens';
import { OrderType } from '@/store/slices/sortSlice';

interface Props {
  searchParams: Promise<{
    tab?: OrderType;
    q?: string;
  }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { tab, q } = await searchParams;
  const { accessToken } = await getAuth();

  return (
    <ChatWrapper accessToken={accessToken}>
      <AdminOrdersPanel tab={tab} q={q} />
    </ChatWrapper>
  );
}
