import * as yup from 'yup';

export const providerSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  firstName: yup
    .string()
    .required('First Name is required')
    .max(255, 'First Name must be less than 255 characters'),
  lastName: yup
    .string()
    .required('Last Name is required')
    .max(255, 'Last Name must be less than 255 characters'),
  phoneNumber: yup
    .string()
    .required('Phone Number is required')
    .matches(
      /^\(?([2-9][0-8][0-9])\)?[-.●]?([2-9][0-9]{2})[-.●]?([0-9]{4})$/,
      'Contact Number must be a valid US phone number',
    ),
});

export type ProviderSchema = yup.InferType<typeof providerSchema>;
