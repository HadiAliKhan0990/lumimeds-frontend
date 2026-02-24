export type Appointment = {
  shipping_state?: string | null
  scheduledEventUri?: string | null;
  rescheduledFromEventUri?: string | null;
  calendlyEventUri?: string
  id: string;
  providerId: string | null;
  patientId: string | null;
  inviteeName: string | null;
  inviteeEmail: string | null;
  inviteePhone: string | null;
  scheduledAt: string | null;
  endsAt?: string | null;
  status:
  | 'scheduled'
  | 'pending_confirmation'
  | 'completed'
  | 'patient_no_show'
  | 'doctor_no_show'
  | 'canceled'
  | 'rescheduled'
  | 'reverted'
  | 'Sent_To_Pharmacy'
  | 'Drafted'
  createdAt?: string;
  updatedAt?: string;
  provider_state?: string | null;
  rescheduleUrl?: string | null;
  cancelUrl?: string | null;
  provider?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    provider_state?: string | null;
  } | null;
  patient?: { id: string; firstName?: string; lastName?: string; email?: string | null, phoneNumber?: string | null } | null;
  order?: { id: string; requestedProductName?: string | null; status?: string | null } | null;
};

export type Meta = { total: number; page: number; limit: number; totalPages: number };

export type StatusLabel = Record<Appointment['status'], string>;

export type SortFieldKey = 'createdAt' | 'updatedAt' | 'scheduledAt' | 'inviteeName' | 'inviteeEmail' | 'status';

export interface IPendingrxPatientInfo {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  state: string;
  weight?: number;
  bmi?: string;
  id?: string | number | null;
}

export interface IPendingrxPatientOrederInfo {
  drugName: string;
  prescription: string;
  orderType: string;
}

export interface IPendingrxPatientListInfo {
  id?: string | number | null;
  patientInfo: IPendingrxPatientInfo;
  orderInfo: IPendingrxPatientOrederInfo;
  scheduledAt: string | null;
  rxStatus: 'pending_confirmation' | 'completed' | 'scheduled' | 'canceled' | 'reverted' | 'declined' | 'rescheduled';
  reason?: string | null;
  meetingLink?: string;
  rescheduleLink?: string;
  declineLink?: string;
  createdAt: string | null;
  type?: string;
}
