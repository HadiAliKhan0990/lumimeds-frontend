import * as Yup from 'yup';

export const addNewSurveySchema = Yup.object({
  name: Yup.string().trim().required('Form Name is required').max(255, 'Form Name must be less than 255 characters'),
  typeId: Yup.string().trim().required('Form Type is required'),
});

export type AddNewSurveyValues = Yup.InferType<typeof addNewSurveySchema>;
