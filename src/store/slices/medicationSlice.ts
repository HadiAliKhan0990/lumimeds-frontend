import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pharmacy } from './pharmacySlice';
import { ProductType } from './productTypeSlice';
import { User } from './userSlice';

export interface Medication {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  dosage?: string | null;
  productType?: ProductType | null;
  pharmacy?: Pharmacy | null;
  createdBy?: User | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  medicationType?: 'Medications' | 'Products' | 'Medicine Types' | 'Product Types';
}

const initialState: Medication = {
  id: null,
  name: null,
  description: null,
  dosage: null,
  productType: null,
  pharmacy: null,
  createdBy: null,
  createdAt: null,
  updatedAt: null,
  medicationType: 'Products',
};

export const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    setMedication: (state, action: PayloadAction<Medication>) => {
      return action.payload;
    },
    setMedicationType: (state, action) => {
      state.medicationType = action.payload;
    },
  },
});

export const { setMedication, setMedicationType } = medicationSlice.actions;

export default medicationSlice.reducer;
