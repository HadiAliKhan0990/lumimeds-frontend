import * as Yup from 'yup';

export const addressValidationSchema = Yup.object().shape({
  billing_firstName: Yup.string().trim().required('First name is required'),
  billing_lastName: Yup.string().trim().required('Last name is required'),
  billing_zipCode: Yup.string()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits or ZIP+4')
    .required('ZIP code is required'),
  billing_address: Yup.string().trim().required('Address is required'),
  billing_address_2: Yup.string().trim().optional(),
  billing_state: Yup.string().trim().required('State is required'),
  billing_city: Yup.string().trim().required('City is required'),

  sameAsBilling: Yup.boolean().default(false),

  shipping_firstName: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.required('First name is required'),
    }),
  shipping_lastName: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.required('Last name is required'),
    }),
  shipping_zipCode: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) =>
        s.matches(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits or ZIP+4').required('ZIP code is required'),
    }),
  shipping_address: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.required('Address is required'),
    }),
  shipping_address_2: Yup.string().trim().optional(),
  shipping_state: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.required('State is required'),
    }),
  shipping_city: Yup.string()
    .trim()
    .when('sameAsBilling', {
      is: true,
      then: (s) => s.optional(),
      otherwise: (s) => s.required('City is required'),
    }),
});

export type AddressValues = Yup.InferType<typeof addressValidationSchema>;
