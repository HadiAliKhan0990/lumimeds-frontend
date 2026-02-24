'use client';

import Switch from 'react-switch';
import PasswordInput from '@/components/Dashboard/PasswordInput';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants';
import { removeAuthCookiesClient } from '@/services/auth';
import { userSchema, UserSchema } from '@/lib/schema/adminAccount';
import { useUpdateUserMutation } from '@/store/slices/userApiSlice';
import { isAxiosError } from 'axios';
import { AppDispatch, RootState } from '@/store';
import { Error } from '@/lib/types';
import { setUser } from '@/store/slices/userSlice';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const profile = useSelector((state: RootState) => state.user);

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [isLoggingOut, startTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [displayPhoneValue, setDisplayPhoneValue] = useState('');

  const cleanPhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return '';
    return phoneNumber.replace(/^\+1/, '').replace(/\D/g, '');
  };

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    trigger,
    formState: { errors, dirtyFields, isValid, isSubmitting },
  } = useForm<UserSchema>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: cleanPhoneNumber(profile?.contactNumber ?? ''),
      password: '',
    },
    resolver: yupResolver(userSchema),
    mode: 'onChange',
  });

  const onSubmit = async (formData: UserSchema) => {
    // only send dirty keys
    const keys = (Object.keys(formData) as Array<keyof UserSchema>).filter((k) => dirtyFields[k]);
    const payload = Object.fromEntries(
      keys
        .map((key) => {
          let value = formData[key];
          if (key === 'contactNumber' && value && typeof value === 'string') {
            value = '+1' + value.replace(/\D/g, '');
          }
          return [key, value];
        })
        .filter(([, value]) => value !== undefined && value !== null)
    ) as Partial<UserSchema>;

    try {
      const { success, message, data } = await updateUser(payload).unwrap();
      if (success) {
        setErrorMessage(null);
        toast.success(message);
        dispatch(setUser({ ...data, role: 'admin' }));

        // Update form with returned data
        const { firstName, lastName, email, contactNumber } = data;
        reset(undefined, { keepDirty: false });
        setValue('firstName', firstName);
        setValue('lastName', lastName);
        setValue('email', email);
        const cleanPhone = cleanPhoneNumber(contactNumber ?? '');
        setValue('contactNumber', cleanPhone);
        setDisplayPhoneValue(formatUSPhoneWithoutPlusOne(cleanPhone));
      } else {
        setErrorMessage(message);
        toast.error(message);
      }
    } catch (res) {
      const msg = isAxiosError(res) ? res.response?.data?.message : (res as Error).data.message || 'Update failed';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const logout = () => {
    startTransition(async () => {
      await removeAuthCookiesClient();
      dispatch({ type: 'RESET' });
      router.push(ROUTES.ADMIN_LOGIN);
    });
  };

  // Populate form & display state when `data` arrives
  useEffect(() => {
    if (!profile?.id) return;
    setValue('firstName', profile.firstName ?? '');
    setValue('lastName', profile.lastName ?? '');
    setValue('email', profile.email ?? '');

    // Clean and format phone number
    const cleanPhone = cleanPhoneNumber(profile.contactNumber ?? '');
    setValue('contactNumber', cleanPhone);
    setDisplayPhoneValue(formatUSPhoneWithoutPlusOne(cleanPhone));
  }, [profile, setValue]);

  return (
    <form className='max-w-477' onSubmit={handleSubmit(onSubmit)}>
      <h1 className='tw-text-lg tw-font-medium tw-mb-4 d-none d-lg-block'>Admin Account Details</h1>

      {errorMessage && <p className='invalid-feedback d-block mb-3 text-capitalize'>{errorMessage}</p>}

      <div className='d-flex flex-column gap-4'>
        {/* First Name */}
        <div className='form-admin-group'>
          <label htmlFor='firstName' className='form-label'>
            First Name
          </label>
          <input
            {...register('firstName')}
            id='firstName'
            type='text'
            disabled={!profile?.id}
            placeholder='First name...'
            className='form-control form-control-lg text-base rounded-1 shadow-none'
          />
          {errors.firstName && (
            <span className='invalid-feedback d-block text-xs fw-medium'>{errors.firstName.message}</span>
          )}
        </div>

        {/* Last Name */}
        <div className='form-admin-group'>
          <label htmlFor='lastName' className='form-label'>
            Last Name
          </label>
          <input
            {...register('lastName')}
            id='lastName'
            type='text'
            disabled={!profile?.id}
            placeholder='Last name...'
            className='form-control form-control-lg text-base rounded-1 shadow-none'
          />
          {errors.lastName && (
            <span className='invalid-feedback d-block text-xs fw-medium'>{errors.lastName.message}</span>
          )}
        </div>

        {/* Email (read‑only) */}
        <div className='form-admin-group'>
          <label htmlFor='email' className='form-label'>
            Email
          </label>
          <input
            {...register('email')}
            id='email'
            type='email'
            disabled
            placeholder='example@example.com'
            className='form-control form-control-lg text-base rounded-1 shadow-none'
          />
          {errors.email && <span className='invalid-feedback d-block text-xs fw-medium'>{errors.email.message}</span>}
        </div>

        {/* Contact Number: formatted display + raw value */}
        <div className='form-admin-group'>
          <label htmlFor='contactNumber' className='form-label'>
            Mobile Number
          </label>
          <input type='hidden' {...register('contactNumber')} />
          <CustomPhoneInput
            value={displayPhoneValue}
            onChange={(e) => {
              const formattedValue = e.target.value;

              const digitsOnly = formattedValue.replace(/\D/g, '');

              let cleanPhone = digitsOnly;
              if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
                cleanPhone = digitsOnly.slice(1);
              }

              cleanPhone = cleanPhone.slice(0, 10);

              setValue('contactNumber', cleanPhone, { shouldDirty: true, shouldTouch: true });
              setDisplayPhoneValue(formattedValue);
              trigger('contactNumber');
            }}
            name='contactNumber'
            id='contactNumber'
            className='form-control form-control-lg text-base rounded-1 shadow-none'
            placeholder='Phone number'
          />
          {errors.contactNumber && (
            <span className='invalid-feedback d-block text-xs fw-medium'>{errors.contactNumber.message}</span>
          )}
        </div>

        {/* Password */}
        <div className='form-admin-group'>
          <label htmlFor='password' className='form-label'>
            Password
          </label>
          <PasswordInput
            {...register('password')}
            id='password'
            autoComplete='new-password'
            disabled={!profile?.id}
            placeholder='*********'
            className='form-control form-control-lg text-base rounded-1 shadow-none'
          />
          {errors.password && (
            <span className='invalid-feedback d-block text-xs fw-medium'>{errors.password.message}</span>
          )}
        </div>

        {/* Two‑factor */}
        <div className='d-flex justify-content-between'>
          <p className='m-0'>Enable two-factor authentication</p>
          <Switch checked={checked} onChange={setChecked} />
        </div>

        {/* Save */}
        <button
          type='submit'
          className='btn btn-primary d-flex align-items-center gap-2 justify-content-center rounded-1'
          disabled={!isValid || isLoading || isSubmitting}
        >
          {(isSubmitting || isLoading) && <Spinner />}
          Save Changes
        </button>

        {/* Logout */}
        <div className='d-flex flex-column gap-3'>
          <p className='m-0 text-secondary'>You will be logged out and need to log back in.</p>
          <button
            type='button'
            className='btn btn-light border-danger text-danger'
            disabled={isLoggingOut}
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </div>
    </form>
  );
}
