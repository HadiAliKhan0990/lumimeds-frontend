import { ProductPrice } from '@/store/slices/productTypeSlice';
import { BillingInterval, PlanType } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Price {
  id: number;
  amount: number | null;
  priceId: string | null;
  description: string | null;
  checkoutType: string | null;
  billingInterval: string | null;
  billingIntervalCount: number | null;
  productName: string | null;
  productDescription: string | null;
  productImage: string | null;
  isActive?: boolean;
}

export interface PlanProduct {
  products: Product[];
  image: string;
  displayName: string;
  startingAmount: number;
  planText: string;
}

export interface Product {
  id: number | null;
  name: string | null;
  description: string[] | null;
  prices: ProductPrice[] | null;
  image: string | null;
  tagline: string | null;
  metadata: {
    intervalCount: number;
    billingInterval: BillingInterval | null;
  };
  category: string;
  planType: string;
  dosageType: string;
  medicineTypeId: string;
  medicineName: string;
  dividedAmount: number;
  categoryTags: string[];
  hasActiveSubscription: boolean;
  activeSubscription: null;
}

type SubscriptionProductCategory =
  | 'weight_loss_glp_1_gip_injection_recurring'
  | 'weight_loss_glp_1_injection_recurring'
  | 'longevity_nad_injection_recurring';

export type SubscriptionProduct = Record<SubscriptionProductCategory, PlanProduct>;

type OneTimeProductCategory = 'weight_loss_glp_1_503b_injection_one_time' | 'weight_loss_glp_1_gip_injection_one_time' | 'longevity_nad_injection_one_time';

export type OneTimeProduct = Record<OneTimeProductCategory, PlanProduct>;

export type SubscriptionStatus =
  | 'active'
  | 'pause_scheduled'
  | 'cancel_scheduled'
  | 'paused'
  | 'canceled'
  | 'past_due'
  | 'renewal_in_progress'
  | 'update_scheduled';

export interface ActiveSubscriptionType {
  orderStatus?: string | null;
  orderLastUpdatedAt?: string | null;
  orderReason?: string | null;
  orderPatientRemarks: string | null;
  orderPatientRemarksCreateAt: string | null;
  orderPatientRemarksCreateBy: string | null;
  id: string;
  subscriptionId: string;
  originalPriceId: string;
  status: SubscriptionStatus;
  createdAt: string;
  renewsAt: string;
  resumesAt: string | null;
  subscriptionType: PlanType;
  paymentMethodId: string;
  upcomingPlanName: string | null;
  pauseCount: number;
  currentPrice: {
    id: string;
    subscriptionId: string;
    subscriptionItemId: string;
    productId: string;
    priceId: string;
    effectiveDate: string;
    endDate: string | null;
    isActive: boolean;
    changeReason: string | null;
    previousPriceId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  productId: string;
  productName: string;
  isUsingLatestActivePrice: boolean;
  productImage: string;
  metadata: {
    planTier?: string | null;
    intervalCount?: number;
    billingInterval?: BillingInterval;
  };
  medicineName: string;
  renewalIntakeSurveyUrl: string | null;
}

export interface SubscriptionsData {
  subscriptionProducts?: SubscriptionProduct;
  oneTimeProducts?: OneTimeProduct;
  activeSubscriptions: ActiveSubscriptionType[];
  summary: {
    totalActiveSubscriptions: number;
    activeSubscriptionsByCategory: Record<string, number>;
  };
}

const initialState: SubscriptionsData = {
  activeSubscriptions: [],
  summary: {
    totalActiveSubscriptions: 0,
    activeSubscriptionsByCategory: {},
  },
};

export const patientActiveSubscriptionSlice = createSlice({
  name: 'patientActiveSubscription',
  initialState,
  reducers: {
    setPatientActiveSubscription: (state, action: PayloadAction<SubscriptionsData | null | undefined>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setPatientActiveSubscription } = patientActiveSubscriptionSlice.actions;

export default patientActiveSubscriptionSlice.reducer;
