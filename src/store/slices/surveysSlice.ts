import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Survey } from '@/store/slices/surveySlice';
import { SortState } from '@/store/slices/sortSlice';

interface State {
  data?: Survey[];
  meta?: SortState['meta'];
}

const initialState: State = {};

export const surveysSlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {
    setSurveysData: (state, action: PayloadAction<State>) => {
      Object.assign(state, action.payload);
    },
    setSurveys: (state, action: PayloadAction<State['data']>) => {
      state.data = action.payload;
    },
    setMetaData: (state, action: PayloadAction<State['meta']>) => {
      state.meta = action.payload;
    },
  },
});

export const { setSurveysData, setSurveys, setMetaData } = surveysSlice.actions;

export default surveysSlice.reducer;
