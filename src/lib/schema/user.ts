import * as yup from 'yup';

export const providerUserSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').notRequired(),
  firstName: yup.string().max(15, 'First Name must be less than or equal to 15 characters').required('First Name is required'),
  lastName: yup.string().max(15, 'Last Name must be less than or equal to 15 characters').required('Last Name is required'),
  phoneNumber: yup
    .string()
    .nullable()
    .required('Phone Number is required')
    .transform((value) => (value ? value.replace(/\D/g, '') : value))
    .matches(/^\d{10}$/, {
      message: 'Phone Number must be a valid US phone number (e.g. 1234567890)',
      excludeEmptyString: true,
    }),
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
  isAvailable: yup.boolean().notRequired(),
  npiNumber: yup.string().required().test({
    name: 'npi-number',
    message: 'NPI Number must be less than or equal to 10 characters',
    test: (value) => {


      if (!value) return true;


      return value?.length <= 10;
    },

  }),
  deaNumber: yup.string().required().test({
    name: 'dea-number',
    message: 'DEA Number must be less than or equal to 10 characters',
    test: (value) => {
      if (!value) return true;
      return value?.length <= 10;
    },
  }),
  spiNumber: yup.string().required().test({
    name: 'spi-number',
    message: 'SPI Number must be less than or equal to 10 characters',
    test: (value) => {
      if (!value) return true;
      return value?.length <= 10;
    },
  }),
  addressStreet1: yup.string().required('Address Line 1 is required'),
  addressStreet2: yup.string().optional(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

export type ProviderUserSchema = yup.InferType<typeof providerUserSchema>;
