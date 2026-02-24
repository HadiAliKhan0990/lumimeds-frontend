import { PlanProduct, Price, Product } from '@/store/slices/patientAtiveSubscriptionSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import { PlanType } from './medications';
import { Dispatch } from '@reduxjs/toolkit';
import { TransitionStartFunction } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { CheckoutUser, SurveyCategoryType } from '@/store/slices/checkoutSlice';

export type Plan = {
  id: number;
  name: string;
  duration: string;
  imageUrl: string;
  isCurrentPlan?: boolean;
  isRecurring?: string | null;
  hasPrices: boolean;
  prices?: Price[] | null;
};

export interface ModalState {
  show: boolean;
  selectedProduct?: PlanProduct;
}

export interface ConfirmationModalState {
  show: boolean;
  selectedProduct?: Product;
}

export interface SuccessModalType {
  state: boolean;
  name: string | null;
}

export type ProductCategory =
  | 'weight_loss_glp_1_503b_injection_one_time'
  | 'weight_loss_glp_1_injection_recurring'
  | 'weight_loss_glp_1_gip_injection_recurring'
  | 'weight_loss_glp_1_gip_injection_one_time'
  | 'longevity_nad_injection_recurring'

export type ProductCategoryKey = 'olympiaPlans' | 'glp_1_gip_plans' | 'glp_1_plans' | 'nad_plans';

export type ProductCategoryKeyType = {
  name?: ProductCategoryKey;
  categories?: ProductCategory[];
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  planTypeSort?: PlanType;
  useDbPosition?: boolean;
};

export type ProductsListPayload = {
  keys: ProductCategoryKeyType[];
};

export type HandleVerifyRedirectToCheckoutPayload = {
  selectedProduct?: ProductType;
  product: ProductType;
  dispatch: Dispatch;
  startTransition: TransitionStartFunction;
  router: AppRouterInstance;
  isSurveyCompleted?: boolean;
  checkoutUser?: CheckoutUser;
  surveyCategory?: SurveyCategoryType;
  saleType?: string;
  overrideTime?: boolean;
};
