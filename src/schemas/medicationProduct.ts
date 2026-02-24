import * as yup from 'yup';
import { OptionValue } from '../lib/types';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PLACEHOLDER = '********';

type FormOption = OptionValue & { isSubmissionRequired?: boolean };

export type FormValues = {
  image?: File | null;
  description?: string;
  openpayProductId?: string;
  telegraId?: string;
  telepathId?: string;
  category?: OptionValue | null;
  intakeFormId?: OptionValue | null;
  refillFormId?: OptionValue | null;
  renewalFormId?: OptionValue | null;
  otherForms?: FormOption[] | null;
  planTier?: string;
  duration?: number;
  isActive?: boolean;
  tagline?: string;
  isIntakeFormRequired?: boolean;
  isRenewalFormRequired?: boolean;

  originalDescription?: string;
  originalOpenpayProductId?: string;
  originalTelegraId?: string;
  originalTelepathId?: string;
};

export type OriginalValues = {
  description: string;
  openpayProductId: string;
  telegraId: string;
  telepathId: string;
};

export const updateMedicationProductSchema = yup.object<FormValues>({
  image: yup
    .mixed<File>()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true;
      return value instanceof File && value.type.startsWith('image/');
    })
    .test('fileSize', 'Max file size allowed is 10 MB', (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    }),

  category: yup
    .object()
    .shape({
      value: yup.string().required('Product Type is required'),
      label: yup.string().required('Product Type is required'),
    })
    .required('Product Type is required'),

  planTier: yup.string().trim(),
  duration: yup.number().required('Duration is required').min(1).max(12),

  // Description validation (unchanged logic)
  description: yup
    .string()
    .test('desc-validate-only-if-changed', 'Description is required and max 50 characters', function (value) {
      const { originalDescription } = this.parent; // Get from parent values
      if (originalDescription && value === originalDescription) {
        return true; // unchanged → skip validation
      }
      if (!value || value.trim().length === 0) {
        return this.createError({ message: 'Description is required' });
      }

      return true;
    }),

  // OpenPay ID validation (unchanged logic)
  openpayProductId: yup
    .string()
    .test('openpay-validate-only-if-changed', 'OpenPay ID must be between 14 and 30 characters', function (value) {
      const { originalOpenpayProductId } = this.parent;
      // If value is exactly the masked placeholder, treat as "unchanged"
      if (value === PLACEHOLDER) {
        return true;
      }
      // If original exists and value matches the original (real) ID, skip validation
      if (originalOpenpayProductId && value === originalOpenpayProductId) {
        return true;
      }
      // If blank ("" or whitespace), it's optional
      if (!value || value.trim().length === 0) {
        return true;
      }
      // Otherwise, enforce length between 14 and 30
      if (value.length < 14) {
        return this.createError({ message: 'Minimum 14 characters are required' });
      }
      if (value.length > 30) {
        return this.createError({ message: 'Max 30 characters are allowed' });
      }
      return true;
    }),

  // Telegra ID validation (unchanged logic)
  telegraId: yup
    .string()
    .test('telegra-validate-only-if-changed', 'TeleGra ID must be between 36 and 41 characters', function (value) {
      const { originalTelegraId } = this.parent;
      if (value === PLACEHOLDER) {
        return true;
      }
      if (originalTelegraId && value === originalTelegraId) {
        return true;
      }
      if (!value || value.trim().length === 0) {
        return true;
      }
      if (value.length < 36) {
        return this.createError({ message: 'Minimum 36 characters are required' });
      }
      if (value.length > 41) {
        return this.createError({ message: 'Max 41 characters are allowed' });
      }
      return true;
    }),

  // Telepath ID validation (unchanged logic)
  telepathId: yup
    .string()
    .test('telepath-validate-only-if-changed', 'TelePath ID must be between 36 and 50 characters', function (value) {
      const { originalTelepathId } = this.parent;
      if (value === PLACEHOLDER) {
        return true;
      }
      if (originalTelepathId && value === originalTelepathId) {
        return true;
      }
      if (!value || value.trim().length === 0) {
        return true;
      }
      if (value.length < 36) {
        return this.createError({ message: 'Minimum 36 characters are required' });
      }
      if (value.length > 50) {
        return this.createError({ message: 'Max 50 characters are allowed' });
      }
      return true;
    }),

  intakeFormId: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .nullable()
    .optional(),

  refillFormId: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .nullable()
    .optional(),

  otherForms: yup
    .array(
      yup.object({
        value: yup.string().required('Other form is required'),
        label: yup.string().required('Other form is required'),
        isSubmissionRequired: yup.boolean().optional(),
      })
    )
    .nullable(),

  tagline: yup.string().trim().nullable(),
  isActive: yup.boolean().required('Status is required'),
  isIntakeFormRequired: yup.boolean().optional(),
  isRenewalFormRequired: yup.boolean().optional(),

  // Hidden fields to store original values for comparison
  originalDescription: yup.string().optional(),
  originalOpenpayProductId: yup.string().optional(),
  originalTelegraId: yup.string().optional(),
  originalTelepathId: yup.string().optional(),
});

export const createMedicationProductSchema = yup.object<FormValues>({
  image: yup
    .mixed<File>()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true;
      return value instanceof File && value.type.startsWith('image/');
    })
    .test('fileSize', 'Max file size allowed is 10 MB', (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    }),

  category: yup
    .object()
    .shape({
      value: yup.string().required('Product Type is required'),
      label: yup.string().required('Product Type is required'),
    })
    .required('Product Type is required'),

  tagline: yup.string().trim().nullable(),
  planTier: yup.string().trim().nullable(),
  duration: yup.number().required('Duration is required').min(1).max(12),
  description: yup.string().required('Description is required').trim(),

  openpayProductId: yup
    .string()
    .nullable()
    .test('min-length', 'Minimum 14 characters are required', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length >= 14;
    })
    .test('max-length', 'Max 30 characters are allowed', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length <= 30;
    }),
  telegraId: yup
    .string()
    .nullable()
    .test('min-length', 'Minimum 36 characters are required', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length >= 36;
    })
    .test('max-length', 'Max 41 characters are allowed', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length <= 41;
    }),

  telepathId: yup
    .string()
    .nullable()
    .test('min-length', 'Minimum 36 characters are required', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length >= 36;
    })
    .test('max-length', 'Max 50 characters are allowed', function (value) {
      if (!value || value.trim().length === 0) return true;
      return value.length <= 50;
    }),

  intakeFormId: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .nullable()
    .optional(),

  refillFormId: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .nullable()
    .optional(),

  renewalFormId: yup
    .object({
      value: yup.string(),
      label: yup.string(),
    })
    .nullable()
    .optional(),

  otherForms: yup
    .array(
      yup.object({
        value: yup.string().required('Other form is required'),
        label: yup.string().required('Other form is required'),
        isSubmissionRequired: yup.boolean().optional(),
      })
    )
    .nullable(),

  isIntakeFormRequired: yup.boolean().optional(),
  isRenewalFormRequired: yup.boolean().optional(),
});
