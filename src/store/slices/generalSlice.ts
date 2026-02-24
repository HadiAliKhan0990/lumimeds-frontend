import { createSlice } from '@reduxjs/toolkit';

interface General {
  isSidebarOpen: boolean;
}

const initialState: General = {
  isSidebarOpen: false,
};

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setSidebarOpen } = generalSlice.actions;

export default generalSlice.reducer;
