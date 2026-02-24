'use client';

import { loadSync, queueEncryptedSave } from '@/lib/encryptedStorage';
import { BillingInterval, PlanType } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORED_PRODUCT } from '@/constants/intakeSurvey';

export type CheckoutType = 'subscription' | 'payment';

export interface ProductPrice {
  amount: number;
  priceId: string | null;
  billingInterval: string | null;
  billingIntervalCount: number | null;
  description: string | null;
  checkoutType: CheckoutType;
  isActive: boolean;
}

export interface ProductType {
  id: string | null;
  name: string | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  prices: ProductPrice[];
  openPayProductId: string | null;
  surveyId: string | null;
  image?: string | null;
  displayName?: string;
  bulletDescription: string[];
  tagline: string | null;
  metadata: {
    planTier?: string | null;
    intervalCount: number | null;
    billingInterval: BillingInterval | null;
    isKlarnaEnabled?: boolean;
  };
  category: string;
  planType: PlanType | null;
  dosageType: string;
  medicineName: string;
  durationText: string;
  dividedAmount: number;
  featureText: string;
  refillSurveyId: string;
}

const defaultState: ProductType = {
  id: null,
  name: null,
  description: null,
  createdAt: null,
  updatedAt: null,
  prices: [],
  surveyId: null,
  openPayProductId: null,
  displayName: '',
  image: null,
  bulletDescription: [],
  tagline: null,
  metadata: { planTier: null, intervalCount: null, billingInterval: null, isKlarnaEnabled: false },
  category: '',
  planType: null,
  dosageType: '',
  medicineName: '',
  durationText: '',
  dividedAmount: 0,
  featureText: '',
  refillSurveyId: '',
};

const initialState = loadSync<ProductType>(STORED_PRODUCT) || defaultState;

export const productTypeSlice = createSlice({
  name: 'productType',
  initialState,
  reducers: {
    setProductType(state, action: PayloadAction<ProductType>) {
      queueEncryptedSave(STORED_PRODUCT, action.payload);
      Object.assign(state, action.payload);
    },
    resetProductType(state) {
      localStorage.removeItem(STORED_PRODUCT);
      Object.assign(state, defaultState);
    },
  },
});

export const { setProductType, resetProductType } = productTypeSlice.actions;

export default productTypeSlice.reducer;
