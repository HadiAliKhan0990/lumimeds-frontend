'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import MessageSection from './MessageSection';
import { formatMessageTime } from '@/lib/utils/dashboardUtils';
import { ProviderDashboardStats } from '@/lib/types/providerDashboard';
import { ROUTES } from '@/constants';
import { useWindowWidth } from '@/hooks/useWindowWidth';

interface MessagingSystemProps {
  dashboardStats: ProviderDashboardStats | undefined;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ dashboardStats }) => {
  const router = useRouter();

  // Get real-time stats from Redux
  const realTimeStats = useSelector((state: RootState) => state.provider.dashboardStats);

  // Use real-time data if available, fallback to props
  const stats = realTimeStats || dashboardStats;

  const { windowWidth } = useWindowWidth();

  const isLargeScreen = windowWidth >= 992;

  // Event handlers
  const handleReply = (id: string) => {
    console.log('Reply to message:', id);
  };

  const handleViewAll = (sectionTitle: string) => {
    console.log('View all messages for:', sectionTitle);
    // Navigate to chat route with appropriate tab parameter
    const tabParam = sectionTitle === 'Admin Messages' ? 'admin' : 'patient';
    router.push(`${ROUTES.PROVIDER_MESSAGES}?tab=${tabParam}`);
  };

  // Transform API data to match MessageSection component structure
  const messageSections = [
    {
      title: 'Admin Messages',
      messageCount: stats?.totalUnreadAdminMessages || 0,
      messages: (stats?.adminMessages || []).map(
        (message: {
          id: string;
          admin?: { firstName: string; lastName: string };
          content: string;
          createdAt: string;
          metadata?: Record<string, unknown>;
        }) => ({
          id: message.id,
          senderName: message.admin ? `${message.admin.firstName} ${message.admin.lastName}` : 'Unknown Admin',
          senderAvatar: '/avatars/admin-avatar.jpg', // Default avatar
          content: message.metadata?.fileUrl ? 'Sent an attachment' : (message.content || 'No message content'),
          timestamp: formatMessageTime(message.createdAt),
          isAdmin: true,
        })
      ),
    },
    {
      title: 'Patient Messages',
      messageCount: stats?.totalUnreadPatientMessages || 0,
      messages: (stats?.patientMessages || []).map(
        (message: {
          id: string;
          patient?: { firstName: string; lastName: string };
          content: string;
          createdAt: string;
          metadata?: Record<string, unknown>;
        }) => ({
          id: message.id,
          senderName: message.patient ? `${message.patient.firstName} ${message.patient.lastName}` : 'Unknown Patient',
          senderAvatar: '/avatars/patient-avatar.jpg', // Default avatar
          content: message.metadata?.fileUrl ? 'Sent an attachment' : (message.content || 'No message content'),
          timestamp: formatMessageTime(message.createdAt),
          isAdmin: false,
        })
      ),
    },
  ];

  return (
    <div className={`${isLargeScreen ? 'max-w-half' : ''} flex-grow-1 d-flex  flex-column gap-4 overflow-y-auto`}>
      {messageSections.map((section) => (
        <div key={section.title} className='flex-grow-1 overflow-y-auto'>
          <MessageSection section={section} onReply={handleReply} onViewAll={handleViewAll} />
        </div>
      ))}
    </div>
  );
};

export default MessagingSystem;
