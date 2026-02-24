import { OrderProductVariationType, PharmacyType } from '@/lib/types';
import { Agent } from '@/store/slices/agentApiSlice';
import { PlanType } from '@/types/medications';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient } from '@/store/slices/patientSlice';

export interface OrderProvider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  npiNumber: string;
}
export interface PrescriptionInstruction {
  medication?: string;
  dosage?: number;
  route?: string;
  daysSupply?: number;
  directions?: string;
  notesToPatient?: string;
  notesToStaff?: string;
  dateWritten?: string;
  refills?: string;
  notes?: string;
}

export interface AddressData {
  firstName?: string;
  lastName?: string;
  street: string;
  street2?: string;
  city: string;
  region: string;
  state: string;
  zip: string;
}

interface RxStatus {
  status?: string;
  approvedBy?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface RevertedBy {
  userId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ReasonAddedBy {
  id?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

// Extended interface to include createdByInfo from API response
export interface CreatedByInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ShipmentReminder {
  scheduledDate: string;
  vialNumber: number;
  isSent: boolean;
  sentAt: string | null;
}

export type ProviderInfo = {
  id: string;
  firstName: string;
  lastName: string;
  group: string;
};

export interface Order {
  latestShipmentReminder?: ShipmentReminder | null;
  isQueueEligible?: boolean;
  tag?: string;
  isTelepathOrder?: boolean;
  prescriptionInstructions?: PrescriptionInstruction[];
  patient?: Patient | null;
  requestedProductName?: string | null;
  requestedPharmacy?: string | null;
  status?: string | null;
  rxStatus?: string | RxStatus;
  createdAt?: string | null;
  id?: string | null;
  isPaymentSuccessful?: boolean;
  orderId?: string;
  dosages?: {
    semaglutide?: number[];
    tirzepatide?: number[];
  };
  medications?: {
    semaglutide?: string;
    tirzepatide?: string;
  }; // Added for dynamic medication/dosage support
  orderUniqueId?: string;
  duration?: number | null;
  orderNumber?: string | null;
  processWith?: string | null;
  reason?: string | null;
  reasonAddedBy?: ReasonAddedBy | null;
  reasonCreatedAt?: string | null;
  nextRefillDate?: string | null;
  remainingDosage?: string | null;
  totalDosage?: string | null;
  visitType?: string | null;
  providerName?: string;
  providers?: OrderProvider[];
  assignedProvider?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    npiNumber: string;
  };
  invoice?: {
    id?: string;
    amount?: string;
    discountAmount?: string | null;
  };
  priceId?: string;
  amount?: string;
  productVariations?: OrderProductVariationType[];
  pharmacies?: PharmacyType[];
  image?: string | null;
  pharmacy?: string | null;
  dateOrdered?: string | null;
  productName?: string | null;
  orderTotal?: string | null;
  couponsAmount?: string | null;
  paidAmount?: number | null;
  paymentDate?: string | null;
  trackingNumber?: string | null;
  courierService?: string | null;
  dateReceived?: string | null;
  quantity?: number | null;
  paymentMethod?: string | null;
  remarks?: string | null;
  currentProductVariation?: string | null;
  ordersCount?: number | null;
  hasPharmacyOrder?: boolean;
  pharmacyName?: string;
  pharmacyOrder?: string | null;
  metadata?: {
    planTier?: string;
    intervalCount?: number;
    billingInterval?: string;
    category?: string;
    planType?: string;
    dosageType?: string;
    medicineType?: string;
    productImage?: string;
    productName?: string;
    amount?: string;
  };
  metaData?: {
    planTier?: string;
    intervalCount?: number;
    billingInterval?: string;
    category?: string;
    planType?: string;
    dosageType?: string;
    medicineType?: string;
    durationText?: string;
    productImage?: string;
    productName?: string;
    amount?: string;
  };
  pharmacyType?: 'api' | 'manual';
  agent?: Agent | null;
  address?: {
    billingAddress?: AddressData;
    shippingAddress?: AddressData;
  };
  category?: string;
  planType?: PlanType;
  dosageType?: string;
  medicineType?: string;
  refillSurveyId?: string;
  durationText?: string;
  providerInfo?: ProviderInfo | null;
  type?: 'refill' | 'subscription' | 'renewal';
  shippedVials?: number;
  subscriptionId?: string;
  nextReminderDate?: string | null;
  isFinalShipment?: boolean;
  rejectionReason?: string | null;
  revertedBy?: RevertedBy | null;
  latestIntakeForm?: {
    name: string;
    submittedAt: string;
    isCompleted?: boolean;
  } | null;
  pharmacySent?: {
    agentName: string | null;
    sentDate: string | null;
  } | null;
  productId?: string | null;
  renewalIntakeSurveyUrl?: string | null;
  assignedAt?: string | null;
  providerId?: string | null;
  patientRemarks?: string | null;
  patientRemarksCreateBy?: string | null;
  patientRemarksCreateByUser?: string | null;
  patientRemarksCreateAt?: string | null;
  updatedAt?: string | null;
  isVisitTypeFlexible?: boolean;
  shipmentReminders?: ShipmentReminder[];
  holdReason?: string | null;
  orderHoldReminderDate?: string | null;
  preferredProviderGroup?: string | null;
  visitTypeTags?: string[];
  concentration?: string | null;
}

const initialState: Order = {};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrder: (_state, action: PayloadAction<Order>) => action.payload,
    setOrderPatient: (state, action: PayloadAction<Order['patient']>) => {
      state.patient = action.payload;
    },
  },
});

export const { setOrder, setOrderPatient } = orderSlice.actions;

export default orderSlice.reducer;
