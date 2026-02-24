import * as yup from 'yup';

export const cancellationReasonSchema = yup.object().shape({
  reasons: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least one reason for cancellation')
    .required('Cancellation reason is required'),
  reason: yup
    .string()
    .when('reasons', {
      is: (reasons: string[]) => reasons && reasons.includes('Other'),
      then: (schema) => schema.required('Please provide your reason for cancellation'),
      otherwise: (schema) => schema.optional(),
    })
    .max(500, 'Reason must be less than 500 characters'),
  productExperienceRating: yup
    .number()
    .min(1, 'Please rate your product experience')
    .max(5, 'Rating must be between 1 and 5')
    .required('Product experience rating is required'),
  additionalComments: yup
    .string()
    .optional()
    .max(500, 'Additional comments must be less than 500 characters'),
});

export type CancellationReasonSchema = yup.InferType<typeof cancellationReasonSchema>;

// Predefined cancellation reasons
export const CANCELLATION_REASONS = [
  'Too expensive',
  'Not seeing expected results',
  'Side effects / concerns',
  'Switching to another provider',
  'Pausing treatment',
  'Other',
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number];
