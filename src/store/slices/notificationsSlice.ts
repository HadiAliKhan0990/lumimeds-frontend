import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/lib/types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  pendingEncountersCount: number;
  appointmentsCount: number;
  approvedCount: number;
  patientUnreadMessageCount: number;
  adminUnreadMessageCount: number;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastRefetchUnreadCountAt: string;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  pendingEncountersCount: 0,
  appointmentsCount: 0,
  approvedCount: 0,
  patientUnreadMessageCount: 0,
  adminUnreadMessageCount: 0,
  isLoading: false,
  error: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  lastRefetchUnreadCountAt: new Date().toISOString(),
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (action.payload && !action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    updateNotification: (state, action: PayloadAction<{ id: number; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        const wasRead = state.notifications[index].isRead;
        const isNowRead = updates.isRead ?? wasRead;

        if (!wasRead && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (wasRead && !isNowRead) {
          state.unreadCount += 1;
        }

        state.notifications[index] = { ...state.notifications[index], ...updates };
      }
    },

    removeNotification: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    setPendingEncountersCount: (state, action: PayloadAction<number>) => {
      state.pendingEncountersCount = action.payload;
    },

    setAppointmentsCount: (state, action: PayloadAction<number>) => {
      state.appointmentsCount = action.payload;
    },

    setApprovedCount: (state, action: PayloadAction<number>) => {
      state.approvedCount = action.payload;
    },

    setUnreadMessageCounts: (
      state,
      action: PayloadAction<{ patientUnreadMessageCount?: number; adminUnreadMessageCount?: number }>
    ) => {
      if (action.payload.patientUnreadMessageCount !== undefined) {
        state.patientUnreadMessageCount = action.payload.patientUnreadMessageCount;
      }
      if (action.payload.adminUnreadMessageCount !== undefined) {
        state.adminUnreadMessageCount = action.payload.adminUnreadMessageCount;
      }
    },

    decrementChatUnreadCount: (state, action: PayloadAction<{ channel: 'patient' | 'admin'; amount?: number }>) => {
      const { channel, amount = 1 } = action.payload;
      const decrementBy = Math.max(0, amount);
      if (channel === 'admin') {
        state.adminUnreadMessageCount = Math.max(0, state.adminUnreadMessageCount - decrementBy);
      } else {
        state.patientUnreadMessageCount = Math.max(0, state.patientUnreadMessageCount - decrementBy);
      }
    },

    markAllAsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setConnectionStatus: (state, action: PayloadAction<NotificationsState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },

    clearError: (state) => {
      state.error = null;
    },

    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.patientUnreadMessageCount = 0;
      state.adminUnreadMessageCount = 0;
      state.error = null;
    },
    setLastRefetchUnreadCountAt: (state, action: PayloadAction<string>) => {
      state.lastRefetchUnreadCountAt = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  setUnreadCount,
  setPendingEncountersCount,
  setAppointmentsCount,
  setApprovedCount,
  setUnreadMessageCounts,
  decrementChatUnreadCount,
  markAllAsRead,
  setLoading,
  setError,
  setConnectionStatus,
  clearError,
  resetNotifications,
  setLastRefetchUnreadCountAt,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
