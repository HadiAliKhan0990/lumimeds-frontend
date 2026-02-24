import { SortState } from '@/store/slices/sortSlice';

export type CreateMedicineTypePayload = {
  name: string;
  validCategories: string[];
  dosageTypes: string[];
};

export type UpdateMedicineTypePayload = {
  id: string;
  name: string;
  categoryNames: string[];
  dosageTypes: string[];
};

export type MedicineType = {
  id: string;
  name: string;
  validCategories: string[];
  dosageTypes: string[];
  createdAt: string;
  updatedAt: string;
};

export type MedicineTypeData = {
  medicineTypes: MedicineType[];
  meta: SortState['meta'];
};

export type CreateProductTypePayload = {
  category: string;
  planType: string;
  dosageType: string;
  medicineTypeId: string;
  summaryText: string;
};

export type UpdateProductCategoryPayload = {
  id: string;
  category?: string;
  dosageType?: string;
  planType?: PlanType;
  summaryText?: string;
};

export enum BillingInterval {
  MONTH = 'month',
  YEAR = 'year',
}

export enum PlanType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}
