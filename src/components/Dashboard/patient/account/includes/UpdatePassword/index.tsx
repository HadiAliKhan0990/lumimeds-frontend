'use client';

import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik';
import { ProfileField } from '@/components/Dashboard/patient/account/includes/ProfileField';
import toast from 'react-hot-toast';
import { useUpdatePatientProfileMutation } from '@/store/slices/userApiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { passwordUpdateSchema } from '@/lib/schema/passwordUpdate';
import { isAxiosError } from 'axios';
import { AccountSchema } from '@/lib/schema/account';
import { Error } from '@/lib/types';

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

export default function UpdatePasswordPage() {
  const profile = useSelector((state: RootState) => state.patientProfile);

  const [updatePassword, { isLoading }] = useUpdatePatientProfileMutation();

  const initialValues: FormValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const payload = {
        password: values.newPassword,
      };

      // If your mutation returns { error } like in AccountTab:
      const { success, message } = await updatePassword(payload as FormData | Partial<AccountSchema>).unwrap();

      if (success) {
        toast.success(message);
        resetForm();
      } else {
        toast.error(message);
      }
    } catch (err: unknown) {
      let message = '';
      if (isAxiosError(err)) {
        message = err.response?.data.message;
      }
      message = (err as Error).data?.message || 'An error occurred while updating password!';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className='page-title mb-5 fs-1'>Password & Security</div>
      <Formik initialValues={initialValues} validationSchema={passwordUpdateSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, touched, errors, isValid }) => (
          <Form>
            <div className='mb-2 text-muted fs-5'>Update your Password</div>

            <div className='mb-3'>
              <Field name='newPassword'>
                {({ field }: FieldProps) => <ProfileField {...field} placeholder='New Password' type='password' />}
              </Field>
              {touched.newPassword && errors.newPassword && (
                <span className='invalid-feedback d-block text-sm fw-medium'>{errors.newPassword}</span>
              )}
            </div>

            <div className='mb-4'>
              <Field name='confirmPassword'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} placeholder='Confirm new Password' type='password' />
                )}
              </Field>
              {touched.confirmPassword && errors.confirmPassword && (
                <span className='invalid-feedback d-block text-sm fw-medium'>{errors.confirmPassword}</span>
              )}
            </div>

            <button
              disabled={!profile?.id || isSubmitting || isLoading || !isValid}
              type='submit'
              className='btn btn-primary rounded-pill px-4 py-2 fw-bold'
            >
              Change Password
            </button>

            <div className='col-12 mt-4 text-grey DM-Sans'>
              Profile last updated:{' '}
              {new Date(profile.updatedAt || '').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
