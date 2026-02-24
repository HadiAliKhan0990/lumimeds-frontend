import * as yup from 'yup';

export const patientNoteSchema = yup.object().shape({
  title: yup.string().optional().max(255, 'Title must be less than 255 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(20000, 'Description must be less than 20,000 characters'),
});

export type PatientNoteSchema = yup.InferType<typeof patientNoteSchema>;
