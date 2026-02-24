import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityLog } from './activityLogsApiSlice';

interface ActivityLogState {
  current: ActivityLog | null;
}

const initialState: ActivityLogState = {
  current: null,
};

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    setActivityLog: (state, action: PayloadAction<ActivityLog>) => {
      state.current = action.payload;
    },
    clearActivityLog: (state) => {
      state.current = null;
    },
  },
});

export const { setActivityLog, clearActivityLog } = activityLogSlice.actions;

export default activityLogSlice.reducer;
