import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { Medication } from '@/store/slices/medicationSlice';
import { setMedicationsData } from '@/store/slices/medicationsSlice';
import { appendMedicationsProducts, Product, setMedicationsProducts } from '@/store/slices/medicationsProductsSlice';
import { SortState } from '@/store/slices/sortSlice';
import { Response } from '@/lib/types';
import {
  MedicineTypeData,
  CreateMedicineTypePayload,
  UpdateMedicineTypePayload,
  CreateProductTypePayload,
} from '@/types/medications';
import { ProductCategory } from '@/store/slices/productCategoriesSlice';

export interface MedicationsReponse extends Response {
  data: {
    data: Medication[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProductsReponse extends Response {
  data: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
}
export interface MedicationsReponse extends Response {
  data: {
    data: Medication[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface QueryParams {
  search?: string | null;
  sortField?: string;
  sortOrder?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  sortStatus?: string | null;
}

interface ProductCategoryParams extends QueryParams {
  type?: string;
  status?: string;
}

interface ProductCategoryResponse extends Response {
  data: {
    productTypes: ProductCategory[];
    meta: SortState['meta'];
  };
}

export type AddProduct = {
  image?: File | null | string;
  name: string;
  description: string;
  openpay?: string;
  telegra?: string;
  telepath?: string;
};

export type ProductPricePayload = {
  productId: string;
  amount: number;
  billingIntervalCount?: number;
};

interface MedicineTypeResponse extends Response {
  data: MedicineTypeData;
}

export const medicationsApi = createApi({
  reducerPath: 'medicationsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Medication', 'Products', 'Medicine Types', 'Products Categories'],
  endpoints: (builder) => ({
    getMedications: builder.query({
      query: ({ search, sortField, sortOrder, meta, sortStatus }: QueryParams) => ({
        url: `/medications/`,
        params: {
          search,
          sortBy: sortField,
          sortOrder,
          status: sortStatus,
          page: meta?.page,
          limit: meta?.limit,
        },
      }),
      providesTags: ['Medication'],
      transformResponse: (res: MedicationsReponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setMedicationsData(result.data));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getMedicationsProductsList: builder.query<ProductsReponse['data'], QueryParams>({
      query: ({ search, sortField, sortOrder, meta, sortStatus }) => ({
        url: `/medications/internal-product-list/`,
        params: {
          search,
          sortBy: sortField,
          sortOrder,
          status: sortStatus,
          page: meta?.page,
          limit: meta?.limit,
        },
      }),
      providesTags: ['Products'],
      transformResponse: (res: ProductsReponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const { products, page, total, totalPages } = data || {};

          // Check if we're appending (page > 1) or replacing (page = 1)
          if (arg.meta?.page && arg.meta.page > 1) {
            dispatch(
              appendMedicationsProducts({
                data: products,
                meta: { page, total, totalPages } as SortState['meta'],
              })
            );
          } else {
            dispatch(
              setMedicationsProducts({
                data: products,
                meta: { page, total, totalPages } as SortState['meta'],
              })
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    addMedication: builder.mutation({
      query: (data) => ({
        url: '/medications',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Medication'],
    }),
    createNewProduct: builder.mutation({
      query: (data: FormData) => ({
        url: `/medications/product-types`,
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        formData: true,
      }),
    }),
    updateProduct: builder.mutation<Response, { id: string; data?: FormData }>({
      query: ({ id, data }) => ({
        url: `/medications/product/${id}`,
        method: 'PATCH',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        formData: true,
      }),
    }),
    updateProductPrice: builder.mutation<Response, ProductPricePayload>({
      query: (data) => ({
        url: '/medications/create-price',
        method: 'POST',
        data,
      }),
    }),

    // Medicine Type

    getMedicineTypes: builder.query<MedicineTypeResponse['data'], QueryParams>({
      query: ({ meta, search }) => ({
        url: `/medications/medicine-types`,
        params: {
          page: meta?.page,
          limit: meta?.limit,
          search,
        },
      }),
      providesTags: ['Medicine Types'],
      transformResponse: (res: MedicineTypeResponse) => res.data,
    }),

    createMedicineType: builder.mutation<Response, CreateMedicineTypePayload>({
      query: (data) => ({
        url: '/medications/medicine-type',
        method: 'POST',
        data,
      }),
    }),

    updateMedicineType: builder.mutation<Response, UpdateMedicineTypePayload>({
      query: ({ id, ...data }) => ({
        url: `/medications/medicine-type/${id}`,
        method: 'PATCH',
        data,
      }),
    }),

    // Product Types/Categories

    getProductCategories: builder.query<ProductCategoryResponse['data'], ProductCategoryParams>({
      query: ({ meta, search, type, status }) => ({
        url: '/medications/product-categories',
        params: {
          page: meta?.page,
          limit: meta?.limit,
          search,
          type,
          status,
        },
      }),
      providesTags: ['Products Categories'],
      transformResponse: (res: ProductCategoryResponse) => res.data,
    }),

    createProductCategory: builder.mutation<Response, CreateProductTypePayload>({
      query: (data) => ({
        url: '/medications/product-category',
        method: 'POST',
        data,
      }),
    }),

    updateProductCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/medications/product-category/${id}`,
        method: 'PATCH',
        data,
      }),
    }),

    manageArchiveProductCategory: builder.mutation({
      query: ({ id, isArchived }) => ({
        url: `/medications/product-category/archive/${id}`,
        method: 'PATCH',
        data: { isArchived },
      }),
    }),
  }),
});

export const {
  useLazyGetMedicationsQuery,
  useAddMedicationMutation,
  useLazyGetMedicationsProductsListQuery,
  useCreateNewProductMutation,
  useUpdateProductMutation,
  useUpdateProductPriceMutation,
  useCreateMedicineTypeMutation,
  useLazyGetMedicineTypesQuery,
  useGetMedicineTypesQuery,
  useUpdateMedicineTypeMutation,
  useLazyGetProductCategoriesQuery,
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useManageArchiveProductCategoryMutation,
} = medicationsApi;
