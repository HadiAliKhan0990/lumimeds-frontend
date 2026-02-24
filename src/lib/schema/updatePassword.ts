import * as yup from 'yup';

export const validationSchema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .test({
      name: 'password-validation',
      message: 'Password must have at least 7 characters, 1 uppercase, 1 lowercase, and 1 special character',
      test: (value) => {
        if (!value) return false;
        return value.length >= 7 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[!@#$%^&*]/.test(value);
      },
    }),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export type FormValues = yup.InferType<typeof validationSchema>;
