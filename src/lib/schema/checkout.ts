import * as yup from 'yup';
import { generalPhoneSchema } from './pharmacyPatient';







export const checkoutvalidationSchema = yup.object().shape({
  firstName: yup
    .string().when('sameAsShippingAddress', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.trim().required('First Name is required')
        .max(50, 'First Name must be less than 50 characters')
    }),
  shipping_firstName: yup
    .string().trim().required('First Name is required')
    .max(50, 'First Name must be less than 50 characters'),
    
  shipping_lastName: yup
    .string().trim().required('Last Name is required')
    .max(50, 'Last Name must be less than 50 characters'),
  lastName: yup.string().trim().when('sameAsShippingAddress', {
    is: true,
    then: (s) => s.optional(),
    otherwise: (s) => s.trim().required('Last Name is required')
      .max(50, 'Last Name must be less than 50 characters')
  }),
  email: yup.string().trim().email('Invalid email address').required('Email is required'),
  phone: generalPhoneSchema().required('Phone Number is required'),
  zipCode: yup.string().when('sameAsShippingAddress', {
    is: true,
    then: (s) => s.optional(),
    otherwise: (s) => s.trim().required('Zip code is required').
      min(4, 'Zip code must be at least 4 characters')
      .max(5, 'Zip code must be at most 5 characters')
  }),
  billing_address: yup.string().trim().when('sameAsShippingAddress', {
    is: true,
    then: (s) => s.optional(),
    otherwise: (s) => s.trim().required('Billing address is required'),
  }),
  shipping_zipCode: yup
    .string().trim().required('Zip code is required')
    .min(4, 'Zip code must be at least 4 characters')
    .max(5, 'Zip code must be at most 5 characters'),
  billing_city: yup.string().trim().when('sameAsShippingAddress', {
    is: true,
    then: (s) => s.optional(),
    otherwise: (s) => s.trim().required('City is Required'),
  }),
  shipping_city: yup.string().trim().required('City is Required'),
  shipping_address: yup.string().trim().required('Shipping address is required'),
  billing_state: yup.string().trim().when('sameAsShippingAddress', {
    is: true,
    then: (s) => s.optional(),
    otherwise: (s) => s.trim().required('State is required').max(30),
  }),
  shipping_state: yup.string().trim().required('State is required').max(30),
  coupon: yup.string().trim(),
  billing_address2: yup.string().trim().optional(),
  shipping_address2: yup.string().trim().optional(),
  sameAsShippingAddress: yup.boolean().default(true).optional(),
});
 
export type CheckoutvalidationSchema = yup.InferType<typeof checkoutvalidationSchema> & {
  submit?: () => void | Promise<void>;
};