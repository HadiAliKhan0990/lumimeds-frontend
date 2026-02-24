import { createSlice } from '@reduxjs/toolkit';
import { Patient } from '@/store/slices/patientSlice';

const initialState: Patient[] = [];

export const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setPatients: (state, action) => {
      return action.payload;
    },
  },
});

export const { setPatients } = patientsSlice.actions;

export default patientsSlice.reducer;
