import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/store/slices/userSlice';
import { SurveyType } from '@/store/slices/surveyTypeSlice';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';

export interface Survey {
  id?: string | null;
  name?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  createdBy?: User | null;
  totalResponses?: number | null;
  type?: SurveyType | null;
  hasUnsavedChanges?: boolean | null;
  isSystemGenerated?: boolean;
  questions?: SurveyQuestion[];
  surveyPublicUrl?: string;
  surveyName?: string;
}

const initialState: Survey = {
  id: null,
  name: null,
  isActive: null,
  createdAt: null,
  createdBy: null,
  totalResponses: null,
  type: null,
  hasUnsavedChanges: null,
};

export const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    setSurvey: (state, action: PayloadAction<Survey>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSurvey } = surveySlice.actions;

export default surveySlice.reducer;
