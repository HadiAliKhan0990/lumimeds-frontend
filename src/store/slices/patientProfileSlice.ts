import { PlanType } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionStatus } from '@/store/slices/patientAtiveSubscriptionSlice';

export interface PatientProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  user?: {
    id?: string;
    password?: string;
    status?: string | null;
  };
  updatedAt?: string;
  profileImage?: string;
  billingAddress?: {
    street?: string;
    street2?: string;
    city?: string;
    region?: string;
    state?: string;
    zip?: string;
    lastName?: string;
    firstName?: string;
  };
  shippingAddress?: {
    street?: string;
    street2?: string;
    city?: string;
    region?: string;
    state?: string;
    zip?: string;
    firstName?: string;
    lastName?: string;
  };
  isTelePathFormComplete?: boolean;
  activeSubscriptions?: Array<{
    name: string;
    description: string[];
    image: string;
    tagline: string | null;
    priceId: string;
    effectiveDate: string;
    subscriptionType: PlanType;
    status: SubscriptionStatus;
  }>;

  medicalHistory?: {
    allergies?: string | null;
    medicalConditions?: string | null;
    medications?: string | null;
  };
}

const initialState: PatientProfile = {};

const patientProfileSlice = createSlice({
  name: 'patientProfile',
  initialState,
  reducers: {
    setPatientProfile: (state, action: PayloadAction<PatientProfile>) => {
      return Object.assign(state, action.payload);
    },
  },
});

export const { setPatientProfile } = patientProfileSlice.actions;

export default patientProfileSlice.reducer;
