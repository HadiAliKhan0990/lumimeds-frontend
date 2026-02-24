import { createSlice } from '@reduxjs/toolkit';

export interface SurveyResponsePopup {
  showResponses: boolean;
}

const initialState: SurveyResponsePopup = {
  showResponses: false,
};

export const surveyResponsePopup = createSlice({
  name: 'surveyResponsePopup',
  initialState,
  reducers: {
    setShowResponses: (state, action) => {
      state.showResponses = action.payload;
    },
  },
});

export const { setShowResponses } = surveyResponsePopup.actions;

export default surveyResponsePopup.reducer;
