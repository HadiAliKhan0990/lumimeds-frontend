import { QuestionType } from '@/lib/enums';
import { PatientSurveyValidationType } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MultiInput {
  placeholder: string;
  fieldType: string;
  fieldName?: string; // Unique identifier for this input field (e.g., "weight", "height")
  mapping?: {
    field: string | null;
    jsonKey?: string | null;
  } | null;
}

export interface SurveyQuestion {
  id?: string | null;
  options?: string[] | null;
  questionText?: string | null;
  questionType?: QuestionType | null;
  isRequired?: boolean | null;
  isHighlighted?: boolean | null;
  description?: string | null;
  position?: number | null;
  isNew?: boolean | null;
  validation?: PatientSurveyValidationType | null;
  isDefault?: boolean;
  validationRules?: {
    max?: number;
    min?: number;
  };
  metaData?: {
    isSignature?: boolean;
    nextByAnswer?: Record<string, number>;
    previous?: number;
  };
  mapping?: {
    type: string;
    model: string;
    field: string | null;
    tag: string | null;
    isMultiInput?: boolean; // Flag to indicate this question uses multiInputs array for mapping
  };
  multiInputs?: MultiInput[] | null;
}

const initialState: SurveyQuestion = {
  id: null,
  options: null,
  questionText: null,
  questionType: null,
  isRequired: null,
  isHighlighted: null,
  description: null,
  position: null,
  isNew: null,
  validationRules: {},
};

export const surveyQuestionSlice = createSlice({
  name: 'surveyQuestion',
  initialState,
  reducers: {
    setSurveyQuestion: (state, action: PayloadAction<SurveyQuestion>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setSurveyQuestion } = surveyQuestionSlice.actions;

export default surveyQuestionSlice.reducer;
