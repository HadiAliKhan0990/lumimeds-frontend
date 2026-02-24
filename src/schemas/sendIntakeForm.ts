import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  orderId: Yup.string().nullable(),
  surveyIds: Yup.array().of(Yup.string()).min(1, 'At least one intake form must be selected'),
});

export type SendIntakeFormValues = {
  orderId: string | null;
  surveyIds: string[];
};
