import { FormattedSurveyResponse } from '@/store/slices/refillsApiSlice';

export interface ResponseRendererProps {
  response: FormattedSurveyResponse;
  variant?: 'admin' | 'patient';
  className?: string;
}

export interface TextResponseProps {
  response: FormattedSurveyResponse;
  variant?: 'admin' | 'patient';
}

export interface ChoiceResponseProps {
  response: Extract<FormattedSurveyResponse, { options: unknown }>;
  variant?: 'admin' | 'patient';
  type: 'single' | 'multiple';
}

export interface JSONRendererProps {
  data: object;
  variant?: 'admin' | 'patient';
}

export type ResponseListProps = {
  responses: FormattedSurveyResponse[];
  variant?: 'admin' | 'patient';
  productName?: string;
  emptyMessage?: string;
};
