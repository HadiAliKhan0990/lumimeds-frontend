import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PatientSurveyResponseType } from '@/lib/types';

export interface SurveyResponse {
  id?: string | null;
  patientId?: string | null;
  patientName?: string | null;
  patientEmail?: string | null;
  patientPhone?: string | null;
  isCompleted?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  responses?: PatientSurveyResponseType[];
  name?: string;
  submittedByType?: string;
  submittedByEmail?: string;
  submittedById?: string;
  submittedByName?: string;
  submittedByPhone?: string;
}

const initialState: SurveyResponse = {
  id: null,
  patientId: null,
  patientName: null,
  isCompleted: null,
  createdAt: null,
  updatedAt: null,
  patientEmail: null,
  patientPhone: null,
  responses: [],
};

export const surveyResponse = createSlice({
  name: 'surveyResponse',
  initialState,
  reducers: {
    setSurveyResponse: (state, action: PayloadAction<SurveyResponse>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSurveyResponse } = surveyResponse.actions;

export default surveyResponse.reducer;
