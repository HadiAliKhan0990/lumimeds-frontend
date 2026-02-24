import * as Yup from 'yup';

export const MAX_REASON_LENGTH = 500;

export const banValidationSchema = Yup.object({
  banReason: Yup.string().max(MAX_REASON_LENGTH, `Reason must be ${MAX_REASON_LENGTH} characters or less`).trim(),
});
