import { createApi } from '@reduxjs/toolkit/query/react';
import { User, setUser } from '@/store/slices/userSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { LoginPayload, ProfileResponse, ResetPasswordValues, Response } from '@/lib/types';
import { PatientProfile, setPatientProfile } from '@/store/slices/patientProfileSlice';
import { SingleSurveyResponse } from '@/store/slices/surveysApiSlice';
import { SummaryProductType } from '@/store/slices/productTypesApiSlice';
import { AnswersResponse } from '@/store/slices/checkoutApiSlice';

export interface UserResponse extends Response {
  data: User;
}

export interface ProfileUserResponse extends Response {
  data: ProfileResponse;
}

export interface PatientProfileResponse extends Response {
  data: PatientProfile;
}

export interface OneTimeToSubscriptionEligibilityResponse extends Response {
  data: {
    isEligible: boolean;
  };
}

export interface LoginResponse extends Response {
  data: {
    message: string;
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
    isFirstLogin?: boolean;
  };
}

export interface PatientLoginErrorResponse {
  status: number;
  data: {
    data: {
      token?: string;
      submission?: {
        pendingSubmission: {
          id: string;
          surveyId: string;
          survey: SingleSurveyResponse['data'];
          submittedById: string;
          submittedByType: string;
          responses: AnswersResponse[];
          isCompleted: boolean;
          createdAt: string;
          updatedAt: string;
          surveyUrl: string | null;
          submittedByEmail: string;
        };
        product: SummaryProductType | null;
      };
    };
  };
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User', 'ProviderUser', 'PatientUser'],
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse['data'], void>({
      query: () => ({
        url: `/admin/profile`,
      }),
      providesTags: ['User'],
      transformResponse: (res: UserResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setUser(result.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation<UserResponse, User>({
      query: (data) => ({
        url: '/admin/profile',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['User'],
    }),
    getProviderProfile: builder.query<ProfileUserResponse['data'], void>({
      query: () => ({
        url: `/providers/profile`,
      }),
      providesTags: ['ProviderUser'],
      transformResponse: (res: ProfileUserResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setUser({ ...result.data, role: 'provider' }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateProviderProfile: builder.mutation<UserResponse, User>({
      query: (data) => ({
        url: '/providers/profile',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['ProviderUser'],
    }),
    getPatientProfile: builder.query<PatientProfileResponse['data'], void>({
      query: () => ({
        url: `/patients/profile`,
      }),
      providesTags: ['PatientUser'],
      transformResponse: (res: PatientProfileResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setPatientProfile(result.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updatePatientProfile: builder.mutation<Response, Partial<User> | FormData>({
      query: (data: User) => ({
        url: '/patients/profile',
        method: 'PATCH',
        data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data: { email: string; role: string }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: ResetPasswordValues) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data,
      }),
    }),
    loginUser: builder.mutation<LoginResponse, LoginPayload>({
      query: ({ email, password, role }) => ({
        url: '/auth/login',
        method: 'POST',
        data: { email, password, role },
        skipAuth: true,
      }),
    }),
    getFileUrl: builder.query<{ url: string }, string>({
      query: (key) => ({
        url: '/surveys/file-url',
        params: { key },
      }),
    }),
    updateProviderAvailability: builder.mutation<Response, { providerId: string; isAvailable: boolean }>({
      query: (data) => ({
        url: '/providers/is-available',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['ProviderUser'],
    }),
    checkOneTimeToSubscriptionEligibility: builder.query<OneTimeToSubscriptionEligibilityResponse['data'], void>({
      query: () => ({
        url: '/patients/glp1-gip-starter-to-subscription-eligibility',
      }),
      providesTags: ['PatientUser'],
      transformResponse: (res: OneTimeToSubscriptionEligibilityResponse) => res.data,
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProviderProfileMutation,
  useGetPatientProfileQuery,
  useLazyGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
  useLoginUserMutation,
  useGetFileUrlQuery,
  useUpdateProviderAvailabilityMutation,
  useLazyCheckOneTimeToSubscriptionEligibilityQuery,
} = userApi;
