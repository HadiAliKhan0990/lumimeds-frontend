'use client';

import { Field, FieldProps, useFormikContext } from 'formik';
import { Spinner } from 'react-bootstrap';
import { ProfileField } from '@/components/Dashboard/patient/account/includes/ProfileField';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AccountSchema } from '@/lib/schema/account';
import {
  CustomInputFloating,
  custonmPhoneInputOnChange,
  custonmPhoneInputOnKeyChange,
} from '@/components/elements/Inputs/CustomPhoneInput';

interface Props {
  handleClickCancelAction: () => void;
  isLoading: boolean;
}

export const AccountEditForm = ({ handleClickCancelAction, isLoading }: Props) => {
  const profile = useSelector((state: RootState) => state.patientProfile);
  const { values, setFieldValue, touched, errors, handleBlur } = useFormikContext<AccountSchema>();

  return (
    <div className='row g-4'>
      <div className='col-12 text-end mb-2'>
        <button
          type='button'
          onClick={handleClickCancelAction}
          className='text-dark text-decoration-underline fw-bold bg-transparent p-0 tw-text-base'
        >
          Cancel
        </button>
      </div>
      <div className='col-md-6'>
        <Field name='firstName'>
          {({ field }: FieldProps) => (
            <ProfileField {...field} disabled={!profile?.id} placeholder='First Name' type='text' />
          )}
        </Field>
        {touched.firstName && errors.firstName && (
          <span className='invalid-feedback d-block text-sm fw-medium'>{errors.firstName}</span>
        )}
      </div>
      <div className='col-md-6'>
        <Field name='lastName'>
          {({ field }: FieldProps) => (
            <ProfileField {...field} disabled={!profile?.id} placeholder='Last Name' type='text' />
          )}
        </Field>
        {touched.lastName && errors.lastName && (
          <span className='invalid-feedback d-block text-sm fw-medium'>{errors.lastName}</span>
        )}
      </div>
      <div className='col-md-6'>
        <ProfileField disabled value={profile?.email} placeholder='Email' type='email' />
      </div>
      <div className='col-md-6'>
        <Field name='phoneNumber'>
          {({ field }: FieldProps) => (
            <CustomInputFloating
              {...field}
              placeholder='PhoneNumber'
              type='tel'
              disabled={!profile?.id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // const formatted = formatUSPhone(e.target.value);

                const formattedPhone = custonmPhoneInputOnChange(e);

                setFieldValue('phoneNumber', formattedPhone);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                // const formatted = formatUSPhone(e.target.value);
                const formattedPhone = custonmPhoneInputOnChange(e);

                setFieldValue('phoneNumber', formattedPhone);
                handleBlur(e);
              }}
              value={values.phoneNumber || ''}
              onKeyDown={custonmPhoneInputOnKeyChange}
            />
          )}
        </Field>
        {touched.phoneNumber && errors.phoneNumber && (
          <span className='invalid-feedback d-block text-sm fw-medium'>{errors.phoneNumber}</span>
        )}
      </div>
      {/* <div className='col-md-6'>
        {isProfileLoading ? (
          <div className='placeholder-glow'>
            <div className='placeholder col-12 form-control py-4' />
          </div>
        ) : (
          <Field name='password'>
            {({ field }: FieldProps) => (
              <ProfileField {...field} disabled={!profile?.id} placeholder='Password' type='password' />
            )}
          </Field>
        )}
        {touched.password && errors.password && (
          <span className='invalid-feedback d-block text-sm fw-medium'>{errors.password}</span>
        )}
      </div> */}
      {/* <div className='col-12'>
        <p className='mb-4 fw-medium pt-4'>Shipping Address</p>
        <div className='row g-4'>
          <div className='col-12'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='street'>
                {({ field }: FieldProps) => (
                  <ProfileField
                    {...field}
                    disabled={!profile?.id}
                    placeholder='Address Line 1 (Primary address)'
                    type='text'
                  />
                )}
              </Field>
            )}
            <ErrorMessage name='street' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
          <div className='col-12'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='street2'>
                {({ field }: FieldProps) => (
                  <ProfileField
                    {...field}
                    disabled={!profile?.id}
                    placeholder='Address Line 2 (Optional: building, floor, landmark, etc.)'
                    type='text'
                  />
                )}
              </Field>
            )}
            <ErrorMessage name='street2' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
          <div className='col-12'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='city'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='City' type='text' />
                )}
              </Field>
            )}
            <ErrorMessage name='city' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
          <div className='col-md-6'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='state'>
                {({ field }: FieldProps) => (
                  <div className='form-floating'>
                    <select {...field} disabled={!profile?.id} id='profile_shipping_state' className='form-select'>
                      {STATES.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    <label htmlFor={'profile_shipping_state'}>State</label>
                  </div>
                )}
              </Field>
            )}
            <ErrorMessage name='state' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
          <div className='col-md-6'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='zip'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='ZIP Code' type='text' />
                )}
              </Field>
            )}
            <ErrorMessage name='zip' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
          <div className='col-12'>
            {isProfileLoading ? (
              <div className='placeholder-glow'>
                <div className='placeholder col-12 form-control py-4' />
              </div>
            ) : (
              <Field name='region'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} readOnly placeholder='Country / Region' type='text' />
                )}
              </Field>
            )}
            <ErrorMessage name='region' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
          </div>
        </div>
      </div> */}
      <div className='col-12 pt-2'>
        <button
          disabled={isLoading}
          type='submit'
          className='btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2'
        >
          {isLoading && <Spinner size='sm' />}
          Save
        </button>
      </div>
    </div>
  );
};
