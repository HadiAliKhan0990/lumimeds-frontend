import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(['approved', 'rejected', 'on_hold'], 'Please select a valid status')
    .required('Status is required'),
  replacementPriceId: Yup.string().when('status', {
    is: 'on_hold',
    then: (schema) => schema.required('Replacement price is required when status is "On Hold"'),
    otherwise: (schema) => schema.notRequired(),
  }),
  remarks: Yup.string()
    .trim()
    .when('status', {
      is: (val: string) => val === 'approved' || val === 'rejected',
      then: (schema) => schema.required('Remarks are required for approve/reject actions'),
      otherwise: (schema) => schema.optional(),
    }),
});

export type ManageRefillRequestValues = Yup.InferType<typeof validationSchema>;
