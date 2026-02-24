import { PlanType } from '@/types/medications';
import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  medicineType: Yup.object()
    .shape({
      value: Yup.string().required('Medicine type is required'),
      label: Yup.string().required('Medicine type is required'),
    })
    .required('Medicine type is required'),
  category: Yup.object()
    .shape({
      value: Yup.string().required('Category is required'),
      label: Yup.string().required('Category is required'),
    })
    .required('Category is required'),
  dosageType: Yup.object()
    .shape({
      value: Yup.string().required('Dosage type is required'),
      label: Yup.string().required('Dosage type is required'),
    })
    .required('Dosage type is required'),
  planType: Yup.string()
    .oneOf([PlanType.ONE_TIME, PlanType.RECURRING], 'Invalid plan type')
    .required('Plan type is required'),
  summaryText: Yup.string().required('Summary text is required').max(500, 'Summary text cannot exceed 500 characters'),
});
