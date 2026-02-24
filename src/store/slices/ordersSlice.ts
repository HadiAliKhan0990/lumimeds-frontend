import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '@/store/slices/orderSlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Order[];
  meta?: SortState['meta'];
  statusCounts?: {
    all: number;
    new: number;
    pending: number;
    onHold: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
    completed: number;
    processing: number;
  };
}

const initialState: State = {};

export const ordersSlice = createSlice({
  name: 'orders',
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
    setStatusCounts: (state, action: PayloadAction<State['statusCounts']>) => {
      state.statusCounts = action.payload;
    },
    appendOrdersData: (state, action: PayloadAction<State>) => {
      if (state.data) {
        const existingIds = new Set(state.data.map((order) => order.id));

        const uniqueNewOrders = (action.payload.data || []).filter((order) => !existingIds.has(order.id));

        // Only append truly unique orders
        if (uniqueNewOrders.length > 0) {
          state.data.push(...uniqueNewOrders);
        }
      } else {
        // If no existing data, just set the new data
        state.data = action.payload.data;
      }

      state.meta = action.payload.meta;
      // Don't forget to update statusCounts if you're using it
      if (action.payload.statusCounts) {
        state.statusCounts = action.payload.statusCounts;
      }
    },
    updateSingleOrder: (state, action: PayloadAction<Order>) => {
      if (state.data) {
        const index = state.data.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }
      }
    },
  },
});

export const { setOrders, setMetaData, setOrdersData, setStatusCounts, appendOrdersData, updateSingleOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;
