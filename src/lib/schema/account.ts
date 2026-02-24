import * as yup from 'yup';
import { generalPhoneSchema } from './pharmacyPatient';

export const accountSchema = yup.object({
  email: yup.string().notRequired(),
  firstName: yup.string().max(15, 'First Name must be less than or equal to 15 characters').notRequired(),
  lastName: yup.string().max(15, 'Last Name must be less than or equal to 15 characters').notRequired(),
  phoneNumber: generalPhoneSchema('Enter a valid US phone number (e.g., (123) 456-7890 or 123-456-7890)')
    .notRequired(),
  password: yup
    .string()
    .notRequired()
    .test({
      name: 'password-validation',
      message: 'Password must have at least 7 characters, 1 uppercase, 1 lowercase, and 1 special character',
      test: (value) => {
        if (!value) return true;
        if (value === '********') return true;
        return value.length >= 7 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[!@#$%^&*]/.test(value);
      },
    }),
  region: yup.string().notRequired(),
  street: yup.string().notRequired(),
  street2: yup.string().optional(),
  city: yup.string().notRequired(),
  state: yup.string().max(15).notRequired(),
  zip: yup
    .string()
    .min(4, 'Zip code must be at least 4 characters')
    .max(5, 'Zip code must be at most 5 characters')
    .notRequired(),
});

export type AccountSchema = yup.InferType<typeof accountSchema>;
