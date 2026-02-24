import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { DashboardStates, setDashboardStates } from '@/store/slices/dashboardSlice';

interface Response {
  success: string | null;
  message: string | null;
  statusCode: number;
}

interface DashboardStatesResponse extends Response {
  data: DashboardStates;
}

export type DashboardStatesMetaParams = {
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  previousPeriodStart?: string;
  previousPeriodEnd?: string;
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Dashboard States'],
  endpoints: (builder) => ({
    getDashboardStates: builder.query<DashboardStatesResponse['data'], DashboardStatesMetaParams | void>({
      query: (params) => ({
        url: `/dashboard`,
        method: 'GET',
        params,
      }),
      transformResponse: (response: DashboardStatesResponse) => response.data,
      providesTags: ['Dashboard States'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setDashboardStates(result.data));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
  }),
});

export const { useGetDashboardStatesQuery } = dashboardApi;
