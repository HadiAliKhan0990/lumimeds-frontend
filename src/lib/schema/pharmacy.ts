import { object, string, InferType } from 'yup';

const PHARMACY_NAME_MAX = 30;

export const pharmacySchema = object({
  name: string().trim().required('Pharmacy Name is required').max(PHARMACY_NAME_MAX, `Pharmacy Name must be at most ${PHARMACY_NAME_MAX} characters`),
});

export type PharmacySchema = InferType<typeof pharmacySchema>;
