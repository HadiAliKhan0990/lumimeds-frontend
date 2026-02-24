import { Response } from '@/lib/types';
import { ProductType } from '@/store/slices/productTypeSlice';

export interface CheckoutLineItem {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  is_deleted: false;
  amount_subtotal_atom: number;
  amount_total_atom: number;
  checkout_session_id: string;
  description: string;
  currency: string;
  price_id: string;
  billing_interval: number | null;
  billing_interval_count: number | null;
  quantity: number;
}

export interface CheckoutSessionResponseData {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  account_id: string;
  account_name: string;
  amount_subtotal_atom: number;
  amount_total_atom: number;
  client_reference_id: string | null;
  coupon_id: string | null;
  currency: string;
  customer_id: string | null;
  customer_email: string | null;
  line_items: CheckoutLineItem[];
  mode: string;
  return_url: string | null;
  secure_token: string;
  setup_intent: unknown;
  status: string;
  subscription_id: string | null;
  success_url: string | null;
  tax_amount_atom: number;
  url: string;
  trial_end: unknown;
  trial_period_days: number | null;
  trial_from_price: number | null;
}

export type GetCheckoutData = {
  token: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  submissionId: string;
  product: ProductType;
};

export interface GetCheckoutDataResponse extends Response {
  data: GetCheckoutData;
}

export interface CheckoutSessionResponse extends Response {
  data: CheckoutSessionResponseData;
}

export type CreateCheckoutSessionPayload = {
  priceId: string;
  currency: string;
  email: string;
  mode: string;
  productId: string;
  surveyId: string;
};

export type GetCheckoutDataById = {
  token: string;
  product: ProductType;
  id?: string;
  patient?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

export interface GetCheckoutDataByIdResponse extends Response {
  data: GetCheckoutDataById;
}
