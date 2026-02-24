'use client';

import React from 'react';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import PasswordInput from '@/components/Dashboard/PasswordInput';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useUpdateProviderMutation } from '@/store/slices/providersApiSlice';
import { ROUTES } from '@/constants';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';

const InvitedProviderForm = () => {
  const { id } = useParams<{ id: string }>();
  const [updateProviderMutation] = useUpdateProviderMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNo: '',
      password: '',
      confirm_password: '',
    },
  });

  const handleProviderSubmit = ({
    firstName,
    lastName,
    email,
    phoneNo,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    password: string;
  }) => {
    const data = {
      firstName,
      lastName,
      email,
      phoneNo,
      password,
    };

    updateProviderMutation({
      id,
      ...data,
    })
      .then(() => router.push(ROUTES.PROVIDER_LOGIN))
      .catch((err) => console.error(err));
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: '64px',
      }}
    >
      <Image src={Logo} alt='Lumimeds Logo' />
      <div style={{ textAlign: 'center', fontWeight: '700' }}>
        <p style={{ fontSize: '32px' }}>You&apos;ve been Invited to Join LumiMeds</p>
        <p className='m-0' style={{ fontSize: '16px' }}>
          Complete the form below to get started
        </p>
      </div>
      <form
        onSubmit={handleSubmit(handleProviderSubmit)}
        style={{
          display: 'flex',
          width: '30%',
          flexDirection: 'column',
          rowGap: '20px',
        }}
      >
        <div>
          <label htmlFor='firstName'>First Name</label>
          <input type='text' {...register('firstName')} style={{ border: '1px solid #D9D9D9', borderRadius: '8px' }} />
          {!!errors.firstName && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor='lastName'>Last Name</label>
          <input type='text' {...register('lastName')} style={{ border: '1px solid #D9D9D9', borderRadius: '8px' }} />
          {!!errors.lastName && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.lastName.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor='email'>Email address</label>
          <input type='email' {...register('email')} style={{ border: '1px solid #D9D9D9', borderRadius: '8px' }} />
          {!!errors.email && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.email.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor='phoneNo'>Phone No.</label>
          <CustomPhoneInput {...register('phoneNo')} className='form-control' />
          {!!errors.phoneNo && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.phoneNo.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          {/* <input type="password" style={{border:'1px solid #D9D9D9', borderRadius:'8px'}} /> */}
          <PasswordInput {...register('password')} style={{ border: '1px solid #D9D9D9', borderRadius: '8px' }} />
          {!!errors.password && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.password.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor='confirm_password'>Confirm Password</label>
          {/* <input type="password" style={{border:'1px solid #D9D9D9', borderRadius:'8px'}} /> */}
          <PasswordInput
            {...register('confirm_password')}
            style={{ border: '1px solid #D9D9D9', borderRadius: '8px' }}
          />
          {!!errors.confirm_password && (
            <span
              style={{
                color: 'red',
                fontSize: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {errors.confirm_password.message}
            </span>
          )}
        </div>
        <button
          type='submit'
          style={{
            background: 'black',
            color: 'white',
            width: '100%',
            fontWeight: '700',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default InvitedProviderForm;
