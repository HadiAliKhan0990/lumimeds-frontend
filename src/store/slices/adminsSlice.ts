import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminUserType } from '@/store/slices/adminApiSlice';

interface State {
  data: AdminUserType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: State = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 30,
    totalPages: 0,
  },
};

export const adminsSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {
    setAdmins: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setAdminsData: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setAdminsMeta: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
    appendAdmins: (state, action: PayloadAction<State['data']>) => {
      if (!state.data) {
        state.data = action.payload || [];
      } else if (action.payload) {
        const existingIds = new Set(state.data.map((d) => d.id));
        const newAdmins = action.payload.filter((d) => !existingIds.has(d.id));
        state.data = [...state.data, ...newAdmins];
      }
    },
  },
});

export const { setAdmins, setAdminsData, setAdminsMeta, appendAdmins } = adminsSlice.actions;

export default adminsSlice.reducer;
