import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApprovedRxOrder } from './ordersApiSlice';

interface State {
  data?: ApprovedRxOrder[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    todayCount?: number;
  };
}

const initialState: State = {};

export const approvedRxSlice = createSlice({
  name: 'approvedRx',
  initialState,
  reducers: {
    setApprovedRxData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setApprovedRxOrders: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setApprovedRxMeta: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    appendApprovedRxData: (state, action: PayloadAction<State>) => {
      if (state.data) {
        const existingIds = new Set(state.data.map((order) => order.uniqueOrderId));
        const uniqueNewOrders = (action.payload.data || []).filter(
          (order) => !existingIds.has(order.uniqueOrderId)
        );
        state.data = [...state.data, ...uniqueNewOrders];
      } else {
        state.data = action.payload.data;
      }
      state.meta = action.payload.meta;
    },
  },
});

export const { 
  setApprovedRxData, 
  setApprovedRxOrders, 
  setApprovedRxMeta, 
  appendApprovedRxData 
} = approvedRxSlice.actions;

export default approvedRxSlice.reducer;
