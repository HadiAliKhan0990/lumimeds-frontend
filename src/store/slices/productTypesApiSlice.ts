import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/baseQuery';
import { ProductPrice, ProductType } from '@/store/slices/productTypeSlice';
import { Response } from '@/lib/types';
import { BillingInterval, PlanType } from '@/types/medications';
import { setMedicationsProductsData } from '@/store/slices/medicationsProductsDataSlice';
import { ProductCategoryKey, ProductsListPayload } from '@/types/products';
import { extractIntakeSurveyExpiryDays } from '@/helpers/products';
import { loadSync, saveEncrypted } from '@/lib/encryptedStorage';
import { SURVEY_ANSWERS_META } from '@/constants/intakeSurvey';

export type PlanProduct = {
  products: ProductType[];
  image: string;
  displayName: string;
  startingAmount: number;
  summaryText: string;
  categoryIds: string[];
  categoryName: string;
  categoryDosageType: string;
  intakeSurveyId: string;
  refillSurveyId: string;
  intakeSurveyExpiry: number;
};

export type ProductByCategoryResponse = {
  data: PlanProduct;
};

export type ProductTypesResponseData = Record<ProductCategoryKey, PlanProduct | undefined>;

export interface ProductTypesResponse extends Response {
  data?: ProductTypesResponseData;
}

export type SummaryProductType = {
  id: string;
  name: string;
  description: string;
  image: string;
  surveyIds: {
    intake: string;
    refill: string;
  };
  isActive: boolean;
  prices: ProductPrice[];
  displayName: string | null;
  bulletDescription: string[];
  tagline: string | null;
  metadata: {
    planTier: string | null;
    intervalCount: number | null;
    billingInterval: BillingInterval | null;
  };
  category: string;
  planType: PlanType | null;
  dosageType: string;
  medicineName: string;
  durationText: string;
  dividedAmount: number;
  featureText: string;
};

export const productTypesApi = createApi({
  reducerPath: 'productTypesApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getProductTypes: builder.mutation<ProductTypesResponse['data'], ProductsListPayload>({
      query: (data) => ({
        url: `/medications/product-list`,
        method: 'POST',
        data,
      }),
      transformResponse: (res: ProductTypesResponse) => res.data,
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setMedicationsProductsData(data));
          // Persist intake survey expiry days into meta for answersSlice to use
          try {
            const days = extractIntakeSurveyExpiryDays(data || ({} as ProductTypesResponseData));
            if (typeof days === 'number' && days > 0) {
              const existingMeta = loadSync<{ savedAt?: number; expiryDays?: number }>(SURVEY_ANSWERS_META) || {};
              saveEncrypted(SURVEY_ANSWERS_META, { ...existingMeta, expiryDays: days });
            }
          } catch (e) {
            console.warn('Failed to persist intakeSurveyExpiry days:', e);
          }
        } catch (error) {
          console.error('Failed to fetch product types:', error);
        }
      },
    }),
    deleteProductType: builder.mutation({
      query: (id: string) => ({
        url: `/medications/product-types/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useDeleteProductTypeMutation, useGetProductTypesMutation } = productTypesApi;
