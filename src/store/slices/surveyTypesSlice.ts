import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SurveyType } from './surveyTypeSlice';

const initialState: SurveyType[] = [];

export const surveyTypesSlice = createSlice({
  name: 'surveyTypes',
  initialState,
  reducers: {
    setSurveyTypes: (state, action: PayloadAction<SurveyType[]>) => {
      return action.payload;
    },
    removeSurveyTypeByIndex: (state, action: PayloadAction<number | null>) => {
      if (typeof action.payload !== 'number') {
        return state;
      }

      if (action.payload >= 0 && action.payload < state.length) {
        state.splice(action.payload, 1);
      }
    },
  },
});

export const { setSurveyTypes, removeSurveyTypeByIndex } = surveyTypesSlice.actions;

export default surveyTypesSlice.reducer;
