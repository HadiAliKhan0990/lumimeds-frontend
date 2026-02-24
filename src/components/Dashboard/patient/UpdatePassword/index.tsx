'use client';

import toast from 'react-hot-toast';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { Row, Col, Form as BootstrapForm, Spinner, Button, Container } from 'react-bootstrap';
import { useUpdatePatientProfileMutation, useUpdateUserMutation } from '@/store/slices/userApiSlice';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';
import { User } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { FormValues, validationSchema } from '@/lib/schema/updatePassword';
import { Role } from '@/services/chat/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Props {
  redirect?: string;
  role?: Role;
}

export default function UpdatePassword({ redirect, role = 'patient' }: Readonly<Props>) {
  const router = useRouter();

  const profile = useSelector((state: RootState) => state.patientProfile);
  const { status } = profile?.user || {};

  const [showPassword, setShowPassword] = useState({ newPassword: false, confirmPassword: false });

  const [isPending, startTransition] = useTransition();

  const [updateUserMutation, { isLoading }] = useUpdatePatientProfileMutation();
  const [updateAdminProfile, { isLoading: isAdminLoading }] = useUpdateUserMutation();

  const initialValues: FormValues = { newPassword: '', confirmPassword: '' };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    try {
      const payload = { password: values.newPassword } as User;
      const mutateAsync = role === 'admin' ? updateAdminProfile : updateUserMutation;
      const { success, message } = await mutateAsync(payload).unwrap();

      if (success) {
        toast.success('Password updated successfully');
        resetForm();
        startTransition(() => {
          if (redirect) {
            router.push(decodeURIComponent(redirect));
          } else if (role === 'admin') {
            router.push(ROUTES.ADMIN_ACCOUNT);
          } else if (status === 'pending_submission') {
            router.push(ROUTES.PATIENT_SURVEYS);
          } else {
            router.push(ROUTES.PATIENT_ACCOUNT);
          }
        });
      } else {
        toast.error(message);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data.message || 'Error while updating password!');
      } else {
        toast.error((err as Error).data.message || 'Error while updating password!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className='py-5 mt-5'>
      <Image src={Logo} className='md:tw-max-w-52 tw-mx-auto' quality={100} alt='LumiMeds' />
      <div className='mt-5 max-w-477 w-100 mx-auto'>
        <div className='text-sm'>
          <p className='mb-4 text-xl fw-medium text-center'>
            <span>Please Update your password</span>
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ isSubmitting, isValid }) => (
              <Form>
                <Row className='g-4'>
                  <Col xs={12}>
                    <BootstrapForm.Group controlId='newPassword'>
                      <BootstrapForm.Label className='fw-medium'>New Password</BootstrapForm.Label>

                      <div className='position-relative'>
                        <Field
                          name='newPassword'
                          type={showPassword.newPassword ? 'text' : 'password'}
                          className='shadow-none dark-input border-black pe-5 form-control'
                          placeholder='Enter new password'
                        />
                        <button
                          onClick={() => setShowPassword({ ...showPassword, newPassword: !showPassword.newPassword })}
                          className='position-absolute top-50 translate-middle-y end-0 me-3 cursor-pointer text-muted btn-no-style'
                          type='button'
                        >
                          {showPassword.newPassword ? <RiEyeLine size={20} /> : <RiEyeCloseLine size={20} />}
                        </button>
                      </div>
                      <ErrorMessage component={'div'} name='newPassword' className='text-danger text-xs' />
                    </BootstrapForm.Group>
                  </Col>

                  <Col xs={12}>
                    <BootstrapForm.Group controlId='confirmPassword'>
                      <BootstrapForm.Label className='fw-medium'>Confirm New Password</BootstrapForm.Label>

                      <div className='position-relative'>
                        <Field
                          name='confirmPassword'
                          type={showPassword.confirmPassword ? 'text' : 'password'}
                          className='shadow-none dark-input border-black pe-5 form-control'
                          placeholder='Confirm password'
                        />
                        <button
                          onClick={() =>
                            setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })
                          }
                          className='position-absolute top-50 translate-middle-y end-0 me-3 cursor-pointer text-muted btn-no-style'
                          type='button'
                        >
                          {showPassword.confirmPassword ? <RiEyeLine size={20} /> : <RiEyeCloseLine size={20} />}
                        </button>
                      </div>
                      <ErrorMessage component={'div'} name='confirmPassword' className='text-danger text-xs' />
                    </BootstrapForm.Group>
                  </Col>

                  <Col xs={12} className='text-center'>
                    <Button
                      variant='primary'
                      type='submit'
                      className='rounded-pill px-4 py-12 w-100 fw-bold d-flex align-items-center justify-content-center gap-2'
                      disabled={isSubmitting || isLoading || isAdminLoading || !isValid || isPending}
                    >
                      {(isSubmitting || isLoading || isAdminLoading || isPending) && <Spinner size='sm' />}
                      Update Password
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Container>
  );
}
