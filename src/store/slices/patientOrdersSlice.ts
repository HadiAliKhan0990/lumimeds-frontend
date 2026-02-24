import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '@/store/slices/orderSlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Order[];
  meta?: SortState['meta'];
  latestOrdersPerSubscription?: {
    data: Order[];
    meta: SortState['meta'];
  };
}

const initialState: State = {};

export const patientOrdersSlice = createSlice({
  name: 'patientOrders',
  initialState,
  reducers: {
    setOrdersData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setOrders: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    setLatestOrdersPerSubscription: (state, action: PayloadAction<State['latestOrdersPerSubscription']>) => {
      state.latestOrdersPerSubscription = action.payload;
    },
    clearLatestOrdersPerSubscription: (state) => {
      state.latestOrdersPerSubscription = undefined;
    },
    clearPatientOrders: () => initialState,
    appendPatientOrdersData: (state, action: PayloadAction<State>) => {
      if (state.data) {
        const existingIds = new Set(state.data.map((order) => order.id));

        const uniqueNewOrders = (action.payload.data || []).filter((order) => !existingIds.has(order.id));

        state.data = [...state.data, ...uniqueNewOrders];
        state.meta = action.payload.meta;
      } else {
        Object.assign(state, action.payload);
      }
    },
  },
});

export const { setOrders, setMetaData, setOrdersData, clearPatientOrders, appendPatientOrdersData, setLatestOrdersPerSubscription, clearLatestOrdersPerSubscription } =
  patientOrdersSlice.actions;

export default patientOrdersSlice.reducer;
