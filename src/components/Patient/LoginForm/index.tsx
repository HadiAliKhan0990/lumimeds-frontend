'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { setAuthCookiesClient } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { loginSchema, LoginSchema } from '@/lib/schema/login';
import { PatientLoginErrorResponse, useLoginUserMutation } from '@/store/slices/userApiSlice';
import { Input } from '@/components/Input';
import { isAxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setIsFirstLogin } from '@/store/slices/userSlice';
import { Error } from '@/lib/types';
import { Spinner } from 'react-bootstrap';
import { ProductType, setProductType } from '@/store/slices/productTypeSlice';
import { HiExclamation } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnswer } from '@/lib/helper';
import { setAnswers } from '@/store/slices/answersSlice';
import { setCheckoutUser, setSubmissionId } from '@/store/slices/checkoutSlice';
import { RootState } from '@/store';

interface Props {
  redirect?: string;
  email?: string;
  password?: string;
}

export function LoginForm({ redirect, email, password }: Readonly<Props>) {
  const dispatch = useDispatch();
  const { replace, push } = useRouter();

  const submissionId = useSelector((state: RootState) => state.checkout.submissionId || '');

  const initialValues = { email: email || '', password: password || '' };

  const [isPending, startTransition] = useTransition();

  const [mutateAsync, { isLoading }] = useLoginUserMutation();

  function showCheckoutToast(type: 'intake' | 'checkout') {
    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className='alert alert-warning max-w-400 shadow d-flex align-items-start gap-2 mb-0'
            >
              <HiExclamation className='flex-shrink-0' size={32} />
              {type === 'checkout' ? (
                <>
                  Please complete checkout first to get your login credentials, we are redirecting you to checkout form
                  shortly.
                </>
              ) : (
                `Please complete your intake form first to proceed, we'll redirect you to the intake form shortly.`
              )}
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration: 4000 }
    );
  }

  async function handleSubmission(data: PatientLoginErrorResponse['data']['data']) {
    const { submission, token } = data || {};
    const { pendingSubmission, product } = submission || {};
    const { responses = [], survey, submittedByEmail, surveyId = '', submittedById } = pendingSubmission || {};
    const { questions = [] } = survey || {};

    if (token && product) {
      const { prices, ...productData } = product;
      const price = prices?.find((item) => item.isActive);
      if (price) {
        dispatch(
          setProductType({
            ...productData,
            prices: [price],
            surveyId,
            featureText: '',
            createdAt: '',
            updatedAt: '',
            openPayProductId: '',
            refillSurveyId: '',
          } as ProductType)
        );
      }

      if (responses.length > 0) {
        const phone = getAnswer('phone', responses, questions) || '';
        const user = { email: submittedByEmail || '', phone, patientId: submittedById || '' };
        dispatch(setCheckoutUser(user));
        dispatch(setSubmissionId(pendingSubmission?.id));
        showCheckoutToast('checkout');
        startTransition(() =>
          push(`${ROUTES.CHECKOUT}/${token}?priceId=${price?.priceId || ''}&mode=${price?.checkoutType}`)
        );
      }
    } else {
      await dispatch(setAnswers(responses));

      if (submissionId) {
        showCheckoutToast('checkout');
        startTransition(() => push(ROUTES.PRODUCT_SUMMARY));
      } else {
        showCheckoutToast('intake');
        startTransition(() => push(ROUTES.PATIENT_INTAKE));
      }
    }
  }

  async function handleLogin(values: LoginSchema) {
    try {
      const { error, data } = await mutateAsync({
        email: values.email,
        password: values.password,
        role: 'patient',
      });

      if (error) {
        const { data } = error as PatientLoginErrorResponse;

        if (data.data && data.data.submission) {
          handleSubmission(data.data);
        } else {
          toast.error((error as Error).data.message);
        }
      } else {
        const { isFirstLogin = false } = data?.data || {};
        dispatch(setIsFirstLogin(isFirstLogin));
        const { accessToken = '', refreshToken = '' } = data?.data.tokens || {};
        const success = await setAuthCookiesClient(accessToken, refreshToken);
        if (success) {
          startTransition(() => {
            if (isFirstLogin) {
              if (redirect) {
                replace(ROUTES.PATIENT_FIRST_LOGIN_UPDATE + '?redirect=' + redirect);
              } else {
                replace(ROUTES.PATIENT_FIRST_LOGIN_UPDATE);
              }
            } else if (redirect === ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS) {
              replace(decodeURIComponent(redirect));
            } else {
              replace(ROUTES.PATIENT_HOME);
            }
          });
        } else {
          toast.error("Your login was successful, but we couldn't save your session. Please try logging in again.");
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        const { data } = error as PatientLoginErrorResponse;
        if (data && data.data.submission) {
          handleSubmission(data.data);
        } else {
          toast.error('Error while Log in');
        }
      }
    }
  }

  async function handleSubmit(values: LoginSchema, { setSubmitting }: FormikHelpers<LoginSchema>) {
    try {
      setSubmitting(true);

      handleLogin(values);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data.message);
      } else {
        toast.error('Error while Log in');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='tw-flex-grow tw-container tw-px-4 tw-mx-auto tw-flex tw-items-center tw-justify-center'>
      <div className='tw-max-w-md'>
        <div className='d-flex justify-content-center mb-3'>
          <span className='badge bg-primary-subtle text-primary px-3 py-2 text-uppercase fw-semibold tw-text-base md:tw-text-lg'>
            💊 Patient Portal
          </span>
        </div>
        <h1 className='text-4xl text-center fw-medium'>
          Welcome to Your New
          <br />
          Patient Portal!
        </h1>
        <p className='fw-medium text-center text-muted mb-5'>{`We've upgraded your experience`}</p>
        <Formik initialValues={initialValues} validationSchema={loginSchema} enableReinitialize onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <div className='row g-3'>
                <div className='col-12'>
                  <label className='form-label' htmlFor='email'>
                    Email Address
                  </label>
                  <Field type='email' name='email' as={Input} placeholder='Enter your email address' />
                  <ErrorMessage name='email' component={'div'} className='invalid-feedback d-block' />
                </div>
                <div className='col-12'>
                  <label className='form-label' htmlFor='password'>
                    Password
                  </label>
                  <Field type='password' name='password' as={Input} placeholder='Enter your password' />
                  <ErrorMessage name='password' component={'div'} className='invalid-feedback d-block' />
                </div>
                <div className='col-12 text-end'>
                  <Link className='text-base' href='/patient/forgot-password'>
                    Forgot your password?
                  </Link>
                </div>
                <div className='col-12'>
                  <button
                    className='btn btn-primary d-flex align-items-center justify-content-center w-100 gap-2 px-3'
                    type='submit'
                    disabled={isSubmitting || isPending || isLoading}
                  >
                    {(isSubmitting || isPending || isLoading) && <Spinner size='sm' />}
                    Login
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        <br />
        {/* <Card className='p-3 rounded mt-2 bg-light-yellow'>
          <div className='d-flex flex-column border-0 mb-0 p-0'>
            <div className='d-flex align-items-center gap-2'>
              <FaExclamationTriangle size={30} className='text-warning-triangle' />
              <h5 className='my-auto'>Please note</h5>
            </div>

            <div className='mt-3'>
              <p>
                <a href='https://woo.lumimeds.com/' target='_blank' className='text-dark text-decoration-underline'>
                  app.lumimeds.com
                </a>{' '}
                will no longer be accessible after{' '}
                <strong>
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                </strong>
                . Please create or update your account here for continued access to your prescriptions, orders, and
                health info.
              </p>
              <a href='https://app.lumimeds.com' target='_blank' className='text-primary text-decoration-underline'>
                Need Help Navigating?
              </a>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
