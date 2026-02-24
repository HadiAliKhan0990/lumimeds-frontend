import { OptionValue } from '@/lib/types';

export type AnswerValue = string | string[] | AddressValues | boolean | Date | OptionValue | File | undefined | null;

export interface FormValues {
  [key: string]: AnswerValue;
  includeAddress?: boolean;
  address?: AddressValues;
}

export interface AddressValues {
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    region: string;
    state: string;
    zip: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    region: string;
    state: string;
    zip: string;
  };
  sameAsBilling?: boolean;
}

export interface RefillSurveyAnswer {
  questionId: string;
  isRequired: boolean | null | undefined;
  answer: string | string[] | AddressValues | boolean | Date | OptionValue | undefined | null;
}

export interface OrderRefillSurveyPayload {
  orderId: string | null | undefined;
  surveyId: string | null | undefined;
  answers: (RefillSurveyAnswer | null)[];
  address?: {
    billingAddress: AddressValues['billingAddress'];
    shippingAddress: AddressValues['shippingAddress'];
  } | null;
  vialsRequested: number;
}
