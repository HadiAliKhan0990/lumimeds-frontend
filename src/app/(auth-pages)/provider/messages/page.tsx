import ChatContentWithPatientModal from '@/components/Dashboard/messages/ChatContentWithPatientModal';
import ChatSidebar from '@/components/Dashboard/messages/ChatSidebar';
import ChatWrapper from '@/components/Dashboard/messages/ChatWrapper';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { getAuth } from '@/lib/tokens';
import { getConversationsList } from '@/services/chat';
import { Role } from '@/services/chat/types';
import { FilterReset } from '@/components/Dashboard/messages/FilterReset';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: Role }>;
}

export default async function ProviderMessagesPage({ searchParams }: Readonly<PageProps>) {
  const { accessToken = '' } = await getAuth();
  const { tab = 'patient' } = await searchParams;
  const conversationsData = await getConversationsList({
    page: 1,
    limit: 30,
    role: tab,
    sortField: 'createdAt',
    sortOrder: 'DESC',
  });

  return (
    <ChatWrapper accessToken={accessToken} conversationsData={conversationsData} tab={tab}>
      <FilterReset />
      <div className='text-2xl fw-semibold flex-grow-1 d-none d-lg-block mb-3'>Messages</div>
      <MobileHeader title='Messages' className='mb-3 d-lg-none' />
      <div className='d-flex bg-white rounded-4 overflow-hidden admin-chat chat-messages'>
        <ChatSidebar />
        <ChatContentWithPatientModal accessToken={accessToken} />
      </div>
    </ChatWrapper>
  );
}
