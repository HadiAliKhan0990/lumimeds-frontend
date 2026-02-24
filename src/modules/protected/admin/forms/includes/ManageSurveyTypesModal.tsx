'use client';

import toast from 'react-hot-toast';
import { RootState } from '@/store';
import { useAddSurveyTypeMutation, useLazyGetSurveyTypesQuery } from '@/store/slices/surveysApiSlice';
import { CiCircleMinus } from 'react-icons/ci';
import { useSelector } from 'react-redux';
import { isAxiosError } from 'axios';
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FormikProps } from 'formik';
import { useMemo, useRef } from 'react';
import { Modal } from '@/components/elements';
import { Error } from '@/lib/types';
import { CreateSurveyTypeValues, validationSchema } from '@/schemas/createSurveyType';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { SurveyType } from '@/store/slices/surveyTypeSlice';

interface ManageSurveyTypesProps {
  onClose?: () => void;
  isOpen: boolean;
  onRemoveSurveyType: (type: SurveyType) => void;
}

export function ManageSurveyTypes({ onClose, isOpen, onRemoveSurveyType }: Readonly<ManageSurveyTypesProps>) {
  const formikRef = useRef<FormikProps<CreateSurveyTypeValues>>(null);

  const surveyTypes = useSelector((state: RootState) => state.surveyTypes);

  const [addSurveyTypeMutation, { isLoading }] = useAddSurveyTypeMutation();
  const [triggerSurveyTypes, { isFetching }] = useLazyGetSurveyTypesQuery();

  const initialValues = useMemo<CreateSurveyTypeValues>(() => ({ name: '' }), []);

  const handleAddSurveyTypeSubmit = async (
    { name }: CreateSurveyTypeValues,
    { resetForm, setSubmitting }: FormikHelpers<CreateSurveyTypeValues>
  ) => {
    try {
      const trimmedName = name.trim();
      const { success, message } = await addSurveyTypeMutation(trimmedName).unwrap();

      if (success) {
        await triggerSurveyTypes();
        resetForm();
        toast.success(message || 'Survey type created successfully');
      } else {
        toast.error(message || 'Failed to create survey type');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error occurred while creating survey type');
      } else {
        toast.error((error as Error).data.message || 'Error occurred while creating survey type');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderSurveyTypesList = () => {
    if (isFetching) {
      return (
        <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-gray-100 tw-bg-white tw-py-6'>
          <span className='tw-inline-flex tw-h-5 tw-w-5 tw-animate-spin tw-rounded-full tw-border-2 tw-border-indigo-500 tw-border-t-transparent' />
          <span className='tw-mt-2 tw-text-xs tw-font-medium tw-text-gray-500'>Loading survey types...</span>
        </div>
      );
    }

    if (surveyTypes.length === 0) {
      return (
        <div className='tw-rounded-lg tw-border tw-border-dashed tw-border-gray-300 tw-bg-gray-50 tw-py-6 tw-text-center'>
          <p className='tw-text-sm tw-font-medium tw-text-gray-600'>No form types yet</p>
          <p className='tw-mt-1 tw-text-xs tw-text-gray-500'>Create your first type to get started.</p>
        </div>
      );
    }

    return surveyTypes.map((type) => (
      <div
        key={type.id ?? type.name}
        className='tw-flex tw-items-center tw-justify-between tw-rounded-md tw-border tw-border-slate-200 tw-bg-white tw-px-3 tw-py-2'
      >
        <span className='tw-text-sm tw-font-medium'>{type.name}</span>
        {!type.isDefault && (
          <CiCircleMinus
            onClick={() => {
              formikRef.current?.resetForm();
              onRemoveSurveyType(type);
            }}
            size={20}
            className='tw-text-red-500 tw-cursor-pointer'
            aria-label={`Remove ${type.name ?? 'survey type'}`}
          />
        )}
      </div>
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Manage Form Types' size='md' bodyClassName='tw-pt-0 tw-pb-6'>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleAddSurveyTypeSubmit}
      >
        {({ isSubmitting, resetForm, touched, errors, isValid }) => {
          return (
            <Form className='tw-space-y-6 tw-text-gray-900'>
              <div>
                <p className='tw-mb-1 tw-text-sm tw-font-semibold tw-text-gray-900'>Form Types</p>
                <div className='tw-mt-3 tw-max-h-60 tw-space-y-2 tw-overflow-y-auto tw-pr-1'>
                  {renderSurveyTypesList()}
                </div>
              </div>

              <div className='tw-space-y-2'>
                <label className='tw-text-sm tw-font-semibold tw-text-gray-900' htmlFor='name'>
                  Add New Type
                </label>
                <Field
                  id='name'
                  name='name'
                  type='text'
                  placeholder='e.g. Post Intake Follow-up'
                  autoComplete='off'
                  className={`tw-w-full tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2.5 tw-text-sm tw-font-medium tw-text-gray-900 tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-100 focus:tw-border-indigo-400 ${
                    touched.name && errors.name ? 'tw-border-red-400 tw-bg-red-50' : 'tw-border-gray-200'
                  }`}
                />
                <ErrorMessage name='name' component='span' className='tw-text-xs tw-text-red-500' />
              </div>

              <div className='tw-grid tw-grid-cols-2 tw-gap-3'>
                <button
                  type='button'
                  disabled={isSubmitting || isLoading || isFetching}
                  onClick={() => {
                    resetForm();
                    onClose?.();
                  }}
                  className='tw-inline-flex tw-w-full tw-items-center tw-justify-center tw-rounded-lg tw-transition-all tw-border-solid tw-border tw-border-primary tw-bg-white tw-py-2.5 tw-text-sm tw-font-semibold tw-text-primary hover:tw-bg-primary/10'
                >
                  Discard
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting || isLoading || isFetching || !isValid}
                  className='tw-inline-flex tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-bg-primary tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white tw-transition-all hover:tw-bg-primary/80 disabled:tw-pointer-events-none disabled:tw-opacity-70'
                >
                  {(isLoading || isFetching || isSubmitting) && <CircularProgress />}
                  Add Type
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
