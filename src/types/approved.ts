// API Response Types
export interface IApprovedRxApiOrder {
  // orderId: string;
  uniqueOrderId: string;
  orderId?: string;
  prescribed: {
    medication: string;
    treatment: Array<{
      id: number;
      name: string;
      dosage: string;
    }>;
  };
  patientDetails: {
    name: string;
    pid: string;
    age: string;
    gender: string;
    weight: string;
    bmi: number;
    location: string;
  };
  prescriptionInstructions?: Array<{
    medication?: string;
    dosage?: number;
    route?: string;
    daysSupply?: number;
    directions?: string;
    notesToPatient?: string;
    notesToStaff?: string;
    dateWritten?: string;
  }>;
  assignedAt: string | null;
  rxStatus: string;
  approvalDate: string;
  approvedBy: string;
}

// UI Types (for existing appointments)
export interface IApprovedRxInfo {
  id: string;
  orderId?: string;
  uniqueOrderId: string;
  prescribed: {
    primary: string;
    treatments: string[];
  };
  patientDetails: {
    name: string;
    pid?: string;
    age: string;
    gender: string;
    weight: string;
    bmi: string;
    location: string;
    id?: string;
    email?: string;
  };
  prescriptionInstructions?: Array<{
    medication?: string;
    dosage?: number;
    route?: string;
    daysSupply?: number;
    directions?: string;
    notesToPatient?: string;
    notesToStaff?: string;
    dateWritten?: string;
  }>;
  assignedAt: string;
  rxStatus: {
    status: string;
    approvedBy: string;
  };
  approvalDate: string;
}

export type ProductTypeFilter = 'weight_loss' | 'longevity';

// Query Parameters Type
export interface IApprovedRxQueryParams {
  search?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  statuses?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  productType?: ProductTypeFilter;
}
