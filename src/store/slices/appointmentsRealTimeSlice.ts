import { IPendingrxPatientListInfo } from '@/types/appointment';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppointmentEvent {
  type: 'created' | 'updated' | 'cancelled' | 'rescheduled' | 'assigned' | 'completed';
  appointment: IPendingrxPatientListInfo;
  timestamp: string;
}

export interface AppointmentsRealTimeState {
  appointments: IPendingrxPatientListInfo[];
  todayCount: number;
  lastUpdated: string | null;
  isConnected: boolean;
  error: string | null;
  events: AppointmentEvent[];
  shouldRefetch: boolean;
}

const initialState: AppointmentsRealTimeState = {
  appointments: [],
  todayCount: 0,
  lastUpdated: null,
  isConnected: false,
  error: null,
  events: [],
  shouldRefetch: false,
};

const appointmentsRealTimeSlice = createSlice({
  name: 'appointmentsRealTime',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<IPendingrxPatientListInfo[]>) => {
      // Use Map for O(1) lookup to ensure uniqueness by ID
      const uniqueMap = new Map<string | number, IPendingrxPatientListInfo>();
      action.payload.forEach((item) => {
        if (item.id && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      const uniqueAppointments = Array.from(uniqueMap.values());

      // Replace the entire array with deduplicated data
      state.appointments = uniqueAppointments;
      state.lastUpdated = new Date().toISOString();
    },
    addAppointment: (state, action: PayloadAction<IPendingrxPatientListInfo>) => {
      // Skip if no ID
      if (!action.payload.id) return;

      // Check for duplicates by ID
      const exists = state.appointments.some((apt) => apt.id === action.payload.id);
      if (!exists) {
        state.appointments.unshift(action.payload);
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateAppointment: (state, action: PayloadAction<IPendingrxPatientListInfo>) => {
      // Skip if no ID
      if (!action.payload.id) return;

      const index = state.appointments.findIndex((apt) => apt.id === action.payload.id);
      if (index !== -1) {
        // Update existing appointment
        state.appointments[index] = action.payload;
      } else {
        const exists = state.appointments.some((apt) => apt.id === action.payload.id);
        if (!exists) {
          state.appointments.unshift(action.payload);
        }
      }
      state.lastUpdated = new Date().toISOString();
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter((apt) => apt.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    addAppointmentEvent: (state, action: PayloadAction<AppointmentEvent>) => {
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
  setAppointments,
  addAppointment,
  updateAppointment,
  removeAppointment,
  addAppointmentEvent,
  setConnectionStatus,
  setError,
  clearError,
  clearEvents,
  triggerRefetch,
  resetRefetchFlag,
  setTodayCount,
  incrementTodayCount,
  decrementTodayCount,
} = appointmentsRealTimeSlice.actions;

export default appointmentsRealTimeSlice.reducer;
