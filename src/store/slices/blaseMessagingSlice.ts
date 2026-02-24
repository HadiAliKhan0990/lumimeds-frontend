import { ChatUserType } from '@/services/chat/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BlaseMessaging {
  isBlaseMessaging: boolean;
  isSelectedAll: boolean;
  selectedUsers: ChatUserType[];
  selectedUserIds: string[];
  isDialogOpen: boolean;
  isSendEmail: boolean;
}

const initialState: BlaseMessaging = {
  isBlaseMessaging: false,
  isSelectedAll: false,
  selectedUsers: [],
  selectedUserIds: [],
  isDialogOpen: false,
  isSendEmail: false,
};

export const blaseMessagingSlice = createSlice({
  name: 'blaseMessaging',
  initialState,
  reducers: {
    setIsBlaseMessaging: (state, action: PayloadAction<boolean>) => {
      state.isBlaseMessaging = action.payload;
      if (action.payload) {
        state.isDialogOpen = true;
      }
    },
    setIsSelectedAll: (state, action: PayloadAction<boolean>) => {
      state.isSelectedAll = action.payload;
    },
    setSelectedUsers: (state, action: PayloadAction<ChatUserType[]>) => {
      state.selectedUsers = action.payload;
      state.selectedUserIds = action.payload.map((user) => user.id);
    },
    addSelectedUser: (state, action: PayloadAction<ChatUserType>) => {
      const userId = action.payload.id;
      if (!state.selectedUserIds.includes(userId)) {
        state.selectedUsers.push(action.payload);
        state.selectedUserIds.push(userId);
      }
    },
    removeSelectedUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const index = state.selectedUserIds.indexOf(userId);
      if (index !== -1) {
        state.selectedUsers.splice(index, 1);
        state.selectedUserIds.splice(index, 1);
      }
    },
    setIsDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDialogOpen = action.payload;
    },
    setIsSendEmail: (state, action: PayloadAction<boolean>) => {
      state.isSendEmail = action.payload;
    },
    resetBlaseMessaging: (state) => {
      state.isBlaseMessaging = false;
      state.isSelectedAll = false;
      state.selectedUsers = [];
      state.selectedUserIds = [];
      state.isDialogOpen = false;
      state.isSendEmail = false;
    },
  },
});

export const {
  setIsBlaseMessaging,
  setIsSelectedAll,
  setSelectedUsers,
  addSelectedUser,
  removeSelectedUser,
  setIsDialogOpen,
  resetBlaseMessaging,
  setIsSendEmail,
} = blaseMessagingSlice.actions;

export default blaseMessagingSlice.reducer;
