import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CalendlyStatus {
  authorized: boolean;
  tokenExpired: boolean;
  connectedAt: string;
  selectedEventTypeUri: string | null;
  hasConsultationEvent: boolean;
}

export interface CalendlyState {
  status: CalendlyStatus;
  isLoaded: boolean; // Track if we have loaded data from API
  isLoading: boolean;
}

const initialState: CalendlyState = {
  status: {
    authorized: false,
    tokenExpired: false,
    connectedAt: '',
    selectedEventTypeUri: null,
    hasConsultationEvent: false,
  },
  isLoaded: false, // Initially not loaded
  isLoading: false,
};

const calendlySlice = createSlice({
  name: 'calendly',
  initialState,
  reducers: {
    setCalendlyStatus: (state, action: PayloadAction<CalendlyStatus>) => {
      state.status = action.payload;
      state.isLoaded = true;
    },
    updateCalendlyStatus: (state, action: PayloadAction<Partial<CalendlyStatus>>) => {
      state.status = { ...state.status, ...action.payload };
      state.isLoaded = true;
    },
    clearCalendlyStatus: (state) => {
      state.status = initialState.status;
      state.isLoaded = false;
    },
    setCalendlyLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCalendlyStatus, updateCalendlyStatus, clearCalendlyStatus, setCalendlyLoading } = calendlySlice.actions;

export default calendlySlice.reducer;
