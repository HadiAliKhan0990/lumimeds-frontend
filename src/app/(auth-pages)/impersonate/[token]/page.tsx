'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner, Form, Button, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { ErrorMessage, Field, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  useLazyVerifyImpersonationLinkQuery,
  useCompleteImpersonationMutation,
} from '@/store/slices/impersonationApiSlice';
import { setAuthCookiesClient } from '@/services/auth';
import { ROUTES } from '@/constants';
import { Input } from '@/components/Input';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { FaUserShield, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface FormValues {
  password: string;
}

const passwordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
});

export default function ImpersonatePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [verifyLink, { data: verifyData, isLoading: isVerifying, error: verifyError }] =
    useLazyVerifyImpersonationLinkQuery();
  const [completeImpersonation, { isLoading: isCompleting }] = useCompleteImpersonationMutation();

  const [linkStatus, setLinkStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired'>('loading');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Verify the link on mount
  useEffect(() => {
    if (token) {
      verifyLink(token);
    }
  }, [token, verifyLink]);

  // Update link status based on verification result
  useEffect(() => {
    if (verifyData) {
      if (verifyData.success && verifyData.data?.valid) {
        setLinkStatus('valid');
      } else {
        setLinkStatus('invalid');
      }
    }
    if (verifyError) {
      const errorData = (verifyError as { data?: { message?: string } })?.data;
      if (errorData?.message?.toLowerCase().includes('expired')) {
        setLinkStatus('expired');
      } else {
        setLinkStatus('invalid');
      }
    }
  }, [verifyData, verifyError]);

  // Calculate time remaining
  useEffect(() => {
    if (!verifyData?.data?.expiresAt || linkStatus !== 'valid') return;

    const calculateRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(verifyData.data.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setLinkStatus('expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [verifyData?.data?.expiresAt, linkStatus]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      setSubmitting(true);
      const response = await completeImpersonation({
        token,
        password: values.password,
      }).unwrap();

      if (response.success && response.data?.tokens && response.data?.user) {
        const { accessToken, refreshToken } = response.data.tokens;
        const { role, email } = response.data.user;

        const cookiesSuccess = await setAuthCookiesClient(accessToken, refreshToken);

        if (cookiesSuccess) {
          toast.success(`Successfully logged in as ${email}`);

          // Small delay to ensure cookies are set
          setTimeout(() => {
            if (role === 'patient') {
              router.replace(ROUTES.PATIENT_HOME);
            } else if (role === 'provider') {
              router.replace(ROUTES.PROVIDER_HOME);
            } else {
              router.replace('/');
            }
          }, 100);
        } else {
          toast.error("Impersonation was successful, but we couldn't save your session. Please try again.");
        }
      } else {
        toast.error(response.message || 'Failed to complete impersonation');
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message
        : (error as Error).data?.message || 'Failed to complete impersonation';

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying || linkStatus === 'loading') {
    return (
      <div className='flex-grow-1 d-flex align-items-center justify-content-center container'>
        <div className='text-center'>
          <Spinner animation='border' variant='primary' className='mb-3' />
          <p className='text-muted'>Verifying impersonation link...</p>
        </div>
      </div>
    );
  }

  // Invalid link (not valid)
  if (linkStatus === 'invalid') {
    return (
      <div className='flex-grow-1 d-flex flex-column align-items-center justify-content-center container'>
        <div className='tw-max-w-md text-center'>
          <div className='mb-4'>
            <FaExclamationTriangle size={64} className='text-warning' />
          </div>
          <h2 className='tw-text-3xl tw-font-semibold mb-3'>Invalid Link</h2>
          <p className='text-muted mb-4'>
            This impersonation link is invalid or has already been used. Please request a new link from the admin
            dashboard.
          </p>
          <Button variant='primary' onClick={() => router.push(ROUTES.ADMIN_LOGIN)} className='px-4 py-2'>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // Expired link
  if (linkStatus === 'expired') {
    return (
      <div className='flex-grow-1 d-flex flex-column align-items-center justify-content-center container'>
        <div className='tw-max-w-md text-center'>
          <div className='mb-4'>
            <FaExclamationTriangle size={64} className='text-warning' />
          </div>
          <h2 className='tw-text-3xl tw-font-semibold mb-3'>Link Expired</h2>
          <p className='text-muted mb-4'>
            This impersonation link has expired. Please request a new link from the admin dashboard.
          </p>
          <Button variant='primary' onClick={() => router.push(ROUTES.ADMIN_LOGIN)} className='px-4 py-2'>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // Valid link - show password form
  const { targetUserEmail, targetUserRole, adminEmail } = verifyData?.data || {};

  return (
    <div className='flex-grow-1 d-flex flex-column align-items-center justify-content-center container'>
      <div className='tw-max-w-md'>
        <div className='d-flex justify-content-center mb-3'>
          <h1 className='!tw-flex tw-items-center tw-justify-center badge bg-primary-subtle text-primary px-3 py-2 text-uppercase fw-semibold tw-text-base md:tw-text-lg'>
            <FaUserShield className='me-2' />
            Admin Impersonation
          </h1>
        </div>
        <p className='tw-text-4xl tw-text-center tw-font-medium'>Verify Identity</p>
        <p className='fw-medium text-center text-base mb-4'>Enter your admin password to continue</p>

        <Alert variant='info' className='small mb-4'>
          <div className='mb-2'>
            <strong>Target User:</strong> {targetUserEmail}
          </div>
          <div className='mb-2'>
            <strong>Role:</strong> {targetUserRole === 'patient' ? 'Patient' : 'Provider'}
          </div>
          <div className='mb-2'>
            <strong>Admin:</strong> {adminEmail}
          </div>
          <div className='d-flex align-items-center gap-1'>
            <FaClock size={12} />
            <strong>Expires in:</strong> {timeRemaining}
          </div>
        </Alert>

        <Formik initialValues={{ password: '' }} validationSchema={passwordSchema} onSubmit={handleSubmit}>
          {({ handleSubmit: formikHandleSubmit, isSubmitting }) => (
            <Form onSubmit={formikHandleSubmit}>
              <Form.Group className='mb-3'>
                <Form.Label>Admin Password</Form.Label>
                <Field as={Input} type='password' name='password' placeholder='Enter your admin password' autoFocus />
                <ErrorMessage name='password' className='text-danger small mt-1' component='div' />
              </Form.Group>

              <Button
                type='submit'
                variant='primary'
                className='w-100 d-flex align-items-center justify-content-center gap-2'
                disabled={isSubmitting || isCompleting}
              >
                {(isSubmitting || isCompleting) && <Spinner size='sm' />}
                Login as {targetUserRole === 'patient' ? 'Patient' : 'Provider'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
