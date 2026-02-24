import { AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validatePrescriptionForm = (values: Partial<AcceptRejectRxSchema> & { route?: string }): ValidationResult => {
  const errors: Record<string, string> = {};

  // Only medication and dosage are required
  if (!values.medication || values.medication.trim() === '') {
    errors.medication = 'Medication is required';
  }

  if (!values.dosage || values.dosage.trim() === '') {
    errors.dosage = 'Dosage is required';
  }

  // Route is required when medication is NAD
  if (values.medication && values.medication.toLowerCase() === 'nad') {
    if (!values.route || values.route.trim() === '') {
      errors.route = 'Route is required for NAD';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
