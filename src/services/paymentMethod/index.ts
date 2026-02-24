import { client } from '@/lib/baseQuery';
import { fetcher } from '@/lib/fetcher';
import { CreatePaymentMethodResponse, GetPaymentMethodsResponse } from '@/services/paymentMethod/types';

export function createPaymentToken() {
  return client.get<CreatePaymentMethodResponse>('/openpay/payment-link');
}

export async function getPaymentMethods(): Promise<GetPaymentMethodsResponse['data']> {
  try {
    const { data } = await fetcher<GetPaymentMethodsResponse>('/openpay/payment-methods', {
      params: { page: 1, limit: 30 },
    });
    return (
      data || {
        paymentMethods: [],
        currentPaymentMethodId: null,
        meta: {
          total: 0,
          page: 1,
          limit: 30,
          totalPages: 1,
        },
      }
    );
  } catch (error) {
    console.log('Failed to get payment methods:', error);
    return {
      paymentMethods: [],
      currentPaymentMethodId: null,
      meta: {
        total: 0,
        page: 1,
        limit: 30,
        totalPages: 1,
      },
    };
  }
}
