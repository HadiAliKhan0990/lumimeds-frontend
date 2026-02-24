import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient } from './patientSlice';

export interface Invoice {
  id?: string | null;
  invoiceNumber?: number | null;
  status?: string | null;
  amountPaid?: string;
  amount?: string;
  dueDate?: string | null;
  invoiceCreationDate?: string | null;
  paymentDate?: string | null;
  billingReason?: string | null;
  billingPeriodStartDate?: string | null;
  billingPeriodEndDate?: string | null;
  createdAt?: string | null;
  patient?: Patient | null;
  invoicePdfUrl?: string;
  description?: string;
  paymentMethod?: string;
  subtotal?: string | number;
  paidWith?: string;
  discountAmount?: string | number;
}

const initialState = {};

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setInvoice: (state, action: PayloadAction<Invoice>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setInvoice } = invoiceSlice.actions;

export default invoiceSlice.reducer;
