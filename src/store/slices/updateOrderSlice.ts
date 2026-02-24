import { SingleOrder } from '@/lib/types';
import { createSlice } from '@reduxjs/toolkit';

export interface UpdateOrder {
  dosage?: string;
  pharmacy?: string;
  order?: SingleOrder['order'];
}

const initialState: UpdateOrder = {};

export const updateOrderSlice = createSlice({
  name: 'updateOrder',
  initialState,
  reducers: {
    setDosage: (state, action) => {
      state.dosage = action.payload;
    },
    setPharmacy: (state, action) => {
      state.pharmacy = action.payload;
    },
    setUpdateOrder: (state, action) => {
      state.order = action.payload;
    },
  },
});

export const { setDosage, setPharmacy, setUpdateOrder } = updateOrderSlice.actions;

export default updateOrderSlice.reducer;
