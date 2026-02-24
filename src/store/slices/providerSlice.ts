import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProviderDashboardStats, TelehealthAppointment } from '@/lib/types/providerDashboard';
import { PatientAnswerType, PatientSurvey } from '@/lib/types';
import { QuestionType } from '@/lib/enums';

export interface Provider {
  id?: string | null;
  userId?: string | null;
  email?: string | null;
  status?: string | null;
  createdAt?: string | null;
  provider?: ProviderInfo | null;
  isSuspended?: boolean | null;
  suspendReason?: string | null;
  suspendedAt?: string | null;
  // Dashboard real-time data
  dashboardStats?: ProviderDashboardStats | null;
  socketConnected?: boolean;
  socketError?: string | null;
  surveys?: {
    data: PatientSurvey[];
  } | null;
  autoOrdersLimit?: number | null;
  unreadMessageCount?: number;
}

export interface ProviderInfo {
  firstName?: string | null;
  id?: string | null;
  lastName?: string | null;
  gender?: string | null;
  npiNumber?: string | null;
  providerType?: string | null;
  phoneNumber?: string | null;
  group?: string | null;
  isPaused?: boolean | null;
  toggleAutomation?: boolean | null;
  surveySubmissions?:
    | [
        {
          id: string;
          surveyId: string;
          surveyName: string;
          answers: {
            questionId: string;
            questionText: string;
            questionType: QuestionType;
            options: string[];
            answer: PatientAnswerType;
            isRequired: boolean;
          }[];
          isCompleted: boolean;
          createdAt: string;
        }
      ]
    | null;
  autoOrdersLimit?: number | null;
}

const initialState: Provider = {
  id: null,
  userId: null,
  email: null,
  status: null,
  createdAt: null,
  provider: null,
  isSuspended: null,
  suspendReason: null,
  suspendedAt: null,
  dashboardStats: null,
  socketConnected: false,
  socketError: null,
  surveys: null,
  autoOrdersLimit: null,
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<Provider>) => {
      return action.payload;
    },
    clearProvider: (state) => {
      Object.assign(state, initialState);
    },
    // Dashboard real-time actions
    setDashboardStats: (state, action: PayloadAction<ProviderDashboardStats>) => {
      state.dashboardStats = action.payload;
    },
    updateDashboardStats: (state, action: PayloadAction<Partial<ProviderDashboardStats>>) => {
      if (state.dashboardStats) {
        state.dashboardStats = { ...state.dashboardStats, ...action.payload };
      }
    },
    addAppointment: (state, action) => {
      if (state.dashboardStats) {
        const index = state.dashboardStats.telehealthUpcomingAppointments.findIndex(
          (apt) => apt.consultationId === action.payload.consultationId
        );

        if (index !== -1) {
          state.dashboardStats.telehealthUpcomingAppointments[index] = action.payload;
        } else {
          state.dashboardStats.telehealthUpcomingAppointments.unshift(action.payload);
        }
      }
    },
    updateAppointment: (state, action: PayloadAction<TelehealthAppointment>) => {
      if (state.dashboardStats) {
        const index = state.dashboardStats.telehealthUpcomingAppointments.findIndex(
          (apt) => apt.consultationId === action.payload.consultationId
        );
        if (index !== -1) {
          state.dashboardStats.telehealthUpcomingAppointments[index] = action.payload;
        }
      }
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      if (state.dashboardStats) {
        state.dashboardStats.telehealthUpcomingAppointments =
          state.dashboardStats.telehealthUpcomingAppointments.filter((apt) => apt.consultationId !== action.payload);
      }
    },
    addAdminMessage: (state, action) => {
      if (state.dashboardStats) {
        const newMessage = action.payload;

        // Compare by admin name since admin IDs might be different between socket and API
        // Handle cases where firstName might contain full name or be split differently
        const existingIndex = state.dashboardStats.adminMessages.findIndex((msg) => {
          const existingFullName = `${msg.admin?.firstName || ''} ${msg.admin?.lastName || ''}`.trim();
          const newFullName = `${newMessage.admin?.firstName || ''} ${newMessage.admin?.lastName || ''}`.trim();

          // Compare full names (case insensitive)
          return (
            existingFullName.toLowerCase() === newFullName.toLowerCase() ||
            // Also check if one contains the other (for cases like "Lumimeds Admin" vs "Lumimeds" + "Admin")
            existingFullName.toLowerCase().includes(newFullName.toLowerCase()) ||
            newFullName.toLowerCase().includes(existingFullName.toLowerCase())
          );
        });

        if (existingIndex !== -1) {
          // Update existing conversation with new message
          state.dashboardStats.adminMessages[existingIndex] = {
            ...state.dashboardStats.adminMessages[existingIndex],
            ...newMessage,
            // Keep the original conversation data but update with new message
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            isRead: newMessage.isRead,
          };
        } else {
          // Add new conversation
          state.dashboardStats.adminMessages.unshift(newMessage);
        }
        state.dashboardStats.totalUnreadAdminMessages += 1;
      }
    },
    addPatientMessage: (state, action) => {
      if (state.dashboardStats) {
        const newMessage = action.payload;
        const existingIndex = state.dashboardStats.patientMessages.findIndex(
          (msg) => msg.patient?.id === newMessage.patient?.id
        );

        if (existingIndex !== -1) {
          // Update existing conversation with new message
          state.dashboardStats.patientMessages[existingIndex] = {
            ...state.dashboardStats.patientMessages[existingIndex],
            ...newMessage,
            // Keep the original conversation data but update with new message
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            isRead: newMessage.isRead,
          };
        } else {
          // Add new conversation
          state.dashboardStats.patientMessages.unshift(newMessage);
        }
        state.dashboardStats.totalUnreadPatientMessages += 1;
      }
    },
    updateMessageCounts: (state, action: PayloadAction<{ adminCount: number; patientCount: number }>) => {
      if (state.dashboardStats) {
        state.dashboardStats.totalUnreadAdminMessages = action.payload.adminCount;
        state.dashboardStats.totalUnreadPatientMessages = action.payload.patientCount;
      }
    },
    // Real-time stats updates
    incrementAppointmentStats: (state) => {
      if (state.dashboardStats) {
        state.dashboardStats.appointments.pendingToday += 1;
      }
    },
    decrementAppointmentStats: (state) => {
      if (state.dashboardStats) {
        state.dashboardStats.appointments.pendingToday = Math.max(
          0,
          state.dashboardStats.appointments.pendingToday - 1
        );
      }
    },
    incrementEncounterStats: (state) => {
      if (state.dashboardStats) {
        state.dashboardStats.encounters.pendingToday += 1;
      }
    },
    decrementEncounterStats: (state) => {
      if (state.dashboardStats) {
        state.dashboardStats.encounters.pendingToday = Math.max(0, state.dashboardStats.encounters.pendingToday - 1);
      }
    },
    incrementApprovedStats: (state) => {
      if (state.dashboardStats) {
        state.dashboardStats.approved.today += 1;
        state.dashboardStats.approved.inCurrentMonth += 1;
      }
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    setSocketError: (state, action: PayloadAction<string | null>) => {
      state.socketError = action.payload;
    },
    clearSocketError: (state) => {
      state.socketError = null;
    },
  },
});

export const {
  setProvider,
  clearProvider,
  setDashboardStats,
  updateDashboardStats,
  addAppointment,
  updateAppointment,
  removeAppointment,
  addAdminMessage,
  addPatientMessage,
  updateMessageCounts,
  incrementAppointmentStats,
  decrementAppointmentStats,
  incrementEncounterStats,
  decrementEncounterStats,
  incrementApprovedStats,
  setSocketConnected,
  setSocketError,
  clearSocketError,
} = providerSlice.actions;

export default providerSlice.reducer;
