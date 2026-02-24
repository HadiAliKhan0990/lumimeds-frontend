import { Response } from '@/lib/types';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';

export interface CreatePaymentMethodResponse extends Response {
  data?: {
    token: string;
  };
}

export type GetPaymentMethodsResponseData = {
  paymentMethods: PaymentMethod[];
  currentPaymentMethodId?: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type GetPaymentMethodsResponse = {
  data?: GetPaymentMethodsResponseData;
} & Response;
