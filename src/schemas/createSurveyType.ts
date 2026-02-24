import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string().trim().max(30, 'Name must be 30 characters or less').required('Can’t add if field is empty'),
});

export type CreateSurveyTypeValues = Yup.InferType<typeof validationSchema>;
