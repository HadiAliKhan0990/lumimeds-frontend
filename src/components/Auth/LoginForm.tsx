'use client';

import toast from 'react-hot-toast';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { setAuthCookiesClient } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { loginSchema, LoginSchema } from '@/lib/schema/login';
import { useLoginUserMutation } from '@/store/slices/userApiSlice';
import { Input } from '@/components/Input';
import { Spinner } from 'react-bootstrap';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { setIsFirstLogin } from '@/store/slices/userSlice';

type Props = {
  role: 'admin' | 'provider' | 'patient';
  homeRoute: string;
  forgotHref: string;
};

export const LoginForm = ({ role = 'admin', homeRoute, forgotHref }: Readonly<Props>) => {
  const { replace } = useRouter();
  const dispatch = useDispatch();

  const [isPending, startTransition] = useTransition();

  const [mutateAsync, { isLoading }] = useLoginUserMutation();

  const handleOnSubmit = async (values: LoginSchema, { setSubmitting }: FormikHelpers<LoginSchema>) => {
    try {
      setSubmitting(true);
      const { data, success, message } = await mutateAsync({ ...values, role }).unwrap();
      if (success) {
        const { isFirstLogin = false } = data || {};
        dispatch(setIsFirstLogin(isFirstLogin));
        const { accessToken = '', refreshToken = '' } = data?.tokens || {};
        const cookiesSuccess = await setAuthCookiesClient(accessToken, refreshToken);
        if (cookiesSuccess) {
          startTransition(() => {
            if (isFirstLogin && role === 'provider') {
              replace(ROUTES.PROVIDER_FIRST_LOGIN_UPDATE);
            } else replace(homeRoute);
          });
        } else {
          toast.error("Your login was successful, but we couldn't save your session. Please try logging in again.");
        }
      } else {
        toast.error(message || 'Login failed. Please try again.');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err) ? err.response?.data.message : (err as Error).data?.message || 'Error while Log in'
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validateOnChange
      validateOnBlur
      validationSchema={loginSchema}
      onSubmit={handleOnSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className='row g-3'>
            <div className='col-12'>
              <label className='form-label' htmlFor='email'>
                Email Address
              </label>
              <Field as={Input} type='text' id='email' name='email' placeholder={'Enter your email address'} />
              <ErrorMessage name='email' className='text-danger text-sm' component={'div'} />
            </div>
            <div className='col-12'>
              <label className='form-label' htmlFor='password'>
                Password
              </label>
              <Field as={Input} type='password' id='password' name='password' placeholder={'Enter your password'} />
              <ErrorMessage name='password' className='text-danger text-sm' component={'div'} />
            </div>
            <div className='col-12 text-end'>
              <Link className='text-base' href={forgotHref}>
                Forgot your password?
              </Link>
            </div>
            <div className='col-12'>
              <button
                className='btn btn-primary
                 d-flex align-items-center justify-content-center w-100 gap-2 px-3'
                type='submit'
                disabled={isSubmitting || isPending || isLoading}
              >
                {(isSubmitting || isPending || isLoading) && <Spinner size='sm' className='border-2' />}
                Login
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
