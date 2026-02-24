import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PendingEncounter } from './ordersApiSlice';

export interface EncounterEvent {
  type: 'created' | 'updated' | 'cancelled' | 'rescheduled' | 'assigned' | 'approved' | 'rejected';
  encounter: PendingEncounter;
  timestamp: string;
}

export interface EncountersRealTimeState {
  encounters: PendingEncounter[];
  todayCount: number;
  lastUpdated: string | null;
  isConnected: boolean;
  error: string | null;
  events: EncounterEvent[];
  shouldRefetch: boolean;
}

const initialState: EncountersRealTimeState = {
  encounters: [],
  todayCount: 0,
  lastUpdated: null,
  isConnected: false,
  error: null,
  events: [],
  shouldRefetch: false,
};

const encountersRealTimeSlice = createSlice({
  name: 'encountersRealTime',
  initialState,
  reducers: {
    setEncounters: (state, action: PayloadAction<PendingEncounter[]>) => {
      state.encounters = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addEncounter: (state, action: PayloadAction<PendingEncounter>) => {
      state.encounters.unshift({ ...action.payload, isNew: true });
      state.lastUpdated = new Date().toISOString();
    },
    updateEncounter: (state, action: PayloadAction<PendingEncounter>) => {
      const index = state.encounters.findIndex(enc => enc.id === action.payload.id);
      if (index !== -1) {
        state.encounters[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeEncounter: (state, action: PayloadAction<string>) => {
      state.encounters = state.encounters.filter(enc => enc.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    addEncounterEvent: (state, action: PayloadAction<EncounterEvent>) => {
      state.events.unshift(action.payload);
      // Keep only last 50 events to prevent memory issues
      if (state.events.length > 50) {
        state.events = state.events.slice(0, 50);
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEvents: (state) => {
      state.events = [];
    },
    triggerRefetch: (state) => {
      state.shouldRefetch = true;
    },
    resetRefetchFlag: (state) => {
      state.shouldRefetch = false;
    },
    setTodayCount: (state, action: PayloadAction<number>) => {
      state.todayCount = action.payload;
    },
    incrementTodayCount: (state) => {
      state.todayCount += 1;
    },
    decrementTodayCount: (state) => {
      state.todayCount = Math.max(0, state.todayCount - 1);
    },
  },
});

export const {
  setEncounters,
  addEncounter,
  updateEncounter,
  removeEncounter,
  addEncounterEvent,
  setConnectionStatus,
  setError,
  clearError,
  clearEvents,
  triggerRefetch,
  resetRefetchFlag,
  setTodayCount,
  incrementTodayCount,
  decrementTodayCount,
} = encountersRealTimeSlice.actions;

export default encountersRealTimeSlice.reducer;
