import { ResetPasswordSchema } from '@/lib/schema/resetPassword';
import { Role } from '@/services/chat/types';
import { LoginSchema } from '@/lib/schema/login';
import { Address } from '@/store/slices/patientSlice';
import { Address as OrderAddress, OrderStatusType } from '@/store/slices/ordersApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { TransitionStartFunction } from 'react';
import { ChatConversation } from '@/store/slices/chatSlice';
import { Agent } from '@/store/slices/agentApiSlice';
import { RevertedBy } from '@/store/slices/orderSlice';
import { QuestionType } from '@/lib/enums';

export type TableRow =
  | 'CHECKBOX'
  | ''
  | 'ORDER ID'
  | 'INVOICE NO.'
  | 'BILLING REASON'
  | 'PAYMENT DATE'
  | 'AMOUNT'
  | 'PATIENT'
  | 'ORDERS'
  | 'ACTIONS'
  | 'PROVIDER ORDER ID'
  | 'CUSTOMER'
  | 'PROCESS WITH'
  | 'FIRST NAME'
  | 'LAST NAME'
  | 'PHONE NO.'
  | 'EMAIL'
  | 'MEDICATION'
  | 'PLAN'
  | 'COUPON'
  | 'AFFILIATE'
  | 'PHARMACY'
  | 'STATUS'
  | 'DATE & TIME'
  | 'NAME'
  | 'AGENT'
  | 'ID'
  | 'LEADS FROM'
  | 'START DATE'
  | 'END DATE'
  | 'NEXT PAYMENT'
  | 'CODE'
  | 'COMMISSION'
  | 'STATE'
  | 'GENDER'
  | 'AGE'
  | 'TYPE'
  | 'DESCRIPTION'
  | 'PRODUCT'
  | 'PRODUCT DESCRIPTION'
  | 'DOSAGE'
  | 'SCHEDULE'
  | 'NOTES'
  | 'ACTIVE'
  | 'FORM NAME'
  | 'DATE CREATED'
  | 'CREATED BY'
  | 'CREATED AT'
  | 'UPDATED AT'
  | 'ORDER TOTAL'
  | 'TOTAL RESPONSES'
  | 'PRODUCT IMAGE'
  | 'OPENPAY'
  | 'TELEGRA'
  | 'TELEPATH'
  | 'REASON'
  | 'REMARKS'
  | 'SURVEY TYPE'
  | 'ASSIGN TO DOCTOR';

export type OrderStatus =
  | 'Not_Paid'
  | 'Place'
  | 'Assigned'
  | 'Active'
  | 'Disputed'
  | 'Unresponsive'
  | 'Pending'
  | 'Processing'
  | 'Failed'
  | 'On_Hold'
  | 'Confirmed'
  | 'Shipped'
  | 'Out_for_Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded'
  | 'Approved'
  | 'Paid'
  | 'Declined'
  | 'Reverted'
  | 'Rolled_Back'
  | 'Completed'
  | 'Needs_VV'
  | 'Provider_Issue'
  | 'Intake_Missing'
  | 'Pending_Medical_Intake'
  | 'Refill'
  | 'Error'
  | 'Requires_Pending_Intake_Call'
  | 'Pending_Unresponsive';

export type ResetPasswordValues = {
  token: string;
} & ResetPasswordSchema;

export type LoginPayload = {
  role: Role;
} & LoginSchema;

export type ProfileResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isAvailable?: boolean;
  isPaused?: boolean | null;
  user: {
    id: string;
    password: string | null;
  };
  updatedAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    region: string;
    zip: number;
    state: string;
  };
  subscription?: {
    planName: string;
    renewsAt: string;
    subscriptionType?: string | null;
    status: string;
  };
  profileImage?: string;
};

export type PharmacyType = {
  id: string;
  name: string;
  pharmacyType?: 'manual' | 'api';
};

export type OrderProductVariationType = {
  id: string;
  name: string;
  description: string;
};

export type LastRefillRequestDataType = {
  drugStrength: string | null;
  quantityUnits: string | null;
  latestPharmacyOrderStatus: string | null;
  productName: string | null;
};

export type SingleOrder = {
  order: {
    isQueueEligible?: boolean;
    revertedBy?: RevertedBy | null;
    id: string;
    status: OrderStatusType;
    isPaymentSuccessful: boolean;
    pharmacy: string;
    dateOrdered: string;
    uniqueOrderId?: string;
    orderUniqueId?: string;
    productName: string;
    orderTotal: string;
    paymentDate: string;
    trackingNumber: string | null;
    courierService?: string | null;
    orderNumber: string | null;
    processWith: string | null;
    nextRefillDate: string | null;
    remainingDosage: string | null;
    totalDosage: string | null;
    dateReceived: string | null;
    quantity: number | null;
    reason?: string | null;
    productImage: string;
    couponsAmount: string | null;
    paymentMethod: string | null;
    paidAmount: string | null;
    remarks?: string | null;
    currentProductVariation: string;
    productVariations: OrderProductVariationType[];
    pharmacies: PharmacyType[];
    ordersCount: number;
    hasPharmacyOrder?: boolean;
    pharmacyName?: string | null;
    agent?: Agent | null;
    shippedVials?: number;
    nextReminderDate?: string | null;
    isFinalShipment?: boolean;
    type?: 'refill' | 'subscription' | 'renewal';
    lastRefillRequestData?: {
      refillRequestId: string;
      refillDate: string;
      refillRequestProductName: string;
      refillRequestStatus: string;
    } | null;
    latestPatientOrderDrugInfo?: LastRefillRequestDataType | null;
    metaData?: {
      planTier?: string;
      intervalCount?: number;
      billingInterval?: string;
      category?: string;
      planType?: string;
      dosageType?: string;
      medicineType?: string;
      productImage?: string;
      productName?: string;
    };
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
    prescriptionInstructions?: Array<{
      medication?: string;
      dosage?: number;
      daysSupply?: number;
      directions?: string;
      notesToPatient?: string;
      notesToStaff?: string;
      route?: string;
    }>;
    provider?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    address?: OrderAddress;
    patientRemarks?: string | null;
    patientRemarksCreateBy?: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    } | null;
    patientRemarksCreateAt?: string | null;
  };
  patient: {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phone: string;
    phoneNumber?: string;
    role: string;
    bio: {
      height: string;
      weight: string;
      bmi: number;
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
    gender: 'male' | 'female' | 'other';
    medicalHistory: {
      allergies?: string;
      medications?: string;
      medicalConditions: string | null;
      chronicConditions: boolean;
      thyroidCancer: boolean;
      recentBariatricSurgery: boolean;
      type1: boolean;
      cancer: boolean;
      mens2: boolean;
      glp1: boolean;
      glp1Reaction: boolean;
      reactionTo?: string[];
      glp1Details: {
        currentDosage: string;
        lastInjectionDate: string;
        preferredStartDosage: string;
        preferredPharmacy: string;
        threeMonthBulkDelivery: string;
        sixMonthPlanAcknowledged: string;
      };
    };
  };
};

export type PatientSingleOrder = {
  order?: {
    id: string;
    productName: string;
    dosage: string;
    pharmacy: string;
    status: string;
    trackingNumber: number | null;
    orderNumber: string | null;
    processWith: string | null;
    dateReceived: string | null;
    estimatedUseDate: string | null;
    cost: string;
    duration: number;
    quantity: number;
    nextRefillDate: string | null;
    subtotal: number;
    couponAmount: number;
    total: number;
    paidAmount: number;
    datePaid: string | null;
    paymentMethod: string;
    couponCode: string;
    orderNote: string;
    dateOrdered: string;
    image: string | null;
    address?: OrderAddress;
    renewalIntakeSurveyUrl: string | null;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phone: string;
    address?: {
      billingAddress?: {
        firstName?: string;
        lastName?: string;
        street?: string;
        street2?: string;
        city?: string;
        region?: string;
        zip?: number;
        state?: string;
      };
      shippingAddress?: {
        firstName?: string;
        lastName?: string;
        street: string;
        street2?: string;
        city: string;
        region: string;
        zip: number;
        state?: string;
      };
    };
  };
};

export type LicenseType = {
  state: string;
  licenseNumber: string;
  expiryDate: string;
};

export type PatientAnswerType = string | string[] | LicenseType[] | Record<string, unknown> | null;

export type PatientSurveyResponseType = {
  position: number;
  answer: PatientAnswerType;
  options?: string[];
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  isHighlighted?: boolean;
  otherText?: string;
  validation?: PatientSurveyValidationType;
  mapping?: {
    type: string;
    model: string;
    field: string | null;
    tag: string | null;
    isMultiInput?: boolean;
  };
};

export type PatientSurvey = {
  id: string;
  surveyId: string;
  name: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  type: {
    id: string;
    name: string;
    type: string;
  };
  responses: PatientSurveyResponseType[];
};

export type SinglePatient = {
  general?: {
    firstName: string;
    lastName: string;
    gender: string;
    age: number;
    medicineType: string;
    dob: string;
    diagnosis: string;
    requiredTreatment: string;
    status: string;
    previousStatus?: string | null;
    notes?: {
      description: string;
    };
    isBanned: boolean;
    banReason: string | null;
  };
  previousStatus?: string | null;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    zip?: string;
    state?: string;
    billingAddress?: Address;
    shippingAddress?: Address;
  };
  contact?: {
    email: string;
    phone: string;
  };
  medicalHistory?: {
    allergies: string;
    medications: string;
    conditions: string;
    reactionTo?: string[];
  };
  bio?: {
    height: number;
    weight: string;
    bmi: number;
  };
  orderStatus?: string;
  orderId?: string;
  surveys?: {
    data: PatientSurvey[];
    total: number;
  };
};

export type Error = {
  status: number;
  data: {
    success: boolean;
    message: string;
    data: object | null;
    statusCode: number;
  };
};

export type PROCESS_APIS = 'Telegra' | 'Telepath' | 'Lumimeds';

export type PatientSurveyValidationType =
  | 'number'
  | 'text'
  | 'date'
  | 'phone'
  | 'email'
  | 'datetime'
  | 'tags'
  | 'radio'
  | 'checkbox';

export type SurveyAnswer = {
  questionId?: string;
  answer?: string | string[];
  isValid?: boolean;
};

export type PatientSurveyAnswerType = {
  questionId?: string;
  answer?: string | string[] | File;
  isValid?: boolean;
  otherText?: string;
  isRequired?: boolean | null;
};

export type CompletedSurvey = {
  id?: string;
  name?: string;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  responses: PatientSurveyResponseType[];
  submissionMetadata?: {
    orderId?: string;
    uniqueOrderId?: string;
    type?: 'intake' | 'renewal';
  } | null;
  surveyType: {
    id: string;
    name: string;
    type: string;
  };
};

export type TelegraOptions = {
  next: string;
  label: string;
  value: string;
};

export type TelegraSurveyQuestion = {
  id?: string | null;
  options?: string[];
  metaData?: {
    next?: string | null;
    location?: string | null;
    previous?: string | null;
    telegraOptions?: TelegraOptions[];
    questionnaireId?: string | null;
    questionnaireTitle?: string | null;
    isSignature?: boolean;
  };
  position: number;
  isDefault?: boolean | null;
  isRequired?: boolean | null;
  description?: string | null;
  questionText?: string | null;
  questionType?: TelegraQuestionType | string | null;
  validation?: string;
};

export type TelegraAnswerType = {
  questionId: string;
  answer: string | string[] | File;
  isRequired?: boolean;
};

export enum TelegraQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILE_UPLOAD = 'file_upload',
  INPUT_BOX = 'text',
  RADIO = 'radio',
  DROPDOWN = 'single_choice',
}

export type Response = {
  success: boolean;
  message: string | null;
  statusCode: number;
};

export type CardErrorMessage = {
  cardCvc?: string;
  cardNumber?: string;
  cardExpiry?: string;
};

export interface PlanDetails {
  description: string;
  isPopular?: boolean;
  isValueSaver: boolean;
}

export type OptionValue = {
  label: string;
  value: string | number;
};

export type MetaPayload = {
  newEmrFilter?: 'newEmr' | 'telepath' | 'both' | null;
  meta?: SortState['meta'];
  search?: SortState['search'];
  sortField?: SortState['sortField'];
  sortOrder?: SortState['sortOrder'];
  sortStatus?: SortState['sortStatus'];
  subscriptionStatus?: SortState['subscriptionStatus'];
  statusArray?: SortState['statusArray'];
  sortFilter?: SortState['sortFilter'];
  subscriptionType?: SortState['subscriptionType'];
  selectedAgent?: SortState['selectedAgent'];
  pharmacyType?: SortState['pharmacyType'];
  orderFilterType?: SortState['orderFilterType'];
  intervalCount?: SortState['intervalCount'];
  startDate?: string | null;
  endDate?: string | null;
  append?: boolean;
  searchColumn?: SortState['selectedCol'];
  visitType?: SortState['visitType'];
  productType?: SortState['productType'];
};

export type RefillType = 'Order' | 'Subscription';

export type ProductSelectionType = 'pricing' | 'single_prod';

export type CheckoutParams = {
  answers: PatientSurveyAnswerType[];
  questions: SurveyQuestion[];
  patientId: string;
  checkoutType: string;
  priceId: string;
  push: (href: string, options?: NavigateOptions) => void;
  coupon?: string;
  startTransition: TransitionStartFunction;
};

export type IntakeInitialStep = 'initial' | 'intake';

export type Additional = { page?: number };

export type TnotificationType =
  | 'message'
  | 'order_status'
  | 'encounter_expiring'
  | 'batch_reminder'
  | 'order_assign'
  | 'appointment'
  | 'system'
  | 'alert'
  | 'info';
export interface NotificationOrderData {
  conversationId?: string;
  senderName?: string;
  senderRole?: string;
  orderId?: string;
  previousStatus?: string;
  newStatus?: string;
  customerName?: string;
  encounterId?: string;
  patientName?: string;
  expiresAt?: string;
  hoursRemaining?: number;
  visitType?: 'document' | 'video';
  redirectionPath?: string;
}

export interface NotificationMessageData extends NotificationOrderData {
  data: ChatConversation;
}

export interface Notification {
  id: number;
  providerId: string;
  type: TnotificationType;
  title: string;
  message: string;
  data?: NotificationOrderData | NotificationMessageData;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface SingleNotificationResponse extends Response {
  data: Notification;
}

export interface NotificationsListResponse extends Response {
  data: {
    notifications: Notification[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  count: number;
  pendingEncountersCount?: number;
  appointmentsCount?: number;
  approvedCount?: number;
  patientUnreadMessageCount?: number;
  adminUnreadMessageCount?: number;
}
export type PaymentMethod = 'Card' | 'Klarna' | 'Apple Pay' | 'Google Pay';

export type AddressType = {
  firstName: string;
  lastName: string;
  city: string;
  region: string;
  street: string;
  street2?: string;
  zip: string;
  state: string;
};
