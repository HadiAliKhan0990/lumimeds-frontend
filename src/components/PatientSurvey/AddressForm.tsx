'use client';

import { useStates } from '@/hooks/useStates';
import { AddressData } from '@/types/generalSurvey';
import { BillingAddress } from '@/store/slices/ordersApiSlice';

interface Props {
  addressData: AddressData;
  setAddressData: (data: AddressData) => void;
}

/**
 * AddressForm Component
 *
 * Reusable address form component for survey forms.
 * Handles billing and shipping address input with validation.
 *
 * Features:
 * - Billing and shipping address fields
 * - "Same as billing" checkbox functionality
 * - US states dropdown integration
 * - Real-time validation
 * - Address prefilling support
 *
 * @param addressData - Address data object containing billing and shipping addresses
 * @param setAddressData - Function to update address data
 *
 * @see docs/ADDRESS_QUESTION_IMPLEMENTATION.md for full documentation
 */
export function AddressForm({ addressData, setAddressData }: Readonly<Props>) {
  const { stateNames, isLoading: isLoadingStates } = useStates();

  // Helper to get default address structure
  const getDefaultAddress = (): BillingAddress => ({
    firstName: '',
    lastName: '',
    street: '',
    street2: '',
    city: '',
    region: 'United States',
    state: '',
    zip: '',
  });

  const handleFieldChange = (type: 'billing' | 'shipping', field: keyof BillingAddress, value: string) => {
    const newData = { ...addressData };
    if (type === 'billing') {
      newData.billingAddress = { ...getDefaultAddress(), ...newData.billingAddress, [field]: value };
      if (newData.sameAsBilling) {
        newData.shippingAddress = { ...newData.billingAddress };
      }
    } else {
      newData.shippingAddress = { ...getDefaultAddress(), ...newData.shippingAddress, [field]: value };
    }
    setAddressData(newData);
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    const defaultAddress = getDefaultAddress();
    const billingAddress = addressData.billingAddress || defaultAddress;
    const shippingAddress = addressData.shippingAddress || defaultAddress;

    const newData = {
      ...addressData,
      sameAsBilling: checked,
      billingAddress,
      shippingAddress: checked ? { ...billingAddress } : { ...shippingAddress },
    };
    setAddressData(newData);
  };

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
            <input
              type='text'
              value={addressData.billingAddress?.firstName}
              onChange={(e) => handleFieldChange('billing', 'firstName', e.target.value)}
              className='form-control'
            />
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Last Name <span className='tw-text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={addressData.billingAddress?.lastName}
              onChange={(e) => handleFieldChange('billing', 'lastName', e.target.value)}
              className='form-control'
            />
          </div>

          <div className='md:tw-col-span-2'>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Street Address <span className='tw-text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={addressData.billingAddress?.street}
              onChange={(e) => handleFieldChange('billing', 'street', e.target.value)}
              className='form-control'
            />
          </div>

          <div className='md:tw-col-span-2'>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Street Address 2 (Optional)
            </label>
            <input
              type='text'
              value={addressData.billingAddress?.street2}
              onChange={(e) => handleFieldChange('billing', 'street2', e.target.value)}
              className='form-control'
            />
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              City <span className='tw-text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={addressData.billingAddress?.city}
              onChange={(e) => handleFieldChange('billing', 'city', e.target.value)}
              className='form-control'
            />
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              State <span className='tw-text-red-500'>*</span>
            </label>
            <select
              value={addressData.billingAddress?.state}
              onChange={(e) => handleFieldChange('billing', 'state', e.target.value)}
              className='form-select'
            >
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
            </select>
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              ZIP Code <span className='tw-text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={addressData.billingAddress?.zip}
              onChange={(e) => handleFieldChange('billing', 'zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              className='form-control'
            />
          </div>

          <div>
            <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
              Country/Region <span className='tw-text-red-500'>*</span>
            </label>
            <input type='text' value={addressData.billingAddress?.region} disabled className='form-control' />
          </div>
        </div>
      </div>

      {/* Same as Billing Checkbox */}
      <div>
        <label className='tw-flex tw-items-center tw-space-x-3 tw-cursor-pointer'>
          <input
            type='checkbox'
            checked={addressData.sameAsBilling}
            onChange={(e) => handleSameAsBillingChange(e.target.checked)}
            className='tw-w-5 tw-h-5 tw-accent-primary tw-rounded'
          />
          <span className='tw-text-base tw-font-medium tw-text-gray-700'>Shipping address same as billing</span>
        </label>
      </div>

      {/* Shipping Address */}
      {!addressData.sameAsBilling && (
        <div>
          <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4'>Shipping Address</h3>
          <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4'>
            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                First Name <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.firstName}
                onChange={(e) => handleFieldChange('shipping', 'firstName', e.target.value)}
                className='form-control'
              />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Last Name <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.lastName}
                onChange={(e) => handleFieldChange('shipping', 'lastName', e.target.value)}
                className='form-control'
              />
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.street}
                onChange={(e) => handleFieldChange('shipping', 'street', e.target.value)}
                className='form-control'
              />
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address 2 (Optional)
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.street2}
                onChange={(e) => handleFieldChange('shipping', 'street2', e.target.value)}
                className='form-control'
              />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                City <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.city}
                onChange={(e) => handleFieldChange('shipping', 'city', e.target.value)}
                className='form-control'
              />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                State <span className='tw-text-red-500'>*</span>
              </label>
              <select
                value={addressData.shippingAddress?.state}
                onChange={(e) => handleFieldChange('shipping', 'state', e.target.value)}
                className='form-select'
              >
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
              </select>
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                ZIP Code <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.shippingAddress?.zip}
                onChange={(e) => handleFieldChange('shipping', 'zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className='form-control'
              />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Country/Region <span className='tw-text-red-500'>*</span>
              </label>
              <input type='text' value={addressData.shippingAddress?.region} disabled className='form-control' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
