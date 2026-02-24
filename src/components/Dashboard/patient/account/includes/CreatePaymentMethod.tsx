'use client';

import { Button, Spinner } from 'react-bootstrap';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  ElementsForm,
  FieldName,
} from '@getopenpay/openpay-js-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CardErrorMessage, Error, OptionValue } from '@/lib/types';
import CvcIcon from '@/components/Icon/CvcIcon';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import ReactSelect from 'react-select';
import { FormValues, validationSchema } from '@/lib/schema/createPaymentMethod';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useStates } from '@/hooks/useStates';
import { useDispatch, useSelector } from 'react-redux';
import { setPaymentMethodSuccess } from '@/store/slices/patientAccountSlice';
import { RootState } from '@/store';
import { useAddPatientNewAddressMutation } from '@/store/slices/patientApiSlice';

interface Props {
  token: string;
}

export const CreatePaymentMethod = ({ token }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const profile = useSelector((state: RootState) => state.patientProfile);

  const [cardErrorMessages, setCardErrorMessages] = useState<CardErrorMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSameBillingAddress, setIsSameBillingAddress] = useState(false);
  const [payload, setPayload] = useState<FormValues>();

  const [addNewAddress, { isLoading }] = useAddPatientNewAddressMutation();
  const { stateOptions } = useStates();

  useEffect(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const initialValues = {
    email: profile?.email,
    country: 'United States',
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
  };

  async function handleSaveAddress(paymentMethodId: string) {
    try {
      const data = {
        paymentMethodId,
        email: profile.email || '',
        address: {
          billingAddress: {
            firstName: payload?.billing_firstName || '',
            lastName: payload?.billing_lastName || '',
            street: payload?.billing_address || '',
            street2: payload?.billing_address_2 || '',
            city: payload?.billing_city || '',
            region: 'United States',
            state: payload?.billing_state || '',
            zip: payload?.billing_zipCode || '',
          },
          shippingAddress: {
            firstName: payload?.shipping_firstName || '',
            lastName: payload?.shipping_lastName || '',
            street: payload?.shipping_address || '',
            street2: payload?.shipping_address_2 || '',
            city: payload?.shipping_city || '',
            region: 'United States',
            state: payload?.shipping_state || '',
            zip: payload?.shipping_zipCode || '',
          },
        },
      };
      const { error } = await addNewAddress(data);
      if (!error) {
        toast.success('Payment method added successfully!');
        dispatch(setPaymentMethodSuccess(true));
        handleClose();
      }
    } catch (error) {
      toast.error((error as Error).data?.message || 'Unable to Save address');
    } finally {
      setLoading(false);
    }
  }

  const handlesameAsShippingAddress = (
    e: React.ChangeEvent<HTMLInputElement>,
    values: typeof initialValues,
    setFieldValue: FormikHelpers<typeof initialValues>['setFieldValue']
  ) => {
    if (e.target.checked) {
      setFieldValue('shipping_firstName', values.billing_firstName);
      setFieldValue('shipping_lastName', values.billing_lastName);
      setFieldValue('shipping_address', values.billing_address);
      setFieldValue('shipping_address_2', values.billing_address_2);
      setFieldValue('shipping_city', values.billing_city);
      setFieldValue('shipping_zipCode', values.billing_zipCode);
      setFieldValue('shipping_state', values.billing_state);
    } else {
      setFieldValue('shipping_address', profile?.shippingAddress?.street || '');
      setFieldValue('shipping_address_2', profile?.shippingAddress?.street2 || '');
      setFieldValue('shipping_city', profile?.shippingAddress?.city || '');
      setFieldValue('shipping_zipCode', profile?.shippingAddress?.zip || '');
      setFieldValue('shipping_state', profile?.shippingAddress?.state || '');
    }
    setIsSameBillingAddress(e.target.checked);
  };

  function handleClose() {
    router.push(`${ROUTES.PATIENT_ACCOUNT}?tab=payment`);
  }

  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

  return (
    <div className='container'>
      <h1 className='text-center mb-5'>Add New Payment Method</h1>

      <div className='row justify-content-center'>
        <div className='col-lg-10'>
          <ElementsForm
            checkoutSecureToken={token}
            baseUrl={isStaging ? 'https://cde.openpaystaging.com' : undefined}
            onCheckoutSuccess={async () => {
              setLoading(false);
            }}
            onLoadError={handleClose}
            onCheckoutStarted={() => setLoading(true)}
            onCheckoutError={(message) => {
              toast.error(message);
              setLoading(false);
            }}
            onSetupPaymentMethodSuccess={handleSaveAddress}
            onChange={() => setCardErrorMessages(null)}
            onValidationError={(field: FieldName, errors: string[]) => {
              if (['cardExpiry', 'cardCvc', 'cardNumber'].includes(field)) {
                if (errors.length > 0) {
                  setCardErrorMessages({
                    ...cardErrorMessages,
                    [field]: errors.join(''),
                  });
                } else {
                  setCardErrorMessages((prev) => {
                    if (!prev) return null;
                    const newErrs = { ...prev };
                    const cardField = field as unknown as keyof CardErrorMessage;
                    if (cardField in newErrs) delete newErrs[cardField];
                    return Object.keys(newErrs).length > 0 ? newErrs : null;
                  });
                }
              }
              setLoading(false);
            }}
          >
            {({ submit }) => (
              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  setPayload(values);
                  submit();
                }}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className='d-flex flex-column gap-4'>
                      <div>
                        <h4 className='mb-3'>Contact Details</h4>
                        <div className='row g-3'>
                          <div className='col-lg-6'>
                            <label className='text-sm form-label'>
                              Email Address
                              <span className='text-danger'> *</span>
                            </label>
                            <Field
                              name='email'
                              className='form-control shadow-none'
                              data-opid={FieldName.EMAIL}
                              disabled
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-3'>Billing Address</h4>

                        <div className='row g-3'>
                          <div className='col-lg-6'>
                            <label className='text-sm form-label'>
                              First Name
                              <span className='text-danger'> *</span>
                            </label>
                            <Field
                              name='billing_firstName'
                              className='form-control shadow-none'
                              data-opid={FieldName.FIRST_NAME}
                            />
                            <ErrorMessage component={'div'} name='billing_firstName' className='text-danger text-sm' />
                          </div>
                          <div className='col-lg-6'>
                            <label className='text-sm form-label'>
                              Last Name
                              <span className='text-danger'> *</span>
                            </label>
                            <Field
                              name='billing_lastName'
                              className='form-control shadow-none'
                              data-opid={FieldName.LAST_NAME}
                            />
                            <ErrorMessage component={'div'} name='billing_lastName' className='text-danger text-sm' />
                          </div>
                          <div className='col-12'>
                            <label className='fw-bold mb-2 text-sm'>
                              Street Address
                              <span className='tw-text-red-700'> *</span>
                            </label>

                            <Field
                              data-opid={'line1'}
                              name='billing_address'
                              type='text'
                              className='form-control shadow-none'
                              placeholder={'Street name, House/Apartment, suite, unit etc.'}
                            />

                            <ErrorMessage name='billing_address' component='div' className='text-danger text-sm' />
                          </div>

                          <div className='col-12'>
                            <label className='fw-bold mb-2 text-sm'>Street Address 2</label>

                            <Field
                              data-opid={'line2'}
                              name='billing_address_2'
                              type='text'
                              className='form-control shadow-none'
                              placeholder={'Building, floor, landmark, etc.'}
                            />

                            <ErrorMessage name='billing_address_2' component='div' className='text-danger text-sm' />
                          </div>

                          <div className='col-md-12'>
                            <label className='fw-bold mb-2 text-sm'>
                              City
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              name='billing_city'
                              className='form-control shadow-none'
                              data-opid={FieldName.CITY}
                            />
                            <ErrorMessage name='billing_city' className='text-danger text-sm' component='div' />
                          </div>

                          <div className='col-md-6'>
                            <label className='fw-bold mb-2 text-sm'>
                              State
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field name='billing_state' hidden data-opid={FieldName.STATE} />
                            <ReactSelect
                              options={stateOptions}
                              value={
                                values.billing_state
                                  ? { value: values.billing_state, label: values.billing_state }
                                  : undefined
                              }
                              onChange={(option) => {
                                const { value } = option as OptionValue;
                                setFieldValue('billing_state', value);
                              }}
                              isSearchable
                              placeholder='State'
                              styles={{
                                control: (baseStyles) => ({
                                  ...baseStyles,
                                  width: '100%',
                                  borderRadius: '6px',
                                }),
                                singleValue: (baseStyles) => ({
                                  ...baseStyles,
                                }),
                                indicatorSeparator: () => ({
                                  display: 'none',
                                }),
                              }}
                            />
                            <ErrorMessage name='billing_state' className='text-danger text-sm' component='div' />
                          </div>
                          <div className='col-md-6'>
                            <label className='fw-bold mb-2 text-sm'>
                              ZIP Code
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              name='billing_zipCode'
                              className='form-control shadow-none'
                              data-opid={FieldName.ZIP_CODE}
                            />
                            <ErrorMessage name='billing_zipCode' className='text-danger text-sm' component='div' />
                          </div>
                          <div className='col-md-12'>
                            <label className='fw-bold text-sm mb-2'>
                              Country / Region <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              className='form-control shadow-none disabled'
                              name='country'
                              disabled
                              data-opid={FieldName.COUNTRY}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className='d-flex align-items-center justify-content-between mb-3'>
                          <h4 className='mb-0'>Shipping Address</h4>
                          <label htmlFor='same-address' className='d-flex align-items-center gap-2'>
                            <input
                              className='c_checkbox'
                              type='checkbox'
                              checked={isSameBillingAddress}
                              onChange={(e) => handlesameAsShippingAddress(e, values, setFieldValue)}
                              id='same-address'
                            />
                            <span className={'text-xs'}>Same as Billing Address</span>
                          </label>
                        </div>

                        <div className='row g-3'>
                          <div className='col-lg-6'>
                            <label className='text-sm form-label'>
                              First Name
                              <span className='text-danger'> *</span>
                            </label>
                            <Field name='shipping_firstName' className='form-control shadow-none' />
                            <ErrorMessage component={'div'} name='shipping_firstName' className='text-danger text-sm' />
                          </div>
                          <div className='col-lg-6'>
                            <label className='text-sm form-label'>
                              Last Name
                              <span className='text-danger'> *</span>
                            </label>
                            <Field name='shipping_lastName' className='form-control shadow-none' />
                            <ErrorMessage component={'div'} name='shipping_lastName' className='text-danger text-sm' />
                          </div>
                          <div className='col-12'>
                            <label className='fw-bold mb-2 text-sm'>
                              Street Address
                              <span className='tw-text-red-700'> *</span>
                            </label>

                            <Field
                              disabled={isSameBillingAddress}
                              data-opid={'line1'}
                              name='shipping_address'
                              type='text'
                              className='form-control shadow-none'
                              placeholder={'Street name, House/Apartment, suite, unit etc.'}
                            />

                            <ErrorMessage name='shipping_address' component='div' className='text-danger text-sm' />
                          </div>

                          <div className='col-12'>
                            <label className='fw-bold mb-2 text-sm'>Street Address 2</label>

                            <Field
                              disabled={isSameBillingAddress}
                              data-opid={'line2'}
                              name='shipping_address_2'
                              type='text'
                              className='form-control shadow-none'
                              placeholder={'Building, floor, landmark, etc.'}
                            />

                            <ErrorMessage name='shipping_address_2' component='div' className='text-danger text-sm' />
                          </div>
                          <div className='col-md-12'>
                            <label className='fw-bold mb-2 text-sm'>
                              City
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              name='shipping_city'
                              disabled={isSameBillingAddress}
                              className='form-control shadow-none'
                              data-opid={FieldName.CITY}
                            />
                            <ErrorMessage name='shipping_city' className='text-danger text-sm' component='div' />
                          </div>
                          <div className='col-md-6'>
                            <label className='fw-bold mb-2 text-sm'>
                              State
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              name='shipping_state'
                              disabled={isSameBillingAddress}
                              hidden
                              data-opid={FieldName.STATE}
                            />
                            <ReactSelect
                              isDisabled={isSameBillingAddress}
                              options={stateOptions}
                              value={
                                values.shipping_state
                                  ? { value: values.shipping_state, label: values.shipping_state }
                                  : undefined
                              }
                              onChange={(option) => {
                                const { value } = option as OptionValue;
                                setFieldValue('shipping_state', value);
                              }}
                              isSearchable
                              placeholder='State'
                              styles={{
                                control: (baseStyles) => ({
                                  ...baseStyles,
                                  width: '100%',
                                  borderRadius: '6px',
                                }),
                                singleValue: (baseStyles) => ({
                                  ...baseStyles,
                                }),
                                indicatorSeparator: () => ({
                                  display: 'none',
                                }),
                              }}
                            />
                            <ErrorMessage name='shipping_state' className='text-danger text-sm' component='div' />
                          </div>
                          <div className='col-md-6'>
                            <label className='fw-bold mb-2 text-sm'>
                              ZIP Code
                              <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              name='shipping_zipCode'
                              disabled={isSameBillingAddress}
                              className='form-control shadow-none'
                              data-opid={FieldName.ZIP_CODE}
                            />
                            <ErrorMessage name='shipping_zipCode' className='text-danger text-sm' component='div' />
                          </div>
                          <div className='col-md-12'>
                            <label className='fw-bold text-sm mb-2'>
                              Country / Region <span className='tw-text-red-700'> *</span>
                            </label>
                            <Field
                              className='form-control shadow-none disabled'
                              name='country'
                              disabled
                              data-opid={FieldName.COUNTRY}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-3'>Card Details</h4>
                        <div className='row g-3'>
                          <div className='col-12'>
                            <label className='text-sm form-label'>
                              Card Number <span className='tw-text-red-700'> *</span>
                            </label>
                            <div className='form-control'>
                              <CardNumberElement styles={{ color: 'black' }} />
                            </div>
                            {!!cardErrorMessages?.cardNumber && (
                              <span className='text-danger small'>{cardErrorMessages.cardNumber}</span>
                            )}
                          </div>
                          <div className='col-sm-6'>
                            <label className='text-sm form-label'>
                              Expiration Date(MM/YY) <span className='tw-text-red-700'> *</span>
                            </label>
                            <div className='form-control'>
                              <CardExpiryElement styles={{ color: 'black' }} />
                            </div>
                            {!!cardErrorMessages?.cardExpiry && (
                              <span className='text-danger small'>{cardErrorMessages.cardExpiry}</span>
                            )}
                          </div>
                          <div className='col-sm-6'>
                            <label className='text-sm form-label'>
                              Security Code <span className='tw-text-red-700'> *</span>
                            </label>
                            <div className='form-control pe-5 position-relative'>
                              <CardCvcElement styles={{ color: 'black' }} />
                              <CvcIcon
                                className='position-absolute pointer-events-none top-0 end-0 mt-2 me-2'
                                width={30}
                                height={20}
                              />
                            </div>
                            {!!cardErrorMessages?.cardCvc && (
                              <span className='text-danger small'>{cardErrorMessages.cardCvc}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='d-flex align-items-center justify-content-end gap-3'>
                        <Button variant='outline-primary' onClick={handleClose}>
                          Cancel
                        </Button>
                        <Button
                          disabled={loading || isLoading}
                          className='d-flex align-items-center justify-content-center gap-2'
                          variant='primary'
                          type='submit'
                        >
                          {(loading || isLoading) && <Spinner size='sm' />}
                          Save Payment Method
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </ElementsForm>
        </div>
      </div>
    </div>
  );
};
