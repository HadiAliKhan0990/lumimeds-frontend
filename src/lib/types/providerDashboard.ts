export interface TelehealthAppointment {
  consultationId: string;
  orderId: string;
  startTime: string;
  endTime: string;
  patient: {
    id: string;
    firstName: string;
    dob: string;
    gender: string;
  };
  rescheduleLink?: string;
}

export interface Message {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  chatRoomId: string;
  notifiedAt?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
  };
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ProviderDashboardStats {
  encounters: {
    pendingToday: number;
    completedInCurrentMonth: number;
  };
  appointments: {
    pendingToday: number;
    completedInCurrentMonth: number;
  };
  approved: {
    today: number;
    inCurrentMonth: number;
  };
  telehealthUpcomingAppointments: TelehealthAppointment[];
  patientMessages: Message[];
  adminMessages: Message[];
  totalUnreadPatientMessages: number;
  totalUnreadAdminMessages: number;
}

export interface ProviderDashboardResponse {
  success: boolean;
  data: ProviderDashboardStats;
  message: string;
}
