import { Response } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';

export interface AcceptProviderSurveyInvitationResponse extends Response {
  data: {
    message: string;
    surveyId: string;
  };
}

export type LicenseQuestionAnswer = {
  state: string;
  expiryDate: Date | null;
  licenseNumber: string;
};

export type ProviderSurveyFormValues = {
  [key: string]: string | string[] | Date | LicenseQuestionAnswer[] | undefined;
};

export interface GetProviderSurveyByIdResponse extends Response {
  data: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdById: string;
    typeId: string;
    questions: SurveyQuestion[];
    isSystemGenerated: boolean;
    createdAt: string;
    updatedAt: string;
    surveyToken: string | null;
  };
}

export type GetProviderSurveyByIdPayload = {
  surveyIdFromInvite: string;
  token: string;
  email: string | null;
};
