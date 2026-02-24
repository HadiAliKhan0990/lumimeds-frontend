import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  isPaymentMethodSuccess: boolean;
}

const initialState: State = {
  isPaymentMethodSuccess: false,
};

export const patientAccountSlice = createSlice({
  name: 'patientAccount',
  initialState,
  reducers: {
    setAccountData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setPaymentMethodSuccess: (state, action: PayloadAction<State['isPaymentMethodSuccess']>) => {
      state.isPaymentMethodSuccess = action.payload;
    },
  },
});

export const { setAccountData, setPaymentMethodSuccess } = patientAccountSlice.actions;

export default patientAccountSlice.reducer;
