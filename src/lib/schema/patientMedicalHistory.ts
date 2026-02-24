import * as yup from 'yup';

export const patientMedicalHistorySchema = yup.object().shape({
  allergies: yup.string().max(255, 'Allergies must be less than 255 characters'),
  medicalConditions: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required('Label is required').max(255, 'Label must be less than 255 characters'),
        value: yup.string().required('Value is required').max(255, 'Value must be less than 255 characters'),
      })
    )
    .min(1, 'At least one medical condition is required')
    .required('Medical Conditions is required'),
  otherCondition: yup.string().when('medicalConditions', {
    is: (medicalConditions: Array<{ label: string; value: string }> = []) =>
      Array.isArray(medicalConditions) && medicalConditions.some((condition) => condition.value === 'Other'),
    then: (schema) => schema.required('Please specify the other condition'),
    otherwise: (schema) => schema.notRequired(),
  }),
  medications: yup.string().max(255, 'Medications must be less than 255 characters'),
  reactionTo: yup.array().of(yup.string().max(255, 'Each reaction must be less than 255 characters')).optional(),
  // chronicConditions: yup.boolean().required("Chronic Conditions is required"),
});

export type PatientMedicalHistorySchema = yup.InferType<typeof patientMedicalHistorySchema>;
