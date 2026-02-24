import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  categories: Yup.array().min(1, 'Select at least one category').required('Product categories are required'),
  dosageTypes: Yup.array().min(1, 'Select at least one dosage type').required('Dosage types are required'),
});
