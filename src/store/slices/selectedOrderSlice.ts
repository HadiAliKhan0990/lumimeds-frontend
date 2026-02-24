import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from './orderSlice';

interface SelectedOrderState {
  selectedOrderId: string | null;
  orderData: Order | null;
}

const initialState: SelectedOrderState = {
  selectedOrderId: null,
  orderData: null,
};

export const selectedOrderSlice = createSlice({
  name: 'selectedOrder',
  initialState,
  reducers: {
    setSelectedOrderId: (state, action: PayloadAction<string>) => {
      state.selectedOrderId = action.payload;
    },
    setOrderData: (state, action: PayloadAction<Order | null>) => {
      state.orderData = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrderId = null;
      state.orderData = null;
    },
  },
});

export const { setSelectedOrderId, setOrderData, clearSelectedOrder } = selectedOrderSlice.actions;

export default selectedOrderSlice.reducer;
