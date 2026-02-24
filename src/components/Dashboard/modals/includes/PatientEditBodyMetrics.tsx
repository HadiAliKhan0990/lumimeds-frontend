'use client';

import toast from 'react-hot-toast';
import { bodyMetricsSchema, BodyMetricsSchema } from '@/lib/schema/patientBodyMetrics';
import type { Error, Response } from '@/lib/types';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import { isAxiosError } from 'axios';
import { Field, FormikProvider, useFormik } from 'formik';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, CircularProgress } from '@/components/elements';

export function PatientEditBodyMetrics() {
  const dispatch = useDispatch();

  const { modalType } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const isOpen = modalType === 'Edit Patient Body Metrics';
  const ctx = useSelector((state: RootState) => state.modal.ctx) as {
    height: string;
    weight: number;
    bmi: number;
  };

  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();

  const formik = useFormik<BodyMetricsSchema>({
    initialValues: {
      heightFeet: '',
      heightInches: '',
      weight: 0,
      bmi: 0,
    },
    validationSchema: bodyMetricsSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await handleEditBodyMetrics(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    dispatch(setModal({ modalType: undefined }));
  };

  const { heightFeet, heightInches, weight } = formik.values;

  // Compute BMI
  const computedBmi = useMemo(() => {
    const feet = parseInt(heightFeet) || 0;
    const inches = parseInt(heightInches) || 0;

    // Clamp values (optional, for validation)
    const clampedFeet = Math.min(feet, 11); // Max 11 feet
    const clampedInches = Math.min(inches, 11); // Max 11 inches

    // Convert height to total inches → then to meters
    const totalInches = clampedFeet * 12 + clampedInches;
    const heightMeters = totalInches * 0.0254; // 1 inch = 0.0254 meters

    // Convert weight from lbs to kg (1 lb = 0.453592 kg)
    const weightKg = weight * 0.453592;

    if (heightMeters === 0 || weightKg === 0) return 0;

    // Metric BMI formula: weight (kg) / (height (m))²
    const bmi = weightKg / (heightMeters * heightMeters);

    // Round to 2 decimal places (matching your function)
    return parseFloat(bmi.toFixed(2));
  }, [heightFeet, heightInches, weight]);

  useEffect(() => {
    if (Number(heightFeet) > 11) formik.setFieldValue('heightFeet', '11');
    if (Number(heightInches) > 11) formik.setFieldValue('heightInches', '11');
  }, [heightFeet, heightInches]);

  const handleEditBodyMetrics = async (data: BodyMetricsSchema) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bmi, ...rest } = data;

    // Get only the dirty (changed) fields
    const dirtyFields = Object.keys(rest).filter(
      (key) => formik.initialValues[key as keyof typeof rest] !== rest[key as keyof typeof rest]
    );

    if (dirtyFields && dirtyFields.length > 0) {
      const updatedPatientDetails = {
        ...dirtyFields.map((k) => ({ [k]: rest[k as keyof typeof rest] })),
      };
      const mergedObject = Object.assign({}, ...Object.values(updatedPatientDetails));

      // Convert height values to strings, keep weight as number
      const bioData = Object.fromEntries(
        Object.entries(mergedObject).map(([key, value]) => [key, key === 'weight' ? Number(value) : String(value)])
      );

      try {
        const { success, message }: Response = await updatePatientDetails({
          id: patient.id,
          bio: { ...bioData },
        }).unwrap();
        if (success) {
          toast.success(message || 'Patient Medical History Updated!');
          handleClose();
        } else {
          toast.error(message || 'Error updating Patient Body Metrics!');
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message || 'Error updating Patient Body Metrics!');
        } else {
          toast.error((error as Error).data.message || 'Error updating Patient Body Metrics!');
        }
      }
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    if (patient) {
      const heightString = ctx.height || '0 ft 0 in'; // e.g., "5 ft 5 in"
      const match = heightString.match(/(\d+)\s*ft\s*(\d+)\s*in/);

      let heightFeet = '';
      let heightInches = '';

      if (match) {
        heightFeet = match[1]; // "5"
        heightInches = match[2]; // "5"
      }
      formik.setFieldValue('heightFeet', heightFeet ?? '');
      formik.setFieldValue('heightInches', heightInches ?? '');
      formik.setFieldValue('weight', ctx?.weight ?? 0);
    }
  }, [patient]);

  useEffect(() => {
    formik.setFieldValue('bmi', computedBmi);
  }, [computedBmi]);

  const isValid = useMemo(() => {
    return computedBmi >= 18;
  }, [computedBmi]);

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
        form='patient-edit-body-metrics-form'
        disabled={!isValid || isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Update
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md' title='Body Metrics' footer={footer} showFooter={true}>
      <FormikProvider value={formik}>
        <form id='patient-edit-body-metrics-form' onSubmit={formik.handleSubmit}>
          <div className='tw-grid tw-grid-cols-2 tw-gap-2'>
            <div>
              <label htmlFor='heightFeet' className='form-label small text-secondary'>
                Height (in feet)
              </label>
              <Field
                as='select'
                id='heightFeet'
                name='heightFeet'
                className={
                  'form-select shadow-none' +
                  (formik.touched.heightFeet && formik.errors.heightFeet ? ' is-invalid' : '')
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
                  <option key={f} value={String(f)}>
                    {f}
                  </option>
                ))}
              </Field>

              {formik.touched.heightFeet && formik.errors.heightFeet && (
                <span className='small text-danger'>{formik.errors.heightFeet}</span>
              )}
            </div>
            <div>
              <label htmlFor='heightInches' className='form-label small text-secondary'>
                Height (in inches)
              </label>
              <Field
                as='select'
                id='heightInches'
                name='heightInches'
                className={`form-select shadow-none ${
                  formik.touched.heightInches && formik.errors.heightInches ? ' is-invalid' : ''
                }`}
              >
                {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                  <option key={inch} value={String(inch)}>
                    {inch}
                  </option>
                ))}
              </Field>
              {formik.touched.heightInches && formik.errors.heightInches && (
                <span className='small text-danger'>{formik.errors.heightInches}</span>
              )}
            </div>
            <div className='tw-col-span-2'>
              <label htmlFor='weight' className='form-label small text-secondary'>
                Weight (in lbs)
              </label>
              <Field
                id='weight'
                name='weight'
                type='number'
                className={
                  'form-control shadow-none' + (formik.touched.weight && formik.errors.weight ? ' is-invalid' : '')
                }
              />
              {formik.touched.weight && formik.errors.weight && (
                <span className='small text-danger'>{formik.errors.weight}</span>
              )}
            </div>
            <div className='tw-col-span-2'>
              <label htmlFor='bmi' className='form-label small text-secondary'>
                BMI
              </label>
              <div className='form-control disabled tw-select-none shadow-none'>{formik.values.bmi}</div>
              {!isValid && computedBmi > 0 && (
                <span className='small text-danger'>BMI is below recommended minimum (18)</span>
              )}
              {formik.errors.bmi && <span className='small text-danger'>{formik.errors.bmi}</span>}
            </div>
          </div>
        </form>
      </FormikProvider>
    </Modal>
  );
}
