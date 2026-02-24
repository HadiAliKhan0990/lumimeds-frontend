import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SurveyType {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  type?: string | null;
  isDefault?: boolean;
}

const initialState: SurveyType = {
  id: null,
  name: null,
  description: null,
  isActive: null,
  createdAt: null,
  updatedAt: null,
};

export const surveyTypeSlice = createSlice({
  name: 'surveyType',
  initialState,
  reducers: {
    setSurveyType: (state, action: PayloadAction<SurveyType | undefined>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSurveyType } = surveyTypeSlice.actions;

export default surveyTypeSlice.reducer;
