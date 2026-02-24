import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessages, ChatRoomStatus } from './chatSlice';

export type ConversationBreakdown = {
  providerId: string;
  providerUserId: string;
  providerName: string;
  unreadCount: number;
  latestMessageDate: string;
};

export interface PatientChatState {
  chatId?: string;
  chatData: {
    messages?: ChatMessages[];
    meta?: {
      page: number;
      limit: number;
      hasNextPage: boolean;
    };
    chatRoom?: {
      id: string;
      status: ChatRoomStatus;
    };
    paymentType?: string | null;
    planName?: string | null;
  };
  messageLoadingIntersection: boolean;
  unreadCountData?: {
    careTeam: {
      unreadCount: number;
      careTeamId: string;
    };
    clinicalTeam: {
      unreadCount: number;
      id: string | null;
      clinicalTeamUrl: string | null;
    };
    totalUnreadCount: number;
    providers: {
      unreadCount: number;
      conversationsBreakdown: ConversationBreakdown[];
    };
  };
  isLoading: boolean;
}

const initialState: PatientChatState = {
  chatData: {},
  messageLoadingIntersection: false,
  isLoading: false,
};

const patientChatSlice = createSlice({
  name: 'patientChat',
  initialState,
  reducers: {
    setPatientChatMessages: (state, action: PayloadAction<PatientChatState['chatData']['messages']>) => {
      const incomingMessages = action.payload || [];

      // Early return for empty or single message
      if (incomingMessages.length <= 1) {
        state.chatData.messages = incomingMessages;
        return;
      }

      // Check if already sorted during deduplication
      let needsSorting = false;
      let prevTime = 0;
      const uniqueMessages: typeof incomingMessages = [];
      const seenIds = new Set<string>();

      for (const msg of incomingMessages) {
        // Deduplication
        if (!seenIds.has(msg.id || '')) {
          seenIds.add(msg.id || '');
          uniqueMessages.push(msg);

          // Check sorting
          const currentTime = Date.parse(msg.createdAt || '');
          if (currentTime < prevTime) {
            needsSorting = true;
          }
          prevTime = currentTime;
        }
      }

      // Only sort if necessary
      state.chatData.messages = needsSorting
        ? [...uniqueMessages].sort((a, b) => {
            const ta = Date.parse(a.createdAt || '');
            const tb = Date.parse(b.createdAt || '');
            return ta - tb;
          })
        : uniqueMessages;
    },
    addPatientChatMessage: (state, action: PayloadAction<ChatMessages>) => {
      // Initialize messages array if it doesn't exist
      if (!state.chatData.messages) {
        state.chatData.messages = [];
      }

      // Create a Set of existing message IDs for O(1) lookups
      const existingIds = new Set(state.chatData.messages.map((msg) => msg.id));

      // Only proceed if the message doesn't already exist
      if (!existingIds.has(action.payload.id)) {
        // Find the correct insertion index to maintain chronological order
        const newMessageTime = Date.parse(action.payload.createdAt || '');
        let insertIndex = state.chatData.messages.length;

        // Binary search for optimal insertion position
        let low = 0;
        let high = state.chatData.messages.length - 1;

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const midMessageTime = Date.parse(state.chatData.messages[mid].createdAt || '');

          if (midMessageTime < newMessageTime) {
            low = mid + 1;
          } else {
            high = mid - 1;
            insertIndex = mid;
          }
        }

        // Insert the new message at the correct position
        state.chatData.messages.splice(insertIndex, 0, action.payload);
      }
    },
    setPatientChatMeta: (state, action: PayloadAction<PatientChatState['chatData']['meta']>) => {
      state.chatData.meta = action.payload;
    },
    setPatientChatId: (state, action: PayloadAction<PatientChatState['chatId']>) => {
      state.chatId = action.payload;
    },
    setPatientChatRoom: (state, action: PayloadAction<PatientChatState['chatData']['chatRoom']>) => {
      state.chatData.chatRoom = action.payload;
    },
    setPatientChatPaymentType: (state, action: PayloadAction<PatientChatState['chatData']['paymentType']>) => {
      state.chatData.paymentType = action.payload;
    },
    setPatientChatPlanName: (state, action: PayloadAction<PatientChatState['chatData']['planName']>) => {
      state.chatData.planName = action.payload;
    },
    setMessageLoadingIntersection: (state, action: PayloadAction<PatientChatState['messageLoadingIntersection']>) => {
      state.messageLoadingIntersection = action.payload;
    },
    setLoading: (state, action: PayloadAction<PatientChatState['isLoading']>) => {
      state.isLoading = action.payload;
    },
    setUnreadCountData: (state, action: PayloadAction<PatientChatState['unreadCountData']>) => {
      state.unreadCountData = action.payload;
    },
    setCareTeamUnreadCount: (state, action: PayloadAction<number>) => {
      if (state.unreadCountData) {
        state.unreadCountData.careTeam.unreadCount = action.payload;
      }
    },
    setClinicalTeamUnreadCount: (state, action: PayloadAction<number>) => {
      if (state.unreadCountData) {
        state.unreadCountData.clinicalTeam.unreadCount = action.payload;
      }
    },
    setProviderUnreadCount: (state, action: PayloadAction<number>) => {
      if (state.unreadCountData) {
        state.unreadCountData.providers.unreadCount = action.payload;
      }
    },
  },
});

export const {
  setPatientChatId,
  setPatientChatMessages,
  addPatientChatMessage,
  setPatientChatMeta,
  setPatientChatRoom,
  setMessageLoadingIntersection,
  setUnreadCountData,
  setCareTeamUnreadCount,
  setClinicalTeamUnreadCount,
  setProviderUnreadCount,
  setLoading,
  setPatientChatPaymentType,
  setPatientChatPlanName,
} = patientChatSlice.actions;

export default patientChatSlice.reducer;
