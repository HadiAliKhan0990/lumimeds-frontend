import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: boolean = false;

export const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {
    setPopup: (state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export const { setPopup } = popupSlice.actions;

export default popupSlice.reducer;
