import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortState } from '@/store/slices/sortSlice';
import { EnumdoctorGroup } from './pharmaciesApiSlice';

export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  npi: string;
  email: string;
  phone: string;
  deaNumber: string;
  address: string;
  state: string;
  default: boolean;
  zipCode: number;
  licenseNumber: number | null;
  spi?: string;
  group?: EnumdoctorGroup;
};

interface State {
  data?: Doctor[];
  meta?: SortState['meta'];
}

const initialState: State = {};

export const doctors = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctorsData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setDoctors: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    appendDoctors: (state, action: PayloadAction<State['data']>) => {
      if (!state.data) {
        state.data = action.payload || [];
      } else if (action.payload) {
        const existingIds = new Set(state.data.map((d) => d.id));
        const newDoctors = action.payload.filter((d) => !existingIds.has(d.id));
        state.data = [...state.data, ...newDoctors];
      }
    },
  },
});

export const { setDoctors, setDoctorsData, setMetaData, appendDoctors } = doctors.actions;

export default doctors.reducer;
