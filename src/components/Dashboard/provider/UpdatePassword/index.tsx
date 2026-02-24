'use client';

import toast from 'react-hot-toast';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { Row, Col, Form as BootstrapForm, Spinner, Button, Container } from 'react-bootstrap';
import { useUpdateProviderProfileMutation } from '@/store/slices/userApiSlice';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';
import { User } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { validationSchema, FormValues } from '@/lib/schema/updatePassword';

interface Props {
  redirect?: string;
}

export default function UpdatePassword({ redirect }: Readonly<Props>) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [updateUserMutation, { isLoading }] = useUpdateProviderProfileMutation();

  const initialValues: FormValues = { newPassword: '', confirmPassword: '' };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setSubmitting(true);
    try {
      const payload = { password: values.newPassword } as User;
      const { success, message } = await updateUserMutation(payload).unwrap();

      if (success) {
        toast.success(message);
        startTransition(() => {
          if (redirect) {
            router.push(redirect);
          } else {
            router.push(ROUTES.PROVIDER_HOME);
          }
        });
      } else {
        toast.error(message);
      }
    } catch (err) {
      toast.error(
        isAxiosError(err) ? err.response?.data.message : (err as Error).data.message ?? 'Error while updating password'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className='py-5 mt-5'>
      <Image src={Logo} className='update-password-logo tw-mx-auto' quality={100} alt='LumiMeds' />
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
                          type={showPassword ? 'text' : 'password'}
                          className='shadow-none dark-input border-black pe-5 form-control'
                          placeholder='Enter new password'
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className='position-absolute top-50 translate-middle-y end-0 me-3 cursor-pointer text-muted'
                        >
                          {showPassword ? <RiEyeLine size={20} /> : <RiEyeCloseLine size={20} />}
                        </span>
                      </div>
                      <ErrorMessage component={'div'} name='newPassword' className='text-danger text-xs' />
                    </BootstrapForm.Group>
                  </Col>

                  <Col xs={12}>
                    <BootstrapForm.Group controlId='confirmPassword'>
                      <BootstrapForm.Label className='fw-medium'>Confirm New Password</BootstrapForm.Label>
                      <Field
                        name='confirmPassword'
                        type='password'
                        className='shadow-none dark-input border-black form-control'
                        placeholder='Confirm password'
                      />
                      <ErrorMessage component={'div'} name='confirmPassword' className='text-danger text-xs' />
                    </BootstrapForm.Group>
                  </Col>

                  <Col xs={12} className='text-center'>
                    <Button
                      variant='primary'
                      type='submit'
                      className='rounded-pill px-4 py-12 w-100 fw-bold d-flex align-items-center justify-content-center gap-2'
                      disabled={isSubmitting || isLoading || !isValid || isPending}
                    >
                      {(isSubmitting || isLoading || isPending) && <Spinner size='sm' />}
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
