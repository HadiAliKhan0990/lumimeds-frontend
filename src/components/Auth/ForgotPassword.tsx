'use client';

import toast from 'react-hot-toast';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForgotPasswordMutation } from '@/store/slices/userApiSlice';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/lib/schema/forgotPassword';
import { Role } from '@/services/chat/types';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { Spinner } from 'react-bootstrap';

interface Props {
  role: Role;
  backLink: string;
}

export function ForgotPassword({ role, backLink }: Readonly<Props>) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mutateAsync, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handleOnSubmit = async ({ email }: ForgotPasswordSchema) => {
    try {
      setErrorMessage(null)
      const { success, message } = await mutateAsync({
        email,
        role,
      }).unwrap();

      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (err) {
      setErrorMessage(
        isAxiosError(err) ? err.response?.data.message : (err as Error).data.message ?? 'Error while resetting password'
      );
      setError('email', { message: '' });
    }
  };

  return (
    <div
      className={
        'd-flex flex-column align-items-center justify-content-center flex-grow-1 tw-container tw-mx-auto tw-px-4'
      }
    >
      <div className='max-w-400'>
        <h1 className='tw-text-3xl md:tw-text-4xl text-center fw-medium'>Forgot Your Password?</h1>
        <p className={'text-base text-center fw-medium mb-4'}>
          No worries! Enter your email below and we&apos;ll send you instructions to reset your password.
        </p>
        {errorMessage && <p className={'text-sm text-danger fw-medium'}>{errorMessage}</p>}
        <form onSubmit={handleSubmit(handleOnSubmit)} className={'w-100'}>
          <label htmlFor='email' className={'form-label'}>
            Email Address
          </label>
          <input className='form-control text-base shadow-none' {...register('email')} />
          {!!errors.email && (
            <span className={'text-sm text-danger fw-medium align-self-start'}>{errors.email.message}</span>
          )}
          <div className='pt-4 d-flex flex-column gap-3 align-items-center'>
            <button
              className='rounded-2 btn btn-primary d-flex align-items-center gap-2 justify-content-center w-100'
              disabled={isLoading}
              type='submit'
            >
              {isLoading && <Spinner size='sm' className='border-2' />}
              Send Reset Link
            </button>
            <Link href={backLink}>Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
