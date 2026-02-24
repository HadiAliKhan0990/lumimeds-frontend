import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subscription } from '@/store/slices/subscriptionSlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Subscription[];
  meta?: SortState['meta'];
}

const initialState: State = {};

export const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptionsData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    appendSubscriptionsData: (state, action: PayloadAction<State>) => {
          if (state.data) {
            const existingIds = new Set(state.data.map((subscription) => subscription.id));
    
            const uniqueNewSubscriptions = (action.payload.data || []).filter((subscription) => !existingIds.has(subscription.id));
    
            // Only append truly unique orders
            state.data = [...state.data, ...uniqueNewSubscriptions];
          } else {
            // If no existing data, just set the new data
            state.data = action.payload.data;
          }
    
          state.meta = action.payload.meta;
    },
  },
});

export const { setSubscriptions, setMetaData, setSubscriptionsData, appendSubscriptionsData } =
  subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
