import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  startDate: Yup.date().nullable().required('Start date is required').typeError('Please select a valid start date'),

  endDate: Yup.date()
    .nullable()
    .required('End date is required')
    .typeError('Please select a valid end date')
    .when('startDate', {
      is: (value: Date | null) => value !== null && value !== undefined,
      then: (schema) => schema.min(Yup.ref('startDate'), 'End date must be after or equal to start date'),
    })
    .test('not-future', 'End date cannot be in the future', function (value) {
      if (!value) return true;
      return value <= new Date();
    }),
});

export interface ReportFormValues {
  startDate: Date | null;
  endDate: Date | null;
}
