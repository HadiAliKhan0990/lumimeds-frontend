import axios, { isAxiosError } from 'axios';
import {
  GetCheckoutData,
  GetCheckoutDataById,
  GetCheckoutDataByIdResponse,
  GetCheckoutDataResponse,
} from '@/services/checkout/types';
import { fetcher } from '@/lib/fetcher';
import { Error } from '@/lib/types';

export const getCheckoutData = async (token: string): Promise<GetCheckoutData | undefined> => {
  // Guard: token must be a non-empty string of reasonable length
  if (!token || typeof token !== 'string' || token.trim().length < 8) {
    return undefined;
  }

  const url = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  try {
    const { data } = await axios.get<GetCheckoutDataResponse>(`${url}/api/openpay/checkout-data/${token}`);
    return data?.data;
  } catch (error) {
    console.log("ERROR GETTING CHECKOUT DATA ===>", error);
    if (isAxiosError(error)) {
      const message = error.response?.data?.message?.toString().toLowerCase() ?? '';
      const status = error.response?.status;
      if (status === 401 || status === 403 || message.includes('expired') || message.includes('invalid')){
        console.log("TOKEN IS INVALID OR EXPIRED===>", message);
        return undefined;
      }
    } else if ((error as Error).data) {
      const message = (error as Error).data.message.toString().toLowerCase() ?? '';
      const status = (error as Error).data.statusCode;
      if (status === 401 || status === 403 || message.includes('expired') || message.includes('invalid')){
        console.log("TOKEN IS INVALID OR EXPIRED===>", message);
        return undefined;
      }
    }

    return undefined;
  }
};

export const getCheckoutDataById = async (id: string): Promise<GetCheckoutDataById> => {
  try {
    const { data } = await fetcher<GetCheckoutDataByIdResponse>(`/openpay/checkout-link-data`, {
      method: 'POST',
      data: { productId: id, currency: 'usd' },
    });
    return (
      data || {
        token: '',
        product: {
          id: '',
          name: '',
          description: '',
          createdAt: '',
          updatedAt: '',
          prices: [],
          openPayProductId: '',
          surveyId: '',
          image: '',
          displayName: '',
          bulletDescription: [],
          tagline: '',
          metadata: { intervalCount: 0, billingInterval: null },
          category: '',
          planType: null,
          dosageType: '',
          medicineName: '',
          durationText: '',
          dividedAmount: 0,
          featureText: '',
          refillSurveyId: '',
        },
      }
    );
  } catch (e) {
    console.log(e);
    return {
      token: '',
      product: {
        id: '',
        name: '',
        description: '',
        createdAt: '',
        updatedAt: '',
        prices: [],
        openPayProductId: '',
        surveyId: '',
        image: '',
        displayName: '',
        bulletDescription: [],
        tagline: '',
        metadata: { intervalCount: 0, billingInterval: null },
        category: '',
        planType: null,
        dosageType: '',
        medicineName: '',
        durationText: '',
        dividedAmount: 0,
        featureText: '',
        refillSurveyId: '',
      },
    };
  }
};
