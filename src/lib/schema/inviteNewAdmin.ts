import * as Yup from 'yup';

export const inviteAdminSchema = Yup.object().shape({
  email: Yup.string().trim().email('Invalid email address').required('Email is required'),
});

export type FormValues = Yup.InferType<typeof inviteAdminSchema>;
