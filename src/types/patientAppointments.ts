export interface PatientAppointment {
  id: string;
  providerId: string;
  calendlyEventUri: string;
  scheduledEventUri: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  inviteeUri: string;
  inviteeEmail: string;
  inviteeName: string;
  inviteePhone: string;
  scheduledAt: string;
  endsAt: string;
  status: string;
  provider: PatientAppointmentProvider;
  patient: PatientAppointmentPatient;
  order: PatientAppointmentOrder;
  provider_state: string;
  shipping_state?: string;
  createdAt: string;
}

export interface PatientAppointmentProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: PatientAppointmentAddress;
  phoneNumber?: string;
}

export interface PatientAppointmentAddress {
  state: string;
}

export interface PatientAppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PatientAppointmentOrder {
  id: string;
  status: string;
  productType: PatientAppointmentProductType;
}

export interface PatientAppointmentProductType {
  id: string;
  name: string;
}
