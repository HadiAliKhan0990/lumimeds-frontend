import * as yup from 'yup';
import { generalPhoneSchema } from './pharmacyPatient';

export const userSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').notRequired(),
  firstName: yup.string().max(15, 'First Name must be less than or equal to 15 characters').notRequired(),
  lastName: yup.string().max(15, 'Last Name must be less than or equal to 15 characters').notRequired(),
  contactNumber: generalPhoneSchema('Phone Number must be a valid US phone number').notRequired(),
  password: yup
    .string()
    .notRequired()
    .test({
      name: 'password-validation',
      message: 'Password must have at least 7 characters, 1 uppercase, 1 lowercase, and 1 special character',
      test: (value) => {
        if (!value) return true;
        return value.length >= 7 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[!@#$%^&*]/.test(value);
      },
    }),
});

export type UserSchema = yup.InferType<typeof userSchema>;
