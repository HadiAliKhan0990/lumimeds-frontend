import * as yup from 'yup';

export const bodyMetricsSchema = yup.object().shape({
  heightFeet: yup
    .string()
    .matches(/^\d+$/, 'Height (feet) must be a whole number between 1 and 8')
    .test('feet-range', 'Height (feet) must be between 1 and 8', (val) => {
      const num = Number(val);
      return num >= 1 && num <= 8;
    })
    .required('Height (feet) is required'),
  heightInches: yup
    .string()
    .matches(/^\d+$/, 'Height (inches) must be a whole number')
    .test('inches-range', 'Height (inches) must be between 0 and 11', (val) => {
      const num = Number(val);
      return num >= 0 && num <= 11;
    })
    .required('Height (inches) is required'),
  weight: yup
    .number()
    .required('Weight is required')
    .min(65, 'Weight must be at least 65 pounds')
    .max(999, 'Weight cannot exceed 999 pounds')
    .transform(
      (value, originalValue) => (originalValue === '' ? null : value) // Convert "" to null
    ),
  bmi: yup.number().required('BMI is required'),
});

export type BodyMetricsSchema = yup.InferType<typeof bodyMetricsSchema>;
