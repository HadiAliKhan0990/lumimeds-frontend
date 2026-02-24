import ChatWrapper from '@/components/Dashboard/messages/ChatWrapper';
import AdminMessages from '@/modules/protected/admin/messages';
import { getConversationsList } from '@/services/chat';
import { getAuth } from '@/lib/tokens';
import { Role } from '@/services/chat/types';
import { FilterReset } from '@/components/Dashboard/messages/FilterReset';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: Readonly<PageProps>) {
  const { tab = 'patient' } = await searchParams;
  const { accessToken = '' } = await getAuth();

  const conversationsData = await getConversationsList({
    page: 1,
    limit: 30,
    role: tab as Role,
    sortField: 'createdAt',
    sortOrder: 'DESC',
  });

  return (
    <ChatWrapper accessToken={accessToken} conversationsData={conversationsData} tab={tab as Role}>
      <FilterReset />
      <AdminMessages accessToken={accessToken} />
    </ChatWrapper>
  );
}
