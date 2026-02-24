'use client';

import toast from 'react-hot-toast';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useResetPasswordMutation } from '@/store/slices/userApiSlice';
import { ResetPasswordSchema, resetPasswordSchema } from '@/lib/schema/resetPassword';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useRouter } from 'next/navigation';
import { RiEyeCloseLine, RiEyeLine } from 'react-icons/ri';
import { ROUTES } from '@/constants';
import { Spinner } from 'react-bootstrap';

interface Props {
  token?: string;
}

export default function ResetPasswordForm({ token = '' }: Readonly<Props>) {
  const { push } = useRouter();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });


  // rename the hook‑returned error so it doesn’t collide
  const [resetPassword, { isLoading, error: apiError }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    // reset,
  } = useForm<ResetPasswordSchema>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: yupResolver(resetPasswordSchema),
  });

  const handleOnSubmit = async (values: ResetPasswordSchema) => {
    startTransition(async () => {
      try {
        // use unwrap() so that RTKQ throws on error
        const { data } = await resetPassword({
          ...values,
          token,
        }).unwrap();

        toast.success('Your password has been reset successfully! You can now log in with your new credentials.', {
          duration: 6000,
        });

        // clear the form
        // reset();
        setErrorMessage(null);

        if (data?.role === 'admin') {
          push(ROUTES.ADMIN_LOGIN);
        } else if (data?.role === 'patient') {
          push(ROUTES.PATIENT_LOGIN);
        } else if (data?.role === 'provider') {
          push(ROUTES.PROVIDER_LOGIN);
        }
      } catch (err) {
        // err is a FetchBaseQueryError | SerializedError
        let message = 'Internal Server Error';
        if ((err as FetchBaseQueryError).data) {
          // server responded with JSON
          const d = (err as FetchBaseQueryError).data as { message?: string };
          message = d.message ?? message;
        } else if ((err as Error).message) {
          // network error or text
          message = (err as Error).message;
        }

        setErrorMessage(message);

        // clear field‑level errors so they don’t show stale messages
        setError('password', { message: '' });
        setError('confirmPassword', { message: '' });
      }
    });
  };

  // pick the message to render: local state wins over hook state
  const fetchError = apiError as FetchBaseQueryError | undefined;
  const apiMessage =
    fetchError && typeof fetchError.data === 'object' && fetchError.data !== null && 'message' in fetchError.data
      ? (fetchError.data as { message?: string }).message
      : undefined;

  const displayMessage = errorMessage ?? apiMessage ?? (apiError as Error)?.message ?? null;

  return (
    <div className='d-flex flex-column align-items-center justify-content-center flex-grow-1 container'>
      <div className='max-w-400'>
        <div className='text-center'>
          <h1 className='text-4xl fw-medium'>Reset Your Password</h1>
          <p className='text-base fw-medium'>Enter your new password below to reset your account.</p>
          {displayMessage && <p className='text-sm text-danger fw-medium'>{displayMessage}</p>}
        </div>
        <form onSubmit={handleSubmit(handleOnSubmit)} className='row g-3'>
          <div className={'col-12'}>
            <label htmlFor='password' className='form-label'>
              New Password
            </label>
            <div className='position-relative'>
              <input
                id='password'
                type={showPassword.password ? 'text' : 'password'}
                placeholder='Enter new password'
                className='form-control shadow-none'
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => ({ ...prev, password: !prev.password }))}
                className='position-absolute top-50 translate-middle-y end-0 me-3 cursor-pointer text-muted border-0 bg-transparent p-0'
                aria-label={`${showPassword.password ? 'Hide' : 'Show'} password`}
              >
                {showPassword.password ? <RiEyeLine size={20} /> : <RiEyeCloseLine size={20} />}
              </button>
            </div>
            {errors.password && <p className='text-sm text-danger fw-medium'>{errors.password.message}</p>}
          </div>

          <div className='col-12'>
            <label htmlFor='confirmPassword' className='form-label'>
              Confirm Password
            </label>
            <div className='position-relative'>
              <input
                id='confirmPassword'
                type={showPassword.confirmPassword ? 'text' : 'password'}
                placeholder='Re-enter password'
                className='form-control shadow-none'
                {...register('confirmPassword')}
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                className='position-absolute top-50 translate-middle-y end-0 me-3 cursor-pointer text-muted border-0 bg-transparent p-0'
                aria-label={`${showPassword.confirmPassword ? 'Hide' : 'Show'} confirm password`}
              >
                {showPassword.confirmPassword ? <RiEyeLine size={20} /> : <RiEyeCloseLine size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-danger fw-medium'>{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className='col-12 pt-3'>
            <button
              type='submit'
              className='btn btn-primary d-flex align-items-center justify-content-center w-100 gap-2 px-3'
              disabled={isLoading || isPending}
            >
              {(isLoading || isPending) && <Spinner className='border-2' size='sm' />}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
