import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SurveyQuestion } from './surveyQuestionSlice';
import { loadSync, queueEncryptedSave } from '@/lib/encryptedStorage';
import { SURVEY_QUESTIONS } from '@/constants/intakeSurvey';

const initialState: SurveyQuestion[] = loadSync<SurveyQuestion[]>(SURVEY_QUESTIONS) || [];

export const surveyQuestionsSlice = createSlice({
  name: 'surveyQuestions',
  initialState,
  reducers: {
    setSurveyQuestions: (state, action: PayloadAction<SurveyQuestion[]>) => {
      queueEncryptedSave(SURVEY_QUESTIONS, action.payload);
      return action.payload;
    },
  },
});

export const { setSurveyQuestions } = surveyQuestionsSlice.actions;

export default surveyQuestionsSlice.reducer;
