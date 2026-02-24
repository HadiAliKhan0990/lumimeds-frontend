import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveSubscriptionType } from '@/store/slices/patientAtiveSubscriptionSlice';

type InitialState = {
  selectedPatientActiveSubscription?: ActiveSubscriptionType;
  subscriptionModalOpenType?: 'pause' | 'cancel' | 'resume' | 'cancellation-reason';
  isLoading: boolean;
};

const initialState: InitialState = {
  isLoading: false,
};

export const patientSubscriptionSlice = createSlice({
  name: 'patientSubscription',
  initialState,
  reducers: {
    setSelectedPatientActiveSubscription: (
      state,
      action: PayloadAction<InitialState['selectedPatientActiveSubscription']>
    ) => {
      state.selectedPatientActiveSubscription = action.payload;
    },
    setSubscriptionModalOpenType: (state, action: PayloadAction<InitialState['subscriptionModalOpenType']>) => {
      state.subscriptionModalOpenType = action.payload;
    },
    setPatientSubscriptionLoading: (state, action: PayloadAction<InitialState['isLoading']>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSelectedPatientActiveSubscription, setSubscriptionModalOpenType, setPatientSubscriptionLoading } =
  patientSubscriptionSlice.actions;

export default patientSubscriptionSlice.reducer;
