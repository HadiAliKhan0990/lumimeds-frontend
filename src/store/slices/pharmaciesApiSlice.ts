import { createApi } from '@reduxjs/toolkit/query/react';
import { setPharmacies } from '@/store/slices/pharmaciesSlice';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Pharmacy } from '@/store/slices/pharmacySlice';
import { Response } from '@/lib/types';
import {
  PublicPharmacy,
  setPharmacies as setPharmaciesData,
  setPharmaciesMaps,
} from '@/store/slices/adminPharmaciesSlice';
import { appendDoctors, Doctor, setDoctorsData, setMetaData } from '@/store/slices/doctorsSlice';
import { SortState } from '@/store/slices/sortSlice';
import {
  AxtellPatientFormValues,
  commonPharmacyFormValues,
  DrugCrafterQuantitySize,
} from '@/lib/schema/pharmacyPatient';
import { PatientPrescriptionData } from '@/modules/protected/patient/orders/includes/Orders/includes/types';

export enum EnumdoctorGroup {
  GLISS = 'Gliss',
  LOCTUMETELE = 'Locumtele',
}

export type PrescriptionProduct = {
  quantity: string;
  directions: string;
  productId: number;
  refills: number;
  docNote: string;
  dateWritten: string;
  productForm: string;
  drugName: string;
  drugStrength: string;
};

export interface Prescription {
  hasFile?: boolean;
  prescriptionId: string;
  id: string;
  orderId: string | null;
  patientid: string | null;
  status: string;
  courier: string;
  trackingId: string;
  updatedAt: string;

  doctor: {
    firstName: string;
    lastName: string;
    npi: string;
    phone: string;
    email: string;
    fax: string;
    dea: string;
    licenseNumber: string;
    state: string;
  };

  patient: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: 'M' | 'F';
    email: string;
    phone: string;
    allergies: string;
    medicationList: string;
    address: {
      billing: {
        address1: string;
        address2: string;
        city: string;
        state: string;
        zip: string;
      };
      shipping: {
        address1: string;
        address2: string;
        city: string;
        state: string;
        zip: string;
      };
    };
  };

  productDetails: PrescriptionProduct[];

  patientLastVisit: string;

  shippingMethod: string;
}

export interface PharmaciesReponse extends Response {
  data: Pharmacy[];
}

export interface PublicPharmaciesReponse extends Response {
  data: PublicPharmacy[];
}

export type OlympiaProduct = {
  prodId: number;
  prodName: string;
  qty: number;
  sig: string;
  docNote: string;
  refills: number;
};

export type OptiroxProduct = {
  dateWritten: string;
  item: string;
  rxQuantity: number;
  rxUnit: string;
  refills: number;
  daw: boolean;
  directions: string;
  itemAlternateId: string;
  daysSupply?: number;
  drugStrength?: string;
};

export type AxtellProduct = AxtellPatientFormValues &
  commonPharmacyFormValues & {
    docNotes: string;
  };

export type ValliantProduct = AxtellProduct;

export type BeakerProduct = AxtellProduct;

export type DrugCraftersProduct = AxtellProduct & {
  vials: DrugCrafterQuantitySize;
};

export type PremierRxProduct = AxtellProduct & {
  vials?: string;
  totalMg?: string;
};

export type Cre8Product = AxtellProduct & {
  vials?: string | number | null;
};

export type BoothwynProduct = {
  drugName: string;
  productId: string;
  quantity: string;
  quantityUnits: string;
  directions: string;
  notes: string;
  daysSupply: string;
};

export type FirstChoiceProduct = AxtellProduct;

export type PharmacyProductPayload =
  | OlympiaProduct[]
  | AxtellProduct[]
  | DrugCraftersProduct[]
  | PremierRxProduct[]
  | Cre8Product[]
  | OptiroxProduct[]
  | BoothwynProduct[]
  | FirstChoiceProduct[];

export enum EnumPrescriberType {
  OD = 'OD',
  CRNA = 'CRNA',
  ND = 'N.D.',
  CNP = 'CNP',
  PMHNP = 'PMHNP',
  CNS = 'C.N.S.',
  PA = 'P.A.',
  NP = 'N.P.',
  MBBS = 'MBBS',
  PHARMD = 'PharmD',
  APNP = 'APNP',
  CDH = 'CDH',
  DNP = 'DNP',
  BVMS = 'B.V.M.S.',
  VMD = 'V.M.D.',
  CPM = 'CPM',
  RPT = 'RPT',
  WHNP = 'WHNP',
  RPH = 'RPh',
  DMD = 'D.M.D.',
  DO = 'D.O.',
  PHD = 'PhD',
  APRN = 'APRN',
  DVM = 'D.V.M.',
  DPT = 'DPT',
  ARNP = 'ARNP',
  DC_APC = 'DC APC',
  MD = 'M.D.',
  DDS = 'D.D.S.',
  PT = 'PT',
  PSYD = 'PsyD',
  CNM = 'CNM',
  FNP = 'F.N.P.',
  CRNP = 'CRNP',
  CPP = 'CPP',
  DPM = 'DPM',
}

export type PharmacyPayload = {
  orderType?: string;
  pharmacyId: string;
  patientId?: string;
  file?: Blob | null;
  orderId?: string;
  shippingService?: string | number;
  patient: {
    allergies: string;
    medicationList: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    email: string;
    phone: string;
    address: {
      shippingAddress: {
        street: string;
        street2?: string;
        city: string;
        state: string;
        zip: string;
      };
      billingAddress: {
        street: string;
        street2?: string;
        city: string;
        state: string;
        zip: string;
      };
    };
  };
  doctor: {
    firstName: string;
    lastName: string;
    npi: string;
    dea: string;
    phone: string;
    fax: string;
    email: string;
    stateLicense: string;
    state: string;
    address1?: string;
    zip?: string;
    address?: string;
    city?: string;
    prescriberTypeText?: EnumPrescriberType;
  };
  lastVisit?: string;
  products: PharmacyProductPayload;
};

export type PharmacyDataPayload = {
  payload: PharmacyPayload;
  url: string;
};

export type DoctorsResponse = {
  data: {
    doctors: Doctor[];
    meta: SortState['meta'];
  };
} & Response;

export type DoctorsMetaPayload = { page: number; limit: number; search?: string; orderId?: string };

export type PharmacyPrescriptionParams = {
  pharmacyId: string;
  page: number;
  limit: number;
  search?: string;
  sortField?: string;
  sortOrder?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type PharmacyPrescriptionsResponse = {
  data: {
    data: Prescription[];
    meta: SortState['meta'];
  };
} & Response;

export type PrescriptionDetailsProduct = {
  quantity: string;
  directions: string;
  prodName: string;
  refills: string;
  vials: string;
  docNote: string;
  dateWritten: string;
  file: string;
};

export type PrescriptionDetailsResponse = {
  data: {
    pharmacy: string;
    rxNumber: string | null;
    products: PrescriptionDetailsProduct[];
    createdAt: string;
    updatedAt: string;
    file?: string;
  };
} & Response;

export type PrescriptionFileResponse = {
  data: {
    file: string;
  };
} & Response;

export interface PrescriptionFileUrlResponse extends Response {
  data: {
    url: string;
  };
}

export interface PharmacyNotesQueryParams {
  daysSupply?: number;
  dosage?: string;
  productName?: string;
  doctorGroup?: string;
  category?: string;
  route?: 'im' | 'sq'; // Route for NAD products (Intramuscular or Subcutaneous)
  isGlycine?: boolean; // Filter clinical notes by drug key with 'glycine' value
}

export interface PharmacyClinicalNotes {
  is_default: boolean;
  id: number;
  note: string;
}

export type PharmacyNotes = {
  clinicalNotes: PharmacyClinicalNotes[];
  generalNotes: string[];
};

export type PharmacyNotesResponse = {
  data: PharmacyNotes;
} & Response;

// Valiant pharmacy notes response structure
export interface ValiantPharmacyNote {
  route: 'im' | 'sq';
  medication: string;
  category: string;
  notes: string[];
}

export type ValiantPharmacyNotesResponse = {
  data: ValiantPharmacyNote[];
} & Response;

// API Response structure - matches actual backend response
export interface StateApiResponse {
  id: string;
  name: string;  // Full state name (e.g., "Alabama")
  code: string;   // 2-letter abbreviation (e.g., "AL")
  createdAt: string;
  updatedAt: string;
}

// Transformed State for internal use
export interface State {
  name: string;  // Full state name
  code: string;   // 2-letter abbreviation
}

export interface StatesResponse extends Response {
  data: StateApiResponse[];
}

export type PrescriptionHistoryItem = {
  id: string;
  prescriptionId: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
  webhookReceived: boolean;
};

export type PrescriptionHistoryResponse = {
  data: PrescriptionHistoryItem[];
} & Response;


export const pharmaciesApi = createApi({
  reducerPath: 'pharmaciesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Pharmacy', 'Prescriptions', 'Pharmacies List', 'Doctors', 'Prescription Details', 'Prescription File', 'States', 'Prescription History'],
  endpoints: (builder) => ({
    getPharmacies: builder.query<PharmaciesReponse['data'], void>({
      query: () => ({
        url: `/medications/pharmacies`,
      }),
      providesTags: ['Pharmacy'],
      transformResponse: (res: PharmaciesReponse) => res.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setPharmacies(result.data));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getPharmacyPrescriptions: builder.query<PharmacyPrescriptionsResponse['data'], PharmacyPrescriptionParams>({
      query: (params) => ({
        url: `/pharmacy/prescriptions`,
        params,
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Prescriptions', id: arg.pharmacyId }],
      transformResponse: (res: PharmacyPrescriptionsResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getPharmaciesList: builder.query<PublicPharmaciesReponse['data'], void>({
      query: () => ({
        url: `/pharmacy/list`,
      }),
      providesTags: ['Pharmacies List'],
      transformResponse: (res: PublicPharmaciesReponse) => {
        const transformResponse: PublicPharmacy[] = res.data.map((pharmacy) => {
          if (pharmacy.name === 'optiorx')
            return {
              ...pharmacy,
              products: pharmacy.products.map((product) => ({
                ...product,
                prodName: `${product?.prodName ?? ''} (${product?.dispenseSize})`,
              })),
            };

          return pharmacy;
        });
        return transformResponse;
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setPharmaciesData(result.data));

          const pharmaciesMaps = result.data.reduce((acc, pharmacy) => {
            acc[pharmacy.id] = pharmacy;
            return acc;
          }, {} as Record<string, PublicPharmacy>);

          dispatch(setPharmaciesMaps(pharmaciesMaps));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getDoctorsList: builder.query<DoctorsResponse['data'], DoctorsMetaPayload>({
      query: (params) => ({
        url: `/doctors/list`,
        params,
      }),
      providesTags: ['Doctors'],
      transformResponse: (res: DoctorsResponse) => res.data,
      onQueryStarted: async ({ page }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (page === 1) {
            dispatch(setDoctorsData({ data: data.doctors, meta: data.meta }));
          } else {
            dispatch(appendDoctors(data.doctors));
            dispatch(setMetaData(data.meta));
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    deletePharmacy: builder.mutation({
      query: (id: string) => ({
        url: `/medications/pharmacies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pharmacy'],
    }),
    addPharmacy: builder.mutation({
      query: (name: string) => ({
        url: `/medications/pharmacies`,
        method: 'POST',
        data: {
          name,
        },
      }),
      invalidatesTags: ['Pharmacy'],
    }),
    updatePharmacy: builder.mutation<Response, { pharmacyId: string; data: Record<string, unknown> }>({
      query: ({ pharmacyId, data }) => ({
        url: `pharmacy/update-pharmacy/${pharmacyId}`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Pharmacies List'],
    }),
    updatePharmacyPriorities: builder.mutation<Response, string[]>({
      query: (pharmacyIds) => ({
        url: `admin/pharmacy-priorities`,
        method: 'PATCH',
        data: { pharmacyPriorities: pharmacyIds },
      }),
      invalidatesTags: ['Pharmacies List'],
    }),
    updateProductPharmacyPriorities: builder.mutation<Response, { productId: string; pharmacyPriorities: string[] }>({
      query: ({ productId, pharmacyPriorities }) => ({
        url: `admin/product-pharmacy-priorities`,
        method: 'PATCH',
        data: { productId, pharmacyPriorities },
      }),
      invalidatesTags: ['Pharmacies List'],
    }),
    getProductPharmacyPriorities: builder.query<{ data: { productId: string; pharmacyPriorities: string[] | null } }, string>({
      query: (productId) => ({
        url: `admin/product-pharmacy-priorities/${productId}`,
        method: 'GET',
      }),
    }),
    sendPatientDataToPharmacy: builder.mutation<Response, PharmacyDataPayload>({
      query: ({ payload, url }) => ({
        url,
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['Prescriptions'],
    }),
    sendPatientDataToPharmacyInFormData: builder.mutation<Response, { formData: FormData; url: string }>({
      query: ({ formData, url }) => ({
        url,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        formData: true,
      }),
      invalidatesTags: ['Prescriptions'],
    }),
    getPrescriptionDetails: builder.query<PrescriptionDetailsResponse['data'], string>({
      query: (orderId) => ({
        url: `/pharmacy/prescription/${orderId}`,
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Prescription Details', id: orderId }],
      transformResponse: (res: PrescriptionDetailsResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getPrescriptionFile: builder.query<PrescriptionFileResponse['data'], string>({
      query: (prescriptionId) => ({
        url: `/pharmacy/prescription/file/${prescriptionId}`,
      }),
      providesTags: (_result, _error, prescriptionId) => [{ type: 'Prescription File', id: prescriptionId }],
      transformResponse: (res: PrescriptionFileResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getPrescriptionFileUrl: builder.query<PrescriptionFileUrlResponse, string>({
      query: (prescriptionId) => ({
        url: `/pharmacy/prescription/file-url/${prescriptionId}`,
      }),
      providesTags: (_result, _error, prescriptionId) => [{ type: 'Prescription File', id: prescriptionId }],
      keepUnusedDataFor: 1,
    }),
    getPharmacyNotes: builder.query<
      PharmacyNotesResponse['data'],
      { pharmacyId: string; queryParams: PharmacyNotesQueryParams }
    >({
      query: ({ pharmacyId, queryParams: { daysSupply, dosage, productName, doctorGroup, category, route, isGlycine } }) => ({
        url: `/pharmacy/${pharmacyId}/notes`,
        params: {
          ...(daysSupply && { daysSupply }),
          ...(dosage && { dosage }),
          ...(productName && { productName }),
          ...(doctorGroup && { doctorGroup }),
          ...(category && { category }),
          ...(route && { route }),
          ...(isGlycine !== undefined && { isGlycine: isGlycine.toString() }),
        },
      }),
      transformResponse: (res: PharmacyNotesResponse) => res.data,
    }),
    getValiantPharmacyNotes: builder.query<
      ValiantPharmacyNotesResponse['data'],
      { productName: string; category: string; daysSupply?: number; route?: string; dosage?: string | number }
    >({
      query: ({ productName, category, daysSupply, route, dosage }) => ({
        url: `/pharmacy/valiant/notes`,
        params: {
          productName,
          category,
          ...(daysSupply !== undefined && { day_supply: daysSupply }),
          ...(route !== undefined && { route }),
          ...(dosage !== undefined && { dosage }),
        },
      }),
      transformResponse: (res: ValiantPharmacyNotesResponse) => res.data,
    }),
    getStates: builder.query<State[], void>({
      query: () => ({
        url: `/pharmacy/states`,
        method: 'POST',
      }),
      providesTags: ['States'],
      transformResponse: (res: StatesResponse): State[] => {
        // Extract name and code from API response and sort alphabetically by name
        return res.data
          .map((item) => ({
            name: item.name,
            code: item.code,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
    }),
    getPrescriptionHistory: builder.query<PrescriptionHistoryResponse['data'], string>({
      query: (orderId) => ({
        url: `/pharmacy/prescription-history/${orderId}`,
      }),
      providesTags: (_result, _error, orderId) => [{ type: 'Prescription History', id: orderId }],
      transformResponse: (res: PrescriptionHistoryResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getDosageMapping: builder.query({
      query: ({ pharmacyId, medication, planCode, dosage }) => ({
        url: `/pharmacy/dosage-mapping?pharmacyId=${pharmacyId}&medication=${medication}&planCode=${planCode}&dosage=${dosage}`,
      }),
    }),
    getOrderPrescription: builder.query<PatientPrescriptionData, string>({
      query: (orderId) => ({
        url: `/pharmacy/orders/${orderId}/prescription`,
      }),
      transformResponse: (res: Response & { data: PatientPrescriptionData }) => res.data,
    }),
  }),
});

export const {
  useLazyGetPharmaciesQuery,
  useDeletePharmacyMutation,
  useAddPharmacyMutation,
  useUpdatePharmacyMutation,
  useUpdatePharmacyPrioritiesMutation,
  useUpdateProductPharmacyPrioritiesMutation,
  useGetProductPharmacyPrioritiesQuery,
  useSendPatientDataToPharmacyMutation,
  useGetPharmaciesListQuery,
  useGetDoctorsListQuery,
  useLazyGetDoctorsListQuery,
  useLazyGetPharmacyPrescriptionsQuery,
  useLazyGetPharmaciesListQuery,
  useSendPatientDataToPharmacyInFormDataMutation,
  useGetPrescriptionDetailsQuery,
  useLazyGetPrescriptionDetailsQuery,
  useLazyGetPrescriptionFileQuery,
  useLazyGetPrescriptionFileUrlQuery,
  useGetPharmacyNotesQuery,
  useLazyGetPharmacyNotesQuery,
  useGetValiantPharmacyNotesQuery,
  useLazyGetValiantPharmacyNotesQuery,
  useGetStatesQuery,
  useGetPrescriptionHistoryQuery,
  useLazyGetPrescriptionHistoryQuery,
  useGetDosageMappingQuery,
  useLazyGetOrderPrescriptionQuery,
} = pharmaciesApi;
