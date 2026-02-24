'use client';

import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useStates } from '@/hooks/useStates';
import { addressSchema, AddressSchema } from '@/lib/schema/patientAddress';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdateOrderAddressMutation } from '@/store/slices/ordersApiSlice';
import { Address } from '@/store/slices/patientSlice';
import { Field, Formik, Form } from 'formik';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { Modal, Tabs, TabPanel } from '@/components/elements';
import { extractErrorMessage } from '@/lib/errors';

export function PatientEditAddress() {
  const dispatch = useDispatch();
  const { stateNames, isLoading: isLoadingStates } = useStates();

  const { modalType, ctx } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const patientProfile = useSelector((state: RootState) => state.patientProfile);

  const modalCtx = ctx as {
    billingAddress: Address & { firstName?: string; lastName?: string };
    shippingAddress: Address & { firstName?: string; lastName?: string };
    orderId: string;
    productName?: string;
    isPatientView?: boolean;
  };

  const isOpen = modalType === 'Edit Patient Address';
  const [activeTab, setActiveTab] = useState<'billing' | 'shipping'>('billing');
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const [updateOrderAddress, { isLoading: isOrderLoading }] = useUpdateOrderAddressMutation();

  const initialValues = {
    billing: {
      city: modalCtx?.billingAddress?.city ?? '',
      street: modalCtx?.billingAddress?.street ?? '',
      street2: modalCtx?.billingAddress?.street2 ?? '',
      state: modalCtx?.billingAddress?.state ?? '',
      zip: modalCtx?.billingAddress?.zip ?? '',
    },
    shipping: {
      city: modalCtx?.shippingAddress?.city ?? '',
      street: modalCtx?.shippingAddress?.street ?? '',
      street2: modalCtx?.shippingAddress?.street2 ?? '',
      state: modalCtx?.shippingAddress?.state ?? '',
      zip: modalCtx?.shippingAddress?.zip ?? '',
    },
  };

  useEffect(() => {
    if (patient) {
      if (
        modalCtx?.billingAddress?.city === modalCtx?.shippingAddress?.city &&
        modalCtx?.billingAddress?.street === modalCtx?.shippingAddress?.street &&
        modalCtx?.billingAddress?.street2 === modalCtx?.shippingAddress?.street2 &&
        modalCtx?.billingAddress?.state === modalCtx?.shippingAddress?.state &&
        modalCtx?.billingAddress?.zip === modalCtx?.shippingAddress?.zip
      ) {
        setIsSameAddress(true);
      }
    }
  }, [patient, modalCtx]);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  // Helper function to get first non-empty string value from multiple sources
  function getFirstNonEmpty(...values: (string | null | undefined)[]): string {
    for (const value of values) {
      if (value && value.trim() !== '') {
        return value;
      }
    }
    return '';
  }

  async function handleEditAddress(values: typeof initialValues) {
    const BLOCKED_STATES = ['Mississippi', 'Alabama', 'California'];
    const is503B = modalCtx?.productName && modalCtx.productName.toLowerCase().includes('503b');
    if (is503B && BLOCKED_STATES.includes(values.shipping.state)) {
      toast.error(`We cannot save a shipping address for ${values.shipping.state} for 503B products.`);
      return;
    }

    const billingKeys = Object.keys(values.billing).filter(
      (k) => values.billing[k as keyof AddressSchema] !== initialValues.billing[k as keyof AddressSchema]
    );

    const shippingKeys = Object.keys(values.shipping).filter(
      (k) => values.shipping[k as keyof AddressSchema] !== initialValues.shipping[k as keyof AddressSchema]
    );

    if (billingKeys.length > 0 || shippingKeys.length > 0 || isDefault) {
      // Use order address API
      const billingFirstName = getFirstNonEmpty(
        modalCtx.billingAddress?.firstName,
        patient?.firstName,
        patientProfile?.firstName
      );

      const billingLastName = getFirstNonEmpty(
        modalCtx.billingAddress?.lastName,
        patient?.lastName,
        patientProfile?.lastName
      );

      const shippingFirstName = getFirstNonEmpty(
        modalCtx.shippingAddress?.firstName,
        patient?.firstName,
        patientProfile?.firstName
      );

      const shippingLastName = getFirstNonEmpty(
        modalCtx.shippingAddress?.lastName,
        patient?.lastName,
        patientProfile?.lastName
      );

      const addressPayload = {
        billingAddress: {
          firstName: billingFirstName,
          lastName: billingLastName || billingFirstName,
          street: values.billing.street,
          street2: values.billing.street2,
          city: values.billing.city,
          region: modalCtx.billingAddress?.region || 'United States',
          state: values.billing.state,
          zip: values.billing.zip,
        },
        shippingAddress: {
          firstName: shippingFirstName,
          lastName: shippingLastName || shippingFirstName,
          street: values.shipping.street,
          street2: values.shipping.street2,
          city: values.shipping.city,
          region: modalCtx.shippingAddress?.region || 'United States',
          state: values.shipping.state,
          zip: values.shipping.zip,
        },
      };

      try {
        const { error } = await updateOrderAddress({
          orderId: modalCtx.orderId,
          address: addressPayload,
          ...(isDefault && { isDefault }),
        });

        if (error) {
          toast.error(extractErrorMessage(error, 'Error updating Order Address!'));
        } else {
          toast.success(`Order Address Updated!`);
          // Close modal after update is dispatched
          handleClose();
        }
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Error updating Order Address!'));
      }
    } else {
      handleClose();
    }
  }

  const footer = (
    <div className='tw-grid tw-grid-cols-2 tw-gap-2 tw-w-full'>
      <button
        type='button'
        className='tw-w-full tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
        onClick={handleClose}
      >
        Discard
      </button>
      <button
        type='submit'
        form='patient-edit-address-form'
        disabled={isOrderLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isOrderLoading && <Spinner size='sm' />}
        Save
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Edit Patient Address'
      size='lg'
      headerClassName='!tw-text-left'
      footer={footer}
      showFooter={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object({ billing: addressSchema, shipping: addressSchema })}
        onSubmit={handleEditAddress}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form id='patient-edit-address-form'>
            <div className='tw-mb-4'>
              <Tabs
                tabs={[
                  { value: 'billing', label: 'Billing Address' },
                  { value: 'shipping', label: 'Shipping Address' },
                ]}
                activeTab={activeTab}
                onTabChange={(value) => setActiveTab(value as 'billing' | 'shipping')}
              />
            </div>

            <TabPanel value={activeTab} index='billing'>
              <div className='row g-3'>
                <div className='col-12'>
                  <label htmlFor='billing.street' className='form-label text-sm text-secondary'>
                    Address Line 1 (Primary address)
                  </label>
                  <Field
                    name='billing.street'
                    className={`form-control shadow-none ${
                      errors.billing?.street && touched.billing?.street ? ' is-invalid' : ''
                    }`}
                    type='text'
                    placeholder={'Street name, House/Apartment, suite, unit etc.'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('billing.street', e.target.value);
                      if (isSameAddress) setIsSameAddress(false);
                    }}
                  />
                  {errors.billing?.street && touched.billing?.street && (
                    <span className='text-sm text-danger'>{errors.billing.street}</span>
                  )}
                </div>

                <div className='col-12'>
                  <label htmlFor='billing.street2' className='form-label text-sm text-secondary'>
                    Address Line 2 (Optional: building, floor, landmark, etc.)
                  </label>
                  <Field
                    name='billing.street2'
                    className={`form-control shadow-none ${
                      errors.billing?.street2 && touched.billing?.street2 ? ' is-invalid' : ''
                    }`}
                    type='text'
                    placeholder={'Building, floor, landmark, etc.'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('billing.street2', e.target.value);
                      if (isSameAddress) setIsSameAddress(false);
                    }}
                  />
                </div>
                <div className='col-12'>
                  <label htmlFor='billing.city' className='form-label text-sm text-secondary'>
                    City
                  </label>
                  <Field
                    name='billing.city'
                    className={`form-control shadow-none ${
                      errors.billing?.city && touched.billing?.city ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('billing.city', e.target.value);
                      if (isSameAddress) setIsSameAddress(false);
                    }}
                  />
                  {errors.billing?.city && touched.billing?.city && (
                    <span className='text-sm text-danger'>{errors.billing.city}</span>
                  )}
                </div>
                <div className='col-12'>
                  <label htmlFor='billing.state' className='form-label text-sm text-secondary'>
                    State
                  </label>
                  <Field
                    as='select'
                    name='billing.state'
                    className={`form-select shadow-none ${
                      errors.billing?.state && touched.billing?.state ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue('billing.state', e.target.value);
                      if (isSameAddress) setIsSameAddress(false);
                    }}
                  >
                    {isLoadingStates ? (
                      <option>Loading states...</option>
                    ) : (
                      stateNames.map((state: string) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))
                    )}
                  </Field>
                  {errors.billing?.state && touched.billing?.state && (
                    <span className='text-sm text-danger'>{errors.billing.state}</span>
                  )}
                </div>
                <div className='col-12'>
                  <label htmlFor='billing.zip' className='form-label text-sm text-secondary'>
                    Zip Code
                  </label>
                  <Field
                    name='billing.zip'
                    className={`form-control shadow-none ${
                      errors.billing?.zip && touched.billing?.zip ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('billing.zip', e.target.value);
                      if (isSameAddress) setIsSameAddress(false);
                    }}
                  />
                  {errors.billing?.zip && touched.billing?.zip && (
                    <span className='text-sm text-danger'>{errors.billing.zip}</span>
                  )}
                </div>
              </div>
            </TabPanel>

            <TabPanel value={activeTab} index='shipping'>
              <div className='row g-3'>
                <div className='col-12'>
                  <label htmlFor='shipping.street' className='form-label text-sm text-secondary'>
                    Address Line 1 (Primary address)
                  </label>
                  <Field
                    name='shipping.street'
                    disabled={isSameAddress}
                    className={`form-control shadow-none ${
                      errors.shipping?.street && touched.shipping?.street ? ' is-invalid' : ''
                    }`}
                    type='text'
                    placeholder={'Street name, House/Apartment, suite, unit etc.'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('shipping.street', e.target.value);
                    }}
                  />
                  {errors.shipping?.street && touched.shipping?.street && (
                    <span className='text-sm text-danger'>{errors.shipping.street}</span>
                  )}
                </div>
                <div className='col-12'>
                  <label htmlFor='shipping.street2' className='form-label text-sm text-secondary'>
                    Address Line 2 (Optional: building, floor, landmark, etc.)
                  </label>
                  <Field
                    name='shipping.street2'
                    disabled={isSameAddress}
                    className={`form-control shadow-none ${
                      errors.shipping?.street2 && touched.shipping?.street2 ? ' is-invalid' : ''
                    }`}
                    type='text'
                    placeholder={'Building, floor, landmark, etc.'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('shipping.street2', e.target.value);
                    }}
                  />
                </div>
                <div className='col-12'>
                  <label htmlFor='shipping.city' className='form-label text-sm text-secondary'>
                    City
                  </label>
                  <Field
                    name='shipping.city'
                    disabled={isSameAddress}
                    className={`form-control shadow-none ${
                      errors.shipping?.city && touched.shipping?.city ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('shipping.city', e.target.value);
                    }}
                  />
                  {errors.shipping?.city && touched.shipping?.city && (
                    <span className='text-sm text-danger'>{errors.shipping.city}</span>
                  )}
                </div>
                <div className='col-12'>
                  <label htmlFor='shipping.state' className='form-label text-sm text-secondary'>
                    State
                  </label>
                  <Field
                    as='select'
                    name='shipping.state'
                    disabled={isSameAddress}
                    className={`form-select shadow-none ${
                      errors.shipping?.state && touched.shipping?.state ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue('shipping.state', e.target.value);
                    }}
                  >
                    {isLoadingStates ? (
                      <option>Loading states...</option>
                    ) : (
                      stateNames.map((state: string) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))
                    )}
                  </Field>
                  {errors.shipping?.state && touched.shipping?.state && (
                    <span className='text-sm text-danger'>{errors.shipping.state}</span>
                  )}
                </div>
                <div className='col-12'>
                  <label htmlFor='shipping.zip' className='form-label text-sm text-secondary'>
                    Zip Code
                  </label>
                  <Field
                    name='shipping.zip'
                    disabled={isSameAddress}
                    className={`form-control shadow-none ${
                      errors.shipping?.zip && touched.shipping?.zip ? ' is-invalid' : ''
                    }`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('shipping.zip', e.target.value);
                    }}
                  />
                  {errors.shipping?.zip && touched.shipping?.zip && (
                    <span className='text-sm text-danger'>{errors.shipping.zip}</span>
                  )}
                </div>
              </div>
            </TabPanel>

            <div className='d-flex align-items-center mt-3 gap-2 col-12'>
              <input
                className='c_checkbox'
                type='checkbox'
                onChange={(e) => {
                  if (e.target.checked) {
                    setFieldValue('shipping.street', values.billing.street);
                    setFieldValue('shipping.street2', values.billing.street2);
                    setFieldValue('shipping.city', values.billing.city);
                    setFieldValue('shipping.state', values.billing.state);
                    setFieldValue('shipping.zip', values.billing.zip);
                  } else {
                    setFieldValue('shipping.street', modalCtx?.shippingAddress?.street);
                    setFieldValue('shipping.street2', modalCtx?.shippingAddress?.street2);
                    setFieldValue('shipping.city', modalCtx?.shippingAddress?.city);
                    setFieldValue('shipping.state', modalCtx?.shippingAddress?.state);
                    setFieldValue('shipping.zip', modalCtx?.shippingAddress?.zip);
                  }
                  setIsSameAddress(e.target.checked);
                }}
                checked={isSameAddress}
                id='same_address'
              />
              <label htmlFor='same_address'>Set Shipping Address same as Billing Address</label>
            </div>

            <div className='d-flex align-items-center mt-2 gap-2 col-12'>
              <input
                className='c_checkbox'
                type='checkbox'
                onChange={(e) => setIsDefault(e.target.checked)}
                checked={isDefault}
                id='is_default'
              />
              <label htmlFor='is_default'>Set as Default Address</label>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
