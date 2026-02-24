import * as Yup from 'yup';

export const editAgentValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .test('not-empty', 'Name cannot be empty or contain only spaces', (value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed.length >= 2 : false;
    }),
  phone: Yup.string()
    .matches(/^\d+$/, 'Phone number must contain only numbers')
    .min(6, 'Phone number must be at least 6 digits')
    .max(15, 'Phone number must be at most 15 digits'),
  isActive: Yup.boolean().required(),
});

export type EditAgentFormValues = Yup.InferType<typeof editAgentValidationSchema>;
