import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

interface StatusUpdateResponse extends Response {
  data?: {
    id: string;
    status: string;
  };
}

export type SendPatientPayload = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  optIn: boolean;
};

export type SendPatientEmailConsentPayload = {
  email: string;
  optIn: boolean;
  bmi?: boolean;
};

export const hubspotApi = createApi({
  reducerPath: 'hubspotApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    sendPatientToHubspot: builder.mutation<StatusUpdateResponse, SendPatientPayload>({
      query: (data) => ({
        url: '/hubspot/contact',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),
    sendPatientEmailConsentToHubspot: builder.mutation<Response, SendPatientEmailConsentPayload>({
      query: (data) => ({
        url: '/hubspot/contact/email-consent',
        method: 'POST',
        data,
        skipAuth: true,
      }),
    }),
  }),
});

export const { useSendPatientToHubspotMutation, useSendPatientEmailConsentToHubspotMutation } = hubspotApi;
