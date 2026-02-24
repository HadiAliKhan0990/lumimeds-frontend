import * as yup from 'yup';

export const addressSchema = yup.object().shape({
  street: yup.string().trim().required('Address is required').max(255, 'Address must be less than 255 characters'),
  street2: yup.string().trim().optional(),
  state: yup.string().trim().required('State is required').max(255, 'State must be less than 255 characters'),
  city: yup.string().trim().required('City is required').max(255, 'City must be less than 255 characters'),
  zip: yup
    .string()
    .trim()
    .required('Zip code is required')
    .min(4, 'Zip code must be at least 4 characters')
    .max(5, 'Zip code must be at most 5 characters'),
});

export type AddressSchema = yup.InferType<typeof addressSchema>;
