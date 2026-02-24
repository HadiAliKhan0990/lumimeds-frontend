import { Product } from '@/store/slices/medicationsProductsSlice';
import * as Yup from 'yup';

export const validationSchema = Yup.object<FormValues>().shape({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than zero')
    .required('Amount is required'),
  productId: Yup.string().required(),
  priceType: Yup.mixed<Product['priceType']>().oneOf(['payment', 'subscription']),

  billingIntervalCount: Yup.number().when('priceType', {
    is: (priceType: Product['priceType']) => priceType === 'subscription',
    then: (schema) =>
      schema
        .typeError('Interval must be a number')
        .positive('Interval must be greater than zero')
        .required('Billing interval is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export type FormValues = {
  amount: number;
  productId: string;
  priceType?: Product['priceType'];
  billingIntervalCount: number | null;
};
