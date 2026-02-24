'use client';

import { FormValues } from '@/types/refillForm';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useStates } from '@/hooks/useStates';

export const AddressQuestion = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const { stateNames, isLoading: isLoadingStates } = useStates();
  return (
    <div className='tw-space-y-8 tw-mt-6'>
      {/* Billing Address */}
      <div>
        <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4'>Billing Address</h3>
        <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4'>
          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              First Name <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.firstName' className='form-control' />
            <ErrorMessage name='address.billingAddress.firstName'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Last Name <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.lastName' className='form-control' />
            <ErrorMessage name='address.billingAddress.lastName'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div className='md:tw-col-span-2'>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Street Address <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.street' className='form-control' />
            <ErrorMessage name='address.billingAddress.street'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div className='md:tw-col-span-2'>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Street Address 2 (Optional)
            </label>
            <Field type='text' name='address.billingAddress.street2' className='form-control' />
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              City <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.city' className='form-control' />
            <ErrorMessage name='address.billingAddress.city'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              State <span className='tw-text-red-500'>*</span>
            </label>
            <Field as='select' name='address.billingAddress.state' className='form-select'>
              <option value=''>Select a state</option>
              {isLoadingStates ? (
                <option>Loading states...</option>
              ) : (
                stateNames.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
              )}
            </Field>
            <ErrorMessage name='address.billingAddress.state'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              ZIP Code <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.zip' maxLength={5} className='form-control' />
            <ErrorMessage name='address.billingAddress.zip'>
              {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
            </ErrorMessage>
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Country/Region <span className='tw-text-red-500'>*</span>
            </label>
            <Field type='text' name='address.billingAddress.region' disabled className='form-control' />
          </div>
        </div>
      </div>

      {/* Same as Billing Checkbox */}
      <div>
        <label className='tw-flex tw-items-center tw-space-x-3 tw-cursor-pointer'>
          <Field
            type='checkbox'
            name='address.sameAsBilling'
            className='tw-w-5 tw-h-5 tw-text-blue-600 tw-border-gray-300 tw-rounded'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldValue('address.sameAsBilling', e.target.checked);
              if (e.target.checked && values.address) {
                setFieldValue('address.shippingAddress', values.address.billingAddress);
              }
            }}
          />
          <span className='tw-text-base tw-font-medium tw-text-gray-700'>Shipping address same as billing</span>
        </label>
      </div>

      {/* Shipping Address */}
      {!values.address?.sameAsBilling && (
        <div>
          <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4'>Shipping Address</h3>
          <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4'>
            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                First Name <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.firstName' className='form-control' />
              <ErrorMessage name='address.shippingAddress.firstName'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Last Name <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.lastName' className='form-control' />
              <ErrorMessage name='address.shippingAddress.lastName'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.street' className='form-control' />
              <ErrorMessage name='address.shippingAddress.street'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address 2 (Optional)
              </label>
              <Field type='text' name='address.shippingAddress.street2' className='form-control' />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                City <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.city' className='form-control' />
              <ErrorMessage name='address.shippingAddress.city'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                State <span className='tw-text-red-500'>*</span>
              </label>
            <Field as='select' name='address.shippingAddress.state' className='form-select'>
              <option value=''>Select a state</option>
              {isLoadingStates ? (
                <option>Loading states...</option>
              ) : (
                stateNames.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
              )}
            </Field>
              <ErrorMessage name='address.shippingAddress.state'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                ZIP Code <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.zip' maxLength={5} className='form-control' />
              <ErrorMessage name='address.shippingAddress.zip'>
                {(msg) => <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{msg}</div>}
              </ErrorMessage>
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Country/Region <span className='tw-text-red-500'>*</span>
              </label>
              <Field type='text' name='address.shippingAddress.region' disabled className='form-control' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
