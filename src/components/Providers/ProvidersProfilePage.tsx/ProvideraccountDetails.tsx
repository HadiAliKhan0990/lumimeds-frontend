'use client';

import PasswordInput from '@/components/Dashboard/PasswordInput';
import Switch from 'react-switch';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { useStates } from '@/hooks/useStates';
import { providerUserSchema, ProviderUserSchema } from '@/lib/schema/user';
import { removeAuthCookiesClient } from '@/services/auth';
import { useUpdateProviderProfileMutation, useUpdateProviderAvailabilityMutation } from '@/store/slices/userApiSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Error, OptionValue } from '@/lib/types';
import { FiInfo } from 'react-icons/fi';
import { setModal } from '@/store/slices/modalSlice';
import { RootState } from '@/store';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { isAxiosError } from 'axios';
import { shouldShowCalendlyFeature } from '@/helpers/featureFlags';
import NeutralAvatarPng from '@/assets/gender neutral avatar.png';
import Image from 'next/image';
import { Card, Spinner } from 'react-bootstrap';
import { formatProviderName } from '@/lib/utils/providerName';
import ReactSelect from 'react-select';

export const ProvideraccountDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { stateOptions } = useStates();

  const [checked, setChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(undefined);
  const [displayPhoneValue, setDisplayPhoneValue] = useState('');

  const providerProfile = useSelector((state: RootState) => state.user);

  const calendlyState = useSelector((state: RootState) => state.calendly);
  const calendlyStatus = calendlyState.status;
  const isCalendlyLoaded = calendlyState.isLoaded;

  const showCalendly = shouldShowCalendlyFeature(providerProfile?.email);

  const [updateUserMutation, { isLoading }] = useUpdateProviderProfileMutation();
  const [updateAvailabilityMutation, { isLoading: isUpdatingAvailability }] = useUpdateProviderAvailabilityMutation();

  const cleanPhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return '';
    return phoneNumber.replace(/^\+1/, '').replace(/\D/g, '');
  };

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<ProviderUserSchema>({
    defaultValues: {
      phoneNumber: cleanPhoneNumber(providerProfile?.phoneNumber ?? ''),
      email: providerProfile?.email ?? '',
      firstName: providerProfile?.firstName ?? '',
      lastName: providerProfile?.lastName ?? '',
      password: '',
      npiNumber: providerProfile?.npiNumber ?? '',
      deaNumber: providerProfile?.deaNumber ?? '',
      spiNumber: providerProfile?.spiNumber ?? '',
      addressStreet1: providerProfile?.address?.line1 ?? '',
      addressStreet2: providerProfile?.address?.line2 ?? '',
      city: providerProfile?.address?.city ?? '',
      state: providerProfile?.address?.state ?? '',
    },
    resolver: yupResolver(providerUserSchema),
  });

  useEffect(() => {
    if (providerProfile?.id) {
      const cleanPhone = cleanPhoneNumber(providerProfile?.phoneNumber ?? '');

      // Use reset to properly initialize form and clear dirty state
      reset({
        firstName: providerProfile?.firstName ?? '',
        lastName: providerProfile?.lastName ?? '',
        email: providerProfile?.email ?? '',
        phoneNumber: cleanPhone,
        password: '',
        npiNumber: providerProfile?.npiNumber ?? '',
        deaNumber: providerProfile?.deaNumber ?? '',
        spiNumber: providerProfile?.spiNumber ?? '',
        addressStreet1: providerProfile?.address?.line1 ?? '',
        addressStreet2: providerProfile?.address?.line2 ?? '',
        city: providerProfile?.address?.city ?? '',
        state: providerProfile?.address?.state ?? '',
      });

      setDisplayPhoneValue(formatUSPhoneWithoutPlusOne(cleanPhone));
      setIsAvailable(providerProfile?.isAvailable ?? false);
    }
  }, [providerProfile, reset]);

  const handleUpdateAccount = async (data: ProviderUserSchema) => {
    const dirtyKeys = (Object.keys(data) as Array<keyof ProviderUserSchema>).filter((key) => dirtyFields[key]);

    if (dirtyKeys.length === 0) {
      const message =
        "It looks like you haven't made any changes yet. Please update at least one field before clicking 'Update Profile'.";

      toast.error(message, { duration: 6000 });
      return;
    }

    const payload = Object.fromEntries(
      dirtyKeys
        .map((key) => {
          let value = data[key];
          if (key === 'phoneNumber' && value && typeof value === 'string') {
            value = '+1' + value.replace(/\D/g, '');
          }

          return [key, value];
        })
        .filter(([, value]) => value !== undefined && value !== null)
    ) as Partial<ProviderUserSchema>;

    const { addressStreet1, addressStreet2, city, state, ...restPayload } = payload;

    try {
      const { success, message } = await updateUserMutation({
        ...restPayload,
        address: {
          line1: addressStreet1,
          line2: addressStreet2,
          city: city,
          state: state,
        },
      }).unwrap();
      if (success) {
        toast.success('Profile updated successfully!', { duration: 6000 });

        router.refresh();

        setValue('password', '', { shouldDirty: false, shouldTouch: false });
      } else toast.error(message, { duration: 6000 });
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data?.message
          : (err as Error).data.message || 'Error occurred while updating profile'
      );
    }
  };

  const handleAvailabilityChange = async (newAvailability: boolean) => {
    if (!providerProfile?.id) return;

    try {
      const { success, message } = await updateAvailabilityMutation({
        providerId: providerProfile.id,
        isAvailable: newAvailability,
      }).unwrap();

      if (success) {
        setIsAvailable(newAvailability);
        toast.success(
          newAvailability ? 'You are now available for video calls' : 'You are now unavailable for video calls'
        );
        router.refresh();
      } else {
        toast.error(message || 'Failed to update availability status');
      }
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : (err as Error).data.message || 'Failed to update availability status';

      toast.error(message, { duration: 6000 });
    }
  };

  const logout = async () => {
    await removeAuthCookiesClient();
    dispatch({ type: 'RESET' });
    router.push(ROUTES.PROVIDER_LOGIN);
  };

  const stateValue = getValues('state');

  return (
    <Card body className='rounded-12 border-light tw-py-4 tw-px-3'>
      <form onSubmit={handleSubmit(handleUpdateAccount)}>
        <div className='max-w-477 tw-flex tw-flex-col tw-gap-12'>
          <div className='tw-flex tw-items-center tw-gap-4'>
            <Image
              src={NeutralAvatarPng}
              alt='avatar-image'
              width={50}
              height={50}
              className='rounded-circle object-fit-cover'
            />
            <div className='tw-flex tw-flex-col tw-gap-1'>
              <span className='tw-text-sm tw-text-muted'>Profile</span>
              <div className='tw-flex tw-flex-wrap tw-gap-1 tw-font-semibold tw-text-[1.7rem]'>
                {formatProviderName(providerProfile?.firstName, providerProfile?.lastName)}
              </div>
            </div>
          </div>

          <div className='tw-flex tw-flex-col tw-gap-6'>
            <div className='tw-flex tw-flex-wrap tw-gap-4'>
              <div className='tw-flex-grow form-admin-group'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='firstName'>
                  First Name
                </label>
                <input
                  autoComplete='off'
                  type='text'
                  {...register('firstName')}
                  id='firstName'
                  disabled={!providerProfile?.id}
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                  placeholder='First name...'
                />
                {!!errors.firstName && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.firstName.message}</span>
                )}
              </div>
              <div className='tw-flex-grow form-admin-group'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='lastName'>
                  Last Name
                </label>
                <input
                  autoComplete='off'
                  type='text'
                  {...register('lastName')}
                  id='lastName'
                  disabled={!providerProfile?.id}
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                  placeholder='Last name...'
                />
                {!!errors.lastName && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.lastName.message}</span>
                )}
              </div>
            </div>
            <div className=' form-admin-group'>
              <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='email'>
                Email
              </label>
              <input
                autoComplete='off'
                type='email'
                {...register('email')}
                id='email'
                className='form-control form-control-lg text-base rounded-1 shadow-none'
                disabled
                placeholder='example@example.com'
              />
              {!!errors.email && (
                <span className='invalid-feedback d-block text-xs fw-medium'>{errors.email.message}</span>
              )}
              {/* <button>Change</button> */}
            </div>
            <div className='tw-grid tw-grid-cols-12 tw-gap-4'>
              <div className=' form-admin-group tw-col-span-6 sm:tw-col-span-4'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='npiNumber'>
                  NPI Number
                </label>
                <input
                  autoComplete='off'
                  {...register('npiNumber')}
                  id='npiNumber'
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                  maxLength={10}
                />
                {!!errors.npiNumber && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.npiNumber.message}</span>
                )}
                {/* <button>Change</button> */}
              </div>
              <div className=' form-admin-group tw-col-span-6 sm:tw-col-span-4'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='deaNumber'>
                  DEA Number
                </label>
                <input
                  autoComplete='off'
                  {...register('deaNumber')}
                  id='deaNumber'
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                  maxLength={10}
                />
                {!!errors.deaNumber && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.deaNumber.message}</span>
                )}
                {/* <button>Change</button> */}
              </div>
              <div className=' form-admin-group tw-col-span-12 sm:tw-col-span-4'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='spiNumber'>
                  SPI Number
                </label>
                <input
                  autoComplete='off'
                  {...register('spiNumber')}
                  id='spiNumber'
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                  maxLength={10}
                />
                {!!errors.spiNumber && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.spiNumber.message}</span>
                )}
                {/* <button>Change</button> */}
              </div>
            </div>

            <div className=' form-admin-group'>
              <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='addressStreet1'>
                Address Line 1
              </label>
              <input
                autoComplete='off'
                {...register('addressStreet1')}
                id='addressStreet1'
                className='form-control form-control-lg text-base rounded-1 shadow-none'
              />
              {!!errors.addressStreet1 && (
                <span className='invalid-feedback d-block text-xs fw-medium'>{errors.addressStreet1.message}</span>
              )}
              {/* <button>Change</button> */}
            </div>

            <div className=' form-admin-group'>
              <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='addressStreet1'>
                Address Line 2 <span className='tw-text-muted'> (Optional)</span>
              </label>
              <input
                autoComplete='off'
                {...register('addressStreet2')}
                id='addressStreet2'
                className='form-control form-control-lg text-base rounded-1 shadow-none'
              />
              {!!errors.addressStreet2 && (
                <span className='invalid-feedback d-block text-xs fw-medium'>{errors.addressStreet2.message}</span>
              )}
              {/* <button>Change</button> */}
            </div>

            <div className='tw-grid tw-grid-cols-12 tw-gap-4'>
              <div className=' form-admin-group tw-col-span-6'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='city'>
                  City
                </label>
                <input
                  autoComplete='off'
                  {...register('city')}
                  id='city'
                  className='form-control form-control-lg text-base rounded-1 shadow-none'
                />
                {!!errors.city && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.city.message}</span>
                )}
                {/* <button>Change</button> */}
              </div>
              <div className=' form-admin-group tw-col-span-6'>
                <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='state'>
                  State
                </label>

                <ReactSelect
                  options={stateOptions}
                  value={stateValue ? { value: stateValue, label: stateValue } : null}
                  onChange={(option) => {
                    const { value } = option as OptionValue;
                    setValue('state', value as string, {
                      shouldValidate: true,
                      shouldTouch: true,
                      shouldDirty: true,
                    });
                  }}
                  name='state'
                  className='tw-min-h-9'
                  isSearchable
                  placeholder={'Select State'}
                  classNames={{
                    control: () => 'w-100 tw-min-h-9 rounded',
                    indicatorSeparator: () => 'd-none',
                  }}
                  data-name='providerState'
                />
                {!!errors.state && (
                  <span className='invalid-feedback d-block text-xs fw-medium'>{errors.state.message}</span>
                )}
                {/* <button>Change</button> */}
              </div>
            </div>

            <div className=' form-admin-group'>
              <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='phoneNumber'>
                Phone
              </label>
              <input type='hidden' {...register('phoneNumber')} />
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

                  setValue('phoneNumber', cleanPhone, { shouldDirty: true, shouldTouch: true });
                  setDisplayPhoneValue(formattedValue);
                  trigger('phoneNumber');
                }}
                name='phoneNumber'
                id='phoneNumber'
                className='form-control form-control-lg text-base rounded-1 shadow-none'
                placeholder='Phone number'
              />
              {!!errors.phoneNumber && (
                <span className='invalid-feedback d-block text-xs fw-medium'>{errors.phoneNumber.message}</span>
              )}
            </div>
            <div className=' form-admin-group'>
              <label className='form-label tw-font-semibold tw-text-[14px]' htmlFor='password'>
                New Password
              </label>
              <PasswordInput
                autoComplete='new-password'
                {...register('password')}
                id='password'
                className='form-control form-control-lg text-base rounded-1 shadow-none'
                placeholder='*********'
                disabled={!providerProfile?.id}
              />
              {!!errors.password && (
                <span className='invalid-feedback d-block text-xs fw-medium'>{errors.password.message}</span>
              )}
            </div>
            <div
              className='tw-flex tw-flex-wrap tw-gap-2 tw-justify-between'
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <p className='m-0'>Enable two-factor authentication</p>
              <Switch onColor='#3060fe' checked={checked} onChange={(e) => setChecked(e)} />
            </div>
            <div
              className=' tw-flex tw-flex-wrap tw-gap-2 tw-justify-between tw-items-center'
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <p className='m-0 fw-medium'>Available for sync appointments</p>
                <p className='m-0 text-muted small'>Toggle your availability for video consultations</p>
              </div>
              <Switch
                checked={isAvailable ?? false}
                onChange={handleAvailabilityChange}
                disabled={isUpdatingAvailability}
                onColor='#3060fe'
              />
            </div>

            {showCalendly && isCalendlyLoaded && calendlyStatus?.authorized && (
              <div
                className=''
                style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                }}
              >
                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <div className='tw-flex tw-items-center tw-justify-between tw-gap-2'>
                    <p className='m-0 fw-medium tw-leading-5'>Calendly Integration</p>

                    <div className='tw-flex tw-items-start tw-gap-2'>
                      <span className='status-badge active'>Connected</span>
                      <div
                        className='cursor-pointer'
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e9ecef',
                        }}
                        onClick={() => dispatch(setModal({ modalType: 'Connect Calendly' }))}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        role='button'
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            dispatch(setModal({ modalType: 'Connect Calendly' }));
                          }
                        }}
                        aria-label='Calendly Settings'
                      >
                        <FiInfo size={20} />
                      </div>
                    </div>
                  </div>
                  <p className='m-0 text-muted small'>Your Calendly account is connected for appointment scheduling</p>
                </div>
              </div>
            )}

            <button
              type='submit'
              className=' btn btn-primary d-flex align-items-center gap-2 justify-content-center rounded-1'
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && <Spinner size='sm' />}
              Update Profile
            </button>
            <div className='' style={{ display: 'flex', flexDirection: 'column', rowGap: '12px' }}>
              {/* <p className="m-0">Log out</p> */}
              <p className='m-0' style={{ color: '#777E90' }}>
                You will be logged out of this session and will have to log back in.
              </p>
              <button type='button' className='btn btn-outline-danger' onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};
