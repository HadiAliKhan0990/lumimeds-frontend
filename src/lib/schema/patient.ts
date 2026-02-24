import * as yup from 'yup';

export const patientSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('First Name is required')
    .max(255, 'First Name must be less than 255 characters'),
  lastName: yup
    .string()
    .trim()
    .required('Last Name is required')
    .max(255, 'Last Name must be less than 255 characters'),
  middleInitial: yup
    .string()
    .trim()
    .required('Middle Initial is required')
    .max(3, 'Middle Initial must be less than 3 characters'),
  email: yup
    .string()
    .trim()
    .email('Invalid email address')
    .required('Email is required')
    .max(255, 'Last Name must be less than 255 characters'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .max(20, 'Phone number must be less than 20 characters'),
  address: yup.object().shape({
    street: yup.string().trim().required('Street is required').max(255, 'Street must be less than 255 characters'),
    unitAdd: yup
      .string()
      .trim()
      .required('Unit Address is required')
      .max(255, 'Unit Address must be less than 255 characters'),
    city: yup.string().trim().required('City is required').max(255, 'City must be less than 255 characters'),
    zip: yup
      .string()
      .trim()
      .required('Zip code is required')
      .min(4, 'Zip code must be at least 4 characters')
      .max(5, 'Zip code must be at most 5 characters'),
  }),
});

export type PatientSchema = yup.InferType<typeof patientSchema>;
