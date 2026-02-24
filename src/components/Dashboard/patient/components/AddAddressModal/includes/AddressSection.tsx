import ReactSelect from 'react-select';
import { memo } from 'react';
import { Field, ErrorMessage } from 'formik';
import { AddressValues } from '@/lib/schema/addSubscriptionAddress';
import { useStates } from '@/hooks/useStates';

type AddressPrefix = 'billing' | 'shipping';

interface AddressSectionProps {
  title: string;
  prefix: AddressPrefix;
  disabled?: boolean;
  values: AddressValues;
  setFieldValue: (field: string, value: unknown) => void;
  showSameAsBillingToggle?: boolean;
  isSameBillingAddress?: boolean;
  onSameAsBillingChange?: (checked: boolean) => void;
}

export const AddressSection = memo(
  ({
    title,
    prefix,
    disabled = false,
    values,
    setFieldValue,
    showSameAsBillingToggle,
    isSameBillingAddress,
    onSameAsBillingChange,
  }: Readonly<AddressSectionProps>) => {
    const { stateOptions } = useStates();
    const firstNameKey = `${prefix}_firstName` as const;
    const lastNameKey = `${prefix}_lastName` as const;
    const address1Key = `${prefix}_address` as const;
    const address2Key = `${prefix}_address_2` as const;
    const cityKey = `${prefix}_city` as const;
    const stateKey = `${prefix}_state` as const;
    const zipKey = `${prefix}_zipCode` as const;

    return (
      <div>
        <div
          className={`d-flex align-items-center justify-content-between mb-3 ${showSameAsBillingToggle ? '' : 'mb-3'}`}
        >
          <h4 className='tw-text-base tw-font-semibold tw-mb-0'>{title}</h4>
          {showSameAsBillingToggle && (
            <label htmlFor='same-address' className='d-flex align-items-center gap-2'>
              <input
                className='c_checkbox'
                type='checkbox'
                checked={!!isSameBillingAddress}
                onChange={(e) => onSameAsBillingChange?.(e.target.checked)}
                id='same-address'
              />
              <span className='text-xs tw-select-none'>Same as Billing Address</span>
            </label>
          )}
        </div>

        <div className='row g-3'>
          <div className='col-lg-6'>
            <label className='text-sm form-label'>
              First Name
              <span className='text-danger'> *</span>
            </label>
            <Field name={firstNameKey} className='form-control shadow-none' disabled={disabled} />
            <ErrorMessage component={'div'} name={firstNameKey} className='text-danger text-sm' />
          </div>
          <div className='col-lg-6'>
            <label className='text-sm form-label'>
              Last Name
              <span className='text-danger'> *</span>
            </label>
            <Field name={lastNameKey} className='form-control shadow-none' disabled={disabled} />
            <ErrorMessage component={'div'} name={lastNameKey} className='text-danger text-sm' />
          </div>

          <div className='col-12'>
            <label className='fw-bold mb-2 text-sm'>
              Street Address
              <span className='tw-text-red-700'> *</span>
            </label>
            <Field
              disabled={disabled}
              name={address1Key}
              type='text'
              className='form-control shadow-none'
              placeholder={'Street name, House/Apartment, suite, unit etc.'}
            />
            <ErrorMessage name={address1Key} component='div' className='text-danger text-sm' />
          </div>

          <div className='col-12'>
            <label className='fw-bold mb-2 text-sm'>Street Address 2</label>
            <Field
              disabled={disabled}
              name={address2Key}
              type='text'
              className='form-control shadow-none'
              placeholder={'Building, floor, landmark, etc.'}
            />
            <ErrorMessage name={address2Key} component='div' className='text-danger text-sm' />
          </div>

          <div className='col-md-12'>
            <label className='fw-bold mb-2 text-sm'>
              City
              <span className='tw-text-red-700'> *</span>
            </label>
            <Field name={cityKey} disabled={disabled} className='form-control shadow-none' />
            <ErrorMessage name={cityKey} className='text-danger text-sm' component='div' />
          </div>

          <div className='col-md-6'>
            <label className='fw-bold mb-2 text-sm'>
              State
              <span className='tw-text-red-700'> *</span>
            </label>
            <ReactSelect
              isDisabled={disabled}
              options={stateOptions}
              value={values[stateKey] ? { value: values[stateKey], label: values[stateKey] } : undefined}
              onChange={(option) => {
                const { value } = option as { value: string; label: string };
                setFieldValue(stateKey, value);
              }}
              isSearchable
              placeholder='State'
              classNames={{
                control: () => 'w-100 rounded',
                indicatorSeparator: () => 'd-none',
              }}
            />
            <ErrorMessage name={stateKey} className='text-danger text-sm' component='div' />
          </div>
          <div className='col-md-6'>
            <label className='fw-bold mb-2 text-sm'>
              ZIP Code
              <span className='tw-text-red-700'> *</span>
            </label>
            <Field name={zipKey} disabled={disabled} className='form-control shadow-none' />
            <ErrorMessage name={zipKey} className='text-danger text-sm' component='div' />
          </div>

          <div className='col-md-12'>
            <label className='fw-bold text-sm mb-2'>
              Country / Region <span className='tw-text-red-700'> *</span>
            </label>
            <Field className='form-control shadow-none disabled' name='country' disabled />
          </div>
        </div>
      </div>
    );
  }
);

AddressSection.displayName = 'AddressSection';
