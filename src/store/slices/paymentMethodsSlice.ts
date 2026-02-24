import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentMethod = {
  id: string;
  brand: string;
  last_four_digits: string;
  expiry: string;
};

const initialState: PaymentMethod[] = [];

export const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      return action.payload;
    },
  },
});

export const { setPaymentMethods } = paymentMethodsSlice.actions;

export default paymentMethodsSlice.reducer;
