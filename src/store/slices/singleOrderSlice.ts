import { SingleOrder } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SingleOrderState {
  order?: SingleOrder['order'];
  patient?: SingleOrder['patient'];
}

const initialState: SingleOrderState = {};

export const singleOrderSlice = createSlice({
  name: 'singleOrder',
  initialState,
  reducers: {
    setSingleOrder: (_state, action: PayloadAction<SingleOrderState>) => action.payload,
    setSinglePatientAllergies: (state, action: PayloadAction<string>) => {
      if (state.patient) {
        state.patient.medicalHistory.allergies = action.payload;
      }
    },
  },
});

export const { setSingleOrder, setSinglePatientAllergies } = singleOrderSlice.actions;

export default singleOrderSlice.reducer;
