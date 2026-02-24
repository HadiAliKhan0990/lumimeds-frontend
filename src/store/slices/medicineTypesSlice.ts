import { MedicineTypeData } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: MedicineTypeData = { medicineTypes: [], meta: { page: 1, limit: 30 } };

export const medicineTypes = createSlice({
  name: 'medicineTypes',
  initialState,
  reducers: {
    setMedicineTypesData: (state, action: PayloadAction<MedicineTypeData>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setMedicineTypesData } = medicineTypes.actions;

export default medicineTypes.reducer;
