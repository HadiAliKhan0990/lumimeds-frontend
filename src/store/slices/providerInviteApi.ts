import { LicenseQuestionAnswer } from '@/services/providerIntake/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ProviderSurveyAnswerType = {
  questionId?: string;
  answer?: string | string[] | Date | LicenseQuestionAnswer[];
  isRequired?: boolean | null;
};

export type ProviderSurveyPayloadType = {
  email: string;
  token: string;
  answers: ProviderSurveyAnswerType[];
  surveyId: string;
};

export const providerInviteApi = createApi({
  reducerPath: 'providerInviteApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }), // or your static API base
  endpoints: (builder) => ({
    acceptInvitation: builder.query<{ data: { surveyId: string } }, string>({
      query: (token) => ({
        url: `/providers/accept-invitation`,
        method: 'GET',
        params: { token },
      }),
    }),
    getProviderSurveyById: builder.query({
      query: ({
        surveyIdFromInvite,
        token,
        email,
      }: {
        surveyIdFromInvite: string;
        token: string;
        email: string | null;
      }) => ({
        url: `/providers/survey/${surveyIdFromInvite}`,
        method: 'GET',
        params: { token, email },
      }),
    }),
    submitSurvey: builder.mutation<void, ProviderSurveyPayloadType>({
      query: ({ email, token, answers, surveyId }) => ({
        url: `/providers/survey/${surveyId}/submit`,
        method: 'POST',
        body: { email, token, answers },
      }),
    }),
  }),
});

export const { useSubmitSurveyMutation, useLazyAcceptInvitationQuery, useLazyGetProviderSurveyByIdQuery } = providerInviteApi;

