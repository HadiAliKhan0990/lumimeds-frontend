import * as yup from 'yup';

export const surveySchema = yup.object().shape({
  name: yup.string().required('Form Name is required').max(255, 'Form Name must be less than 255 characters'),
  typeId: yup.string().required('Form Type is required'),
});

export type SurveySchema = yup.InferType<typeof surveySchema>;
