import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  billing_firstName: Yup.string().required('First name is required'),
  billing_lastName: Yup.string().required('Last name is required'),
  shipping_firstName: Yup.string().required('First name is required'),
  shipping_lastName: Yup.string().required('Last name is required'),
  
  billing_zipCode: Yup.string()
    .matches(/^[0-9]{4,5}$/, 'ZIP code must be 4 or 5 digits')
    .required('ZIP code is required'),
  
  billing_address: Yup.string().required('Address is required'),
  billing_address_2: Yup.string().optional(),
  billing_state: Yup.string()
    .required('State is required')
    .max(30, 'State should be maximum 30 characters'),
  billing_city: Yup.string().required('City is required'),

  shipping_zipCode: Yup.string()
    .matches(/^[0-9]{4,5}$/, 'ZIP code must be 4 or 5 digits')
    .required('ZIP code is required'),

  shipping_address: Yup.string().required('Address is required'),
  shipping_address_2: Yup.string().optional(),
  shipping_state: Yup.string()
    .required('State is required')
    .max(30, 'State should be maximum 30 characters'),
  shipping_city: Yup.string().required('City is required'),
});

export type FormValues = Yup.InferType<typeof validationSchema>;
