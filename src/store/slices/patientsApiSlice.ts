import { createApi } from '@reduxjs/toolkit/query/react';
import { Patient, PatientAddress } from '@/store/slices/patientSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { setPatients } from '@/store/slices/patientsSlice';
import { Response, SinglePatient } from '@/lib/types';
import { setPatientNotes } from '@/store/slices/patientNotesSlice';
import { PatientNote } from '@/store/slices/patientNoteSlice';
import { setUserId } from '@/store/slices/chatSlice';
import { QuestionType } from '@/lib/enums';
import { PatientAppointment } from '@/types/patientAppointments';
import { ProductTypeFilter } from '@/types/approved';

export interface PatientsResponse extends Response {
  data: {
    patients: Patient[];
    statusCounts: {
      all: number;
      new: number;
      pending: number;
      onHold: number;
      confirmed: number;
      delivered: number;
      cancelled: number;
      completed: number;
      processing: number;
    };
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export type SelectedPatient = { userId?: string; orderId?: string } & SinglePatient;

export interface SinglePatientResponse extends Response {
  data: SelectedPatient;
}

export interface PatientSortQueryParams {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  meta?: {
    page: number;
    limit: number;
  };
  status?: string | null;
}

export interface PatientNotesResponse extends Response {
  data: {
    notes: PatientNote[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PatientNotesSortQueryParams {
  id: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortField?: string;
  isDeleted?: boolean;
  type?: 'Chart' | 'Patient';
}

export type PatientAddressData = Pick<Patient, 'address' | 'email'>;

export interface PatientNoteData extends Pick<PatientNote, 'title' | 'description'> {
  patientId: string;
  type?: 'Chart' | 'Patient';
}

// New type for patients with orders (appointments)
export interface PatientWithOrder {
  patientId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bio: {
    weight: number;
    heightFeet: string;
    heightInches: string;
  };
  orderId: string;
  product: string;
  status: string;
  dateReceived: string;
  scheduledAt?: string | null;
  assignedAt?: string;
  address: PatientAddress;
  visitType: string;
  reason?: string | null;
  meetingLink?: string;
  rescheduleLink?: string;
  declineLink?: string;
  createdAt?: string;
  type?: string;
}

export interface PatientsWithOrdersResponse extends Response {
  data: {
    appointments: PatientWithOrder[];
    todayCount: number;
  };
}

export type EditPatientNoteData = Pick<PatientNote, 'id' | 'title' | 'description'>;

export interface ArchivePatientNotesData {
  ids: string[];
  isDeleted: boolean;
}

// Query params for fetching a patient's appointments
export interface PatientAppointmentsQueryParams {
  search?: string;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  status?: string;
  sortField?: string;
  sortOrder?: string; // ASC | DESC
  page?: number;
  limit?: number;
}

export interface PatientAppointmentsDelineBody {
  appointmentId: string;
  reason: string;
}

export type AnswersResponse = {
  answer: string;
  position: number;
  isDefault: boolean;
  isRequired: boolean;
  questionId: string;
  validation: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  isHighlighted?: boolean;
};

export type CheckUserEmailResponse = {
  data?: {
    id: string;
    surveyId: string;
    submittedById: string;
    submittedByType: string;
    responses: AnswersResponse[];
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    surveyUrl: string | null;
    submittedByEmail: string;
  };
} & Response;

export type CheckUserEmailPayload = {
  email: string;
  surveyId: string;
};

// export type ProductTypeFilter = 'weight_loss' | 'longevity';

export type AppointmentsQueryParams = {
  search?: string;
  status?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'status' | 'firstName' | 'dateReceived';
  sortOrder?: 'asc' | 'desc';
  productType?: ProductTypeFilter;
};

export interface PatientAppointmentsRescheduleBody {
  appointmentId: string;
  newScheduledAt: string;
  newEndsAt: string;
  reason: string;
}

export interface PatientBmiHistory {
  bmi: number;
  name: string;
  role: string;
  timestamp: string;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
}

export type PatientBmiHistoryResponse = {
  success: boolean;
  message: string;
  data: PatientBmiHistory[];
};

export interface GeneratePasswordResponse extends Response {
  data: {
    password: string;
  };
}
export interface GenerateTrustpilotLink extends Response {
  data: {
    link: string;
  };
}

export interface PatientAppointmentsResponse extends Response {
  data: {
    appointments: PatientAppointment[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UpdatePatientStatusResponse extends Response {
  data: {
    id: string;
    status: string;
    previousStatus: string | null;
  };
}

export type UpdatePatientStatusPayload = {
  userId: string;
  status: string;
};

export const patientsApi = createApi({
  reducerPath: 'patientsApi',
  baseQuery: axiosBaseQuery(),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  tagTypes: ['Patients', 'Patient', 'Patient Notes', 'Patient Note', 'Appointments Patients'],
  endpoints: (builder) => ({
    getPatients: builder.query<PatientsResponse, PatientSortQueryParams>({
      query: ({ search, sortField, sortOrder, meta, status }: PatientSortQueryParams) => ({
        url: `/patients/list`,
        params: {
          search,
          sortField,
          sortOrder,
          status,
          page: meta?.page,
          limit: meta?.limit,
        },
      }),
      providesTags: ['Patients'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          const { patients } = result.data.data || {};
          dispatch(setPatients(patients));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getSinglePatient: builder.query<SinglePatientResponse['data'], string>({
      query: (id) => ({
        url: `/patients/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
      transformResponse: (res: SinglePatientResponse) => res.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserId(data.userId));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getPatientNotes: builder.query<PatientNotesResponse['data'], PatientNotesSortQueryParams>({
      query: (data) => {
        const { id, type = 'Patient', ...rest } = data;
        return {
          url: `/notes/list/${id}`,
          params: { ...rest, type },
        };
      },
      providesTags: ['Patient Notes'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          // Only update Redux for Patient notes, not Chart notes
          // Chart notes should be managed by their own components via local state
          if (arg.type === 'Patient' || arg.type === undefined) {
            dispatch(setPatientNotes(result.data.notes));
          }
        } catch (error) {
          console.log(error);
        }
      },
      transformResponse: (res: PatientNotesResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    addPatientNote: builder.mutation({
      query: (data: PatientNoteData) => ({
        url: '/notes/create',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Patient Notes'],
    }),
    editPatientNote: builder.mutation({
      query: (data: EditPatientNoteData) => {
        const { id, ...rest } = data;
        return {
          url: `/notes/update/${id}`,
          method: 'PATCH',
          data: rest,
        };
      },
      invalidatesTags: ['Patient Notes'],
    }),
    archivePatientNotes: builder.mutation({
      query: (data: ArchivePatientNotesData) => ({
        url: '/notes/archive',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Patient Notes'],
    }),
    deletePatientNotes: builder.mutation({
      query: (ids: string[]) => ({
        url: '/notes/delete',
        method: 'DELETE',
        data: { ids },
      }),
      invalidatesTags: ['Patient Notes'],
    }),

    updatePatientDetails: builder.mutation({
      query: (payload) => {
        const { id, ...data } = payload;
        return {
          url: `/patients/${id}`,
          method: 'PATCH',
          data,
        };
      },
      // Narrow invalidation to the specific patient only to avoid refetching full patients list
      invalidatesTags: (result, error, arg) => [{ type: 'Patient', id: arg.id }],
      async onQueryStarted({ id, ...rest }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          patientsApi.util.updateQueryData('getSinglePatient', id, (draft: SelectedPatient) => {
            if (!draft) return;
            // Type-safe property updates - only update known properties
            Object.assign(draft, rest);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    updatePatientStatus: builder.mutation<UpdatePatientStatusResponse, UpdatePatientStatusPayload>({
      query: (payload) => ({
        url: `/patients/update-patient-status`,
        method: 'PATCH',
        data: payload,
      }),
      invalidatesTags: ['Patients', 'Patient'],
    }),
    getFileUrl: builder.query<{ data: unknown; url: string }, string>({
      query: (key) => ({
        url: `/surveys/file-url`,
        params: { key },
      }),
    }),

    // New endpoint for appointments listing with filtering, searching, and sorting
    getPatientsWithOrders: builder.query<
      { appointments: PatientWithOrder[]; todayCount: number },
      AppointmentsQueryParams
    >({
      query: (params) => ({
        url: `/patients/appoitments`,
        params: {
          ...(params.search && { search: params.search }),
          ...(params.status && { status: params.status }),
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
          ...(params.productType && { productType: params.productType }),
        },
      }),
      providesTags: ['Appointments Patients'],
      transformResponse: (res: { appointments: PatientWithOrder[]; todayCount: number }) => {
        return res || { appointments: [], todayCount: 0 };
      },
      keepUnusedDataFor: 0, // Don't keep unused data
    }),

    // Get appointments for a specific patient
    getPatientAppointments: builder.query<PatientAppointmentsResponse['data'], PatientAppointmentsQueryParams>({
      query: (params) => {
        return {
          url: `/appointments/patient`,
          params,
        };
      },
      transformResponse: (res: PatientAppointmentsResponse) => res.data || [],
    }),
    delinePatientAppointMent: builder.mutation<Response, PatientAppointmentsDelineBody>({
      query: (data) => ({
        url: `/appointments/patient/decline`,
        data,
        method: 'POST',
      }),
    }),
    reschedulePatientAppointMent: builder.mutation<Response, PatientAppointmentsRescheduleBody>({
      query: (data) => ({
        url: `/appointments/patient/reschedule`,
        data,
        method: 'POST',
      }),
    }),
    getPatientBmiHistory: builder.query<PatientBmiHistoryResponse['data'], string>({
      query: (patientId: string) => ({
        url: `/patients/${patientId}/bmi-history`,
        method: 'GET',
      }),
      transformResponse: (res: PatientBmiHistoryResponse) => res.data,
    }),
    contactAdmin: builder.mutation<{ success: boolean; message: string }, { message: string; orderId: string }>({
      query: (data) => ({
        url: `/patients/contact-admin`,
        method: 'POST',
        data,
      }),
    }),
    generatePatientPassword: builder.mutation<GeneratePasswordResponse['data'], string>({
      query: (patientId: string) => ({
        url: `/patients/${patientId}/generate-password`,
        method: 'POST',
      }),
      transformResponse: (res: GeneratePasswordResponse) => res.data,
    }),
    generateTrustpilotLink: builder.mutation<GenerateTrustpilotLink['data'], string>({
      query: (patientId: string) => ({
        url: `/patients/${patientId}/generate-trustpilot-link`,
        method: 'POST',
      }),
      transformResponse: (res: GenerateTrustpilotLink) => res.data,
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useLazyGetPatientsQuery,
  useGetSinglePatientQuery,
  useLazyGetPatientNotesQuery,
  useAddPatientNoteMutation,
  useEditPatientNoteMutation,
  useArchivePatientNotesMutation,
  useDeletePatientNotesMutation,
  useUpdatePatientDetailsMutation,
  useUpdatePatientStatusMutation,
  useGetPatientsWithOrdersQuery,
  useGetPatientAppointmentsQuery,
  useLazyGetPatientAppointmentsQuery,
  useDelinePatientAppointMentMutation,
  useReschedulePatientAppointMentMutation,
  useGetPatientBmiHistoryQuery,
  useLazyGetPatientBmiHistoryQuery,
  useContactAdminMutation,
  useGeneratePatientPasswordMutation,
  useGenerateTrustpilotLinkMutation,
} = patientsApi;
