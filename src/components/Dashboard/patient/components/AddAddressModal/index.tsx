'use client';

import { Modal } from '@/components/elements';
import { useMemo, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CreateRecurringSubscriptionPayload } from '@/store/slices/subscriptionsApiSlice';
import { addressValidationSchema, AddressValues } from '@/lib/schema/addSubscriptionAddress';
import { AddressSection } from '@/components/Dashboard/patient/components/AddAddressModal/includes/AddressSection';

export type FormValues = AddressValues & { country?: string; sameAsBilling?: boolean };

interface Props {
  open: boolean;
  onClose: () => void;
  onSaveAddress: (payload: CreateRecurringSubscriptionPayload['address']) => Promise<void>;
  isSubmitting?: boolean;
  title?: string;
}

export const AddAddressModal = ({
  open,
  onClose,
  onSaveAddress,
  isSubmitting = false,
  title = 'Add Address',
}: Readonly<Props>) => {
  const formRef = useRef<FormikProps<AddressValues>>(null);

  const profile = useSelector((state: RootState) => state.patientProfile);

  const [isSameBillingAddress, setIsSameBillingAddress] = useState<boolean>(false);

  const initialValues: AddressValues = useMemo(
    () => ({
      country: 'United States',
      sameAsBilling: false,
      billing_firstName: '',
      billing_lastName: '',
      billing_zipCode: profile?.billingAddress?.zip || '',
      billing_address: profile?.billingAddress?.street || '',
      billing_address_2: profile?.billingAddress?.street2 || '',
      billing_state: profile?.billingAddress?.state || '',
      billing_city: profile?.billingAddress?.city || '',

      shipping_firstName: '',
      shipping_lastName: '',
      shipping_zipCode: profile?.shippingAddress?.zip || '',
      shipping_address: profile?.shippingAddress?.street || '',
      shipping_address_2: profile?.shippingAddress?.street2 || '',
      shipping_state: profile?.shippingAddress?.state || '',
      shipping_city: profile?.shippingAddress?.city || '',
    }),
    [profile]
  );

  const handleSaveClick = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const footer = (
    <>
      <button
        type='button'
        className='tw-flex-1 tw-px-4 tw-py-2 sm:tw-py-3 tw-text-gray-700 tw-bg-neutral-200 tw-border tw-border-gray-200 tw-rounded-lg tw-font-medium hover:tw-bg-neutral-300 tw-transition-colors tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500 focus:tw-ring-offset-2'
        onClick={() => {
          setIsSameBillingAddress(false);
          formRef.current?.resetForm();
          onClose();
        }}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type='button'
        onClick={handleSaveClick}
        className='tw-flex-1 tw-px-4 tw-py-2 sm:tw-py-3 tw-rounded-lg tw-font-medium tw-transition-all tw-text-base tw-duration-200 tw-bg-blue-600 tw-no-underline !tw-text-white hover:tw-bg-blue-700 focus:tw-ring-blue-500 hover:tw-shadow-md disabled:tw-opacity-60'
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Address'}
      </button>
    </>
  );

  return (
    <Modal size='xl' title={title} isOpen={open} footer={footer}>
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={addressValidationSchema}
        onSubmit={async (values) => {
          try {
            const address: CreateRecurringSubscriptionPayload['address'] = {
              billingAddress: {
                firstName: values.billing_firstName || '',
                lastName: values.billing_lastName || '',
                street: values.billing_address || '',
                street2: values.billing_address_2 || '',
                city: values.billing_city || '',
                region: 'United States',
                state: values.billing_state || '',
                zip: values.billing_zipCode || '',
              },
              shippingAddress: {
                firstName: values.shipping_firstName || '',
                lastName: values.shipping_lastName || '',
                street: values.shipping_address || '',
                street2: values.shipping_address_2 || '',
                city: values.shipping_city || '',
                region: 'United States',
                state: values.shipping_state || '',
                zip: values.shipping_zipCode || '',
              },
            };
            await onSaveAddress(address);
            setIsSameBillingAddress(false);
          } catch (error) {
            console.log('Submission error:', error);
          }
        }}
      >
        {({ values, setFieldValue, setErrors, setFieldTouched, errors }) => (
          <Form>
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <AddressSection title='Billing Address' prefix='billing' values={values} setFieldValue={setFieldValue} />

              <AddressSection
                title='Shipping Address'
                prefix='shipping'
                disabled={isSameBillingAddress}
                values={values}
                setFieldValue={setFieldValue}
                showSameAsBillingToggle
                isSameBillingAddress={isSameBillingAddress}
                onSameAsBillingChange={async (checked) => {
                  setIsSameBillingAddress(checked);
                  setFieldValue('sameAsBilling', checked);
                  if (checked) {
                    setFieldValue('shipping_firstName', values.billing_firstName);
                    setFieldValue('shipping_lastName', values.billing_lastName);
                    setFieldValue('shipping_address', values.billing_address);
                    setFieldValue('shipping_address_2', values.billing_address_2);
                    setFieldValue('shipping_city', values.billing_city);
                    setFieldValue('shipping_zipCode', values.billing_zipCode);
                    setFieldValue('shipping_state', values.billing_state);
                    // Clear shipping field errors and touched state so messages vanish when using same as billing
                    const errorKeysToClear: string[] = [
                      'shipping_firstName',
                      'shipping_lastName',
                      'shipping_address',
                      'shipping_address_2',
                      'shipping_city',
                      'shipping_state',
                      'shipping_zipCode',
                    ];
                    const nextErrors: Record<string, unknown> = { ...(errors as Record<string, unknown>) };
                    errorKeysToClear.forEach((key) => {
                      delete nextErrors[key];
                      // prevent validation on touch clear
                      setFieldTouched(key, false, false);
                    });
                    setErrors(nextErrors);
                  } else {
                    setFieldValue('shipping_firstName', '');
                    setFieldValue('shipping_lastName', '');
                    setFieldValue('shipping_address', profile?.shippingAddress?.street || '');
                    setFieldValue('shipping_address_2', profile?.shippingAddress?.street2 || '');
                    setFieldValue('shipping_city', profile?.shippingAddress?.city || '');
                    setFieldValue('shipping_zipCode', profile?.shippingAddress?.zip || '');
                    setFieldValue('shipping_state', profile?.shippingAddress?.state || '');
                  }
                }}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
