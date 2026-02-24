import * as yup from 'yup';

export const shippingAddressSchema = yup.object().shape({
  firstName: yup.string().trim().required('First Name is required'),
  lastName: yup.string().trim().required('Last Name is required'),
  street: yup.string().trim().required('Street is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  zip: yup
    .string()
    .trim()
    .required('Zip Code is required')
    .min(4, 'Zip Code must be at least 4 characters')
    .max(5, 'Zip Code must be at most 5 characters'),
  region: yup.string().trim().required('Country/Region is required'),
  street2: yup.string().trim().optional(),
});
