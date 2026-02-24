'use client';

import { ErrorMessage, Field, FieldProps, Formik, Form, FormikHelpers } from 'formik';
import { ProfileField } from '@/components/Dashboard/patient/account/includes/ProfileField';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useUpdatePatientProfileMutation } from '@/store/slices/userApiSlice';
import { shippingAddressSchema } from '@/lib/schema/shippingAddress';
import { isAxiosError } from 'axios';
import { Spinner } from 'react-bootstrap';
import { AccountSchema } from '@/lib/schema/account';
import { useStates } from '@/hooks/useStates';
import toast from 'react-hot-toast';

interface FormValues {
  firstName: string;
  lastName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  region: string;
}

export default function PatientShippingAddressPage() {
  const router = useRouter();
  const { stateNames, isLoading: isLoadingStates } = useStates();

  const profile = useSelector((state: RootState) => state.patientProfile);

  const [updateProfile, { isLoading }] = useUpdatePatientProfileMutation();

  const initialValues: FormValues = {
    firstName: profile?.shippingAddress?.firstName || '',
    lastName: profile?.shippingAddress?.lastName || '',
    street: profile?.shippingAddress?.street || '',
    street2: profile?.shippingAddress?.street2 || '',
    city: profile?.shippingAddress?.city || '',
    state: profile?.shippingAddress?.state || (stateNames.length > 0 ? stateNames[0] : ''),
    zip: profile?.shippingAddress?.zip || '',
    region: profile?.shippingAddress?.region || 'United States',
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      // Prepare shipping address object
      const shippingAddressData = {
        firstName: values.firstName,
        lastName: values.lastName,
        street: values.street,
        street2: values.street2,
        city: values.city,
        state: values.state,
        zip: values.zip,
        region: values.region,
      };

      const payload = {
        shippingAddressJson: JSON.stringify(shippingAddressData),
      };

      const response = await updateProfile(payload as FormData | Partial<AccountSchema>);
      if ('error' in response) {
        toast.error((response.error as Error).message);
      } else {
        toast.success('Shipping address updated successfully!');
      }
      router.refresh();
    } catch (err) {
      let message = 'An error occurred while updating shipping address.';
      if (isAxiosError(err)) {
        message = err.response?.data?.message || err.message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={shippingAddressSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, dirty }) => (
        <Form>
          <div className='page-title mb-5 fs-1'>Shipping Address</div>

          <div className='row g-4'>
            <div className='col-12 col-md-6'>
              <Field name='firstName'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='First Name' type='text' />
                )}
              </Field>
              <ErrorMessage name='firstName' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-12 col-md-6'>
              <Field name='lastName'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='Last Name' type='text' />
                )}
              </Field>
              <ErrorMessage name='lastName' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-12'>
              <Field name='street'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='Street' type='text' />
                )}
              </Field>
              <ErrorMessage name='street' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-12'>
              <Field name='street2'>
                {({ field }: FieldProps) => (
                  <ProfileField
                    {...field}
                    disabled={!profile?.id}
                    placeholder='Apartment, suite, etc. (optional)'
                    type='text'
                  />
                )}
              </Field>
              <ErrorMessage name='street2' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-12'>
              <Field name='city'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='City' type='text' />
                )}
              </Field>
              <ErrorMessage name='city' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-md-6'>
              <Field name='state'>
                {({ field }: FieldProps) => (
                  <div className='form-floating'>
                    <select {...field} disabled={!profile?.id} id='profile_shipping_state' className='form-select'>
                      {isLoadingStates ? (
                        <option>Loading states...</option>
                      ) : (
                        stateNames.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))
                      )}
                    </select>
                    <label htmlFor={'profile_shipping_state'}>State</label>
                  </div>
                )}
              </Field>
              <ErrorMessage name='state' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-md-6'>
              <Field name='zip'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} disabled={!profile?.id} placeholder='ZIP Code' type='text' />
                )}
              </Field>
              <ErrorMessage name='zip' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>

            <div className='col-12'>
              <Field name='region'>
                {({ field }: FieldProps) => (
                  <ProfileField {...field} readOnly placeholder='Country / Region' type='text' />
                )}
              </Field>
              <ErrorMessage name='region' component={'div'} className='invalid-feedback d-block text-sm fw-medium' />
            </div>
          </div>

          <div className='mt-4'>
            <button
              disabled={!profile?.id || isSubmitting || isLoading || !dirty}
              type='submit'
              className='btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2'
            >
              {isLoading && <Spinner size='sm' className='border-2' />}
              Update Address
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
