import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Subscription {
  id?: string | null;
  subscriptionId?: string | null;
  status?:
    | 'cancel_scheduled'
    | 'pause_scheduled'
    | 'update_scheduled'
    | 'renewal_in_progress'
    | 'paused'
    | 'canceled'
    | 'active'
    | null;
  patientName?: string | null;
  productName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextPaymentDate?: string | null;
  orderCount?: number | null;
  cancellationReason?: string | null;
  rating?: number | null;
  canceledById?: string | null;
  canceledByName?: string | null;
  canceledByRole?: string | null;
  resumesAt?: string | null;
}

const initialState: Subscription = {};

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSubscription } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
