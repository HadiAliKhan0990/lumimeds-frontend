import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from './orderSlice';
import { SinglePatient } from '@/lib/types';

export interface Address {
  firstName?: string;
  lastName?: string;
  street: string;
  street2?: string;
  city: string;
  region: string;
  zip: string;
  state: string;
}

export interface PatientAddress {
  billingAddress: Address;
  shippingAddress: Address;
}

export interface Patient extends Omit<SinglePatient, 'address'> {
  firstName?: string | null;
  lastName?: string | null;
  id?: string | null;
  orders?: Order[];
  email?: string | null;
  dob?: string | null;
  createdAt?: string | null;
  address?: PatientAddress | null;
  gender?: string;
  state?: string;
  status?: string | null;
  previousStatus?: string | null;
  userId?: string | null;
  customerId?: string | null;
  isBanned?: boolean;
  banReason?: string | null;
}

const initialState: Patient = {
  firstName: null,
  lastName: null,
  email: null,
  dob: null,
  id: null,
  createdAt: null,
  orders: [],
  previousStatus: null,
};

export const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setPatient: (state, action: PayloadAction<Patient>) => {
      Object.assign(state, action.payload);
    },
    clearPatient: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setPatient, clearPatient } = patientSlice.actions;

export default patientSlice.reducer;
