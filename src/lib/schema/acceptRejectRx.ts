import * as yup from 'yup';
import { integerValidator } from './pharmacyPatient';

export const acceptRejectRxSchema = yup.object({
  medication: yup
    .string()
    .required('Medication is required'),
    
  dosage: yup
    .string()
    .required('Dosage is required'),
    
  refills: yup
    .string()
    .test('valid-integer', 'Refills must be a valid integer number', (value) => {
      if (!value) return true;
      return integerValidator(value);
    })
    .required('Refills is required'),
  daysSupply: yup.number().oneOf([30, 60, 90], 'Days supply must be 30, 60 or 90').required('Days supply is required'),
    
  directions: yup
    .string()
    .required('Directions are required'),

  notes: yup
    .string()
    .required('Notes are required'),

  rejectionReason: yup
    .string()
    .optional()
});

export type AcceptRejectRxSchema = yup.InferType<typeof acceptRejectRxSchema>;