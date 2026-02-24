import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Medication } from '@/store/slices/medicationSlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Medication[];
  meta?: SortState['meta'];
}

const initialState: State = {};

export const medicationsSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    setMedicationsData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setMedications: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
  },
});

export const { setMedications, setMedicationsData, setMetaData } = medicationsSlice.actions;

export default medicationsSlice.reducer;
