import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useSafeNotifications = () => {
  // Get notification data directly from Redux state
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const pendingEncountersCount = useSelector((state: RootState) => state.notifications.pendingEncountersCount);
  const appointmentsCount = useSelector((state: RootState) => state.notifications.appointmentsCount);
  const approvedCount = useSelector((state: RootState) => state.notifications.approvedCount);
  const patientUnreadMessageCount = useSelector((state: RootState) => state.notifications.patientUnreadMessageCount);
  const adminUnreadMessageCount = useSelector((state: RootState) => state.notifications.adminUnreadMessageCount);
  const isConnected = useSelector((state: RootState) => state.notifications.isConnected);
  const connectionStatus = useSelector((state: RootState) => state.notifications.connectionStatus);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const isLoading = useSelector((state: RootState) => state.notifications.isLoading);
  const error = useSelector((state: RootState) => state.notifications.error);

  const chatUnreadCount = (adminUnreadMessageCount || 0) + (patientUnreadMessageCount || 0);

  return {
    isConnected,
    connectionStatus,
    unreadCount,
    pendingEncountersCount,
    appointmentsCount,
    approvedCount,
    patientUnreadMessageCount,
    adminUnreadMessageCount,
    chatUnreadCount,
    notifications,
    isLoading,
    error,
    clearError: () => {}, // This would need to be implemented if needed
  };
};
