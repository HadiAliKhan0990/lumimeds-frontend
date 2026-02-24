import { Response } from '@/lib/types';
import { BillingAddress, ShippingAddress } from '@/store/slices/ordersApiSlice';

export type IntakeFormSearchParams = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export interface PatientDataForRenewalSurveyResponse extends Response {
  data: {
    address: {
      billingAddress?: BillingAddress;
      shippingAddress?: ShippingAddress;
    };
    medication: string;
    renewalData: Record<string, unknown> | null;
    gender: string;
    medicalConditions: string | null;
  };
}
