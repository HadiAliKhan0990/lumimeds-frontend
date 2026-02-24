import { Patient } from '@/store/slices/patientSlice';

// Type for patient data from SingleOrder
export type SingleOrderPatient = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  gender?: string;
  bio?: {
    height?: string;
    weight?: string;
    bmi?: number;
  };
  address?: {
    billingAddress?: {
      street: string;
      street2?: string;
      city: string;
      region: string;
      zip: string;
      state?: string;
    };
    shippingAddress?: {
      street: string;
      street2?: string;
      city: string;
      region: string;
      zip: string;
      state?: string;
    };
  };
  totalOrders?: number;
  medicalHistory?: {
    allergies?: string;
    medications?: string;
    medicalConditions?: string | null;
    reactionTo?: string[];
    [key: string]: string | number | boolean | string[] | null | undefined | { [key: string]: string };
  };
  createdAt?: string;
  status?: string;
  customerId?: string;
  isBanned?: boolean;
  banReason?: string | null;
  state?: string;
};

/**
 * Helper function to map SingleOrder.patient to Patient type
 * Converts patient data from order structure to Patient slice structure
 */
export const mapPatientFromOrder = (patientData: SingleOrderPatient): Patient => {
  return {
    id: patientData.id ?? null,
    userId: patientData.userId ?? null,
    firstName: patientData.firstName ?? null,
    lastName: patientData.lastName ?? null,
    email: patientData.email ?? null,
    dob: patientData.dob ?? null,
    gender: patientData.gender,
    orders: [],
    createdAt: patientData.createdAt ?? null,
    address: patientData.address as Patient['address'],
    status: patientData.status ?? null,
    customerId: patientData.customerId ?? null,
    isBanned: patientData.isBanned ?? false,
    banReason: patientData.banReason ?? null,
    state: patientData.state,
  };
};

