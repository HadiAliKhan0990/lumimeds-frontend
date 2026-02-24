import { createSlice } from '@reduxjs/toolkit';
import { PROCESS_APIS } from '@/lib/types';
import { Order } from '@/store/slices/orderSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export interface PaymentOrder {
  processWith?: PROCESS_APIS;
  serviceProvider?: PROCESS_APIS | string;
  selectedOrder?: Order;
  selectedDoctorId?: string;
}

const initialState: PaymentOrder = {
  serviceProvider: '',
};

export const orderPaymentSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setProcessWith: (state, action) => {
      state.processWith = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    setServiceProvider: (state, action) => {
      state.serviceProvider = action.payload;
    },
    setSelectedDoctorId: (state, action) => {
      state.selectedDoctorId = action.payload;
    },
  },
});

export const { setProcessWith, setSelectedOrder, setSelectedDoctorId } = orderPaymentSlice.actions;

export default orderPaymentSlice.reducer;

export const useProcessWith = () => useSelector((state: RootState) => state.orderPayment.processWith);
export const useSelectedOrder = () => useSelector((state: RootState) => state.orderPayment.selectedOrder);
export const useServiceProvider = () => useSelector((state: RootState) => state.orderPayment.serviceProvider);
export const useSelectedDoctorId = () => useSelector((state: RootState) => state.orderPayment.selectedDoctorId);
