import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortState } from '@/store/slices/sortSlice';
import { PendingSurvey } from '@/store/slices/surveysApiSlice';

interface State {
  globalPending: {
    data?: PendingSurvey[];
    meta?: SortState['meta'];
  };
}

const initialState: State = {
  globalPending: {},
};

export const patientSurveysSlice = createSlice({
  name: 'patientSurveys',
  initialState,
  reducers: {
    setGlobalPendingSurveysData: (state, action: PayloadAction<State['globalPending']>) => {
      state.globalPending = action.payload;
    },
    setGlobalPendingSurveysTotal: (state, action: PayloadAction<number>) => {
      if (state.globalPending.meta) {
        state.globalPending.meta.total = action.payload;
      }
    },
  },
});

export const { setGlobalPendingSurveysData, setGlobalPendingSurveysTotal } = patientSurveysSlice.actions;

export default patientSurveysSlice.reducer;
