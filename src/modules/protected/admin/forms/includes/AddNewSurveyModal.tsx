'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from 'react-icons/md';
import { Modal } from '@/components/elements';
import { ROUTES } from '@/constants';
import { RootState } from '@/store';
import { setSurvey } from '@/store/slices/surveySlice';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import { setSurveyType } from '@/store/slices/surveyTypeSlice';
import { addNewSurveySchema, AddNewSurveyValues } from '@/schemas/addNewSurvey';

interface AddNewSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddNewSurveyModal = ({ isOpen, onClose }: Readonly<AddNewSurveyModalProps>) => {
  const dispatch = useDispatch();

  const linkRef = useRef<HTMLAnchorElement>(null);

  const surveyTypes = useSelector((state: RootState) => state.surveyTypes);

  const formik = useFormik<AddNewSurveyValues>({
    initialValues: {
      name: '',
      typeId: '',
    },
    validationSchema: addNewSurveySchema,
    onSubmit: (values, helpers) => {
      const surveyType = surveyTypes.find((type) => type.id === values.typeId);

      if (!surveyType) {
        helpers.setFieldError('typeId', 'Selected form type is invalid');
        return;
      }

      dispatch(setSurveyType(surveyType));
      localStorage.removeItem('lumimeds_savedSurvey');
      dispatch(
        setSurvey({
          name: values.name,
          type: surveyType,
          hasUnsavedChanges: true,
          id: null,
          isActive: null,
          totalResponses: null,
        })
      );
      dispatch(setSurveyQuestions([]));
      linkRef.current?.click();
      helpers.resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const typeIdError = useMemo(() => {
    if ((!formik.touched.typeId && formik.submitCount === 0) || !formik.errors.typeId) {
      return null;
    }

    return formik.errors.typeId;
  }, [formik.errors.typeId, formik.submitCount, formik.touched.typeId]);

  const footerContent = (
    <div className='tw-flex tw-w-full tw-items-center tw-gap-2'>
      <button
        onClick={handleClose}
        className='tw-flex-1 tw-rounded-lg tw-border tw-border-primary tw-border-solid tw-bg-white tw-py-2 tw-font-medium tw-text-primary tw-transition-colors hover:tw-bg-primary/10 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary/30'
        type='button'
      >
        Close
      </button>
      <button
        onClick={() => formik.submitForm()}
        className='tw-flex-1 tw-rounded-lg tw-bg-primary tw-py-2 tw-font-medium tw-text-white tw-transition-colors hover:tw-bg-deep-blue focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary/30'
        type='button'
        disabled={formik.isSubmitting}
      >
        Proceed
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='md'
      title='Add New Survey'
      showFooter
      footer={footerContent}
      disabledBodyPadding
    >
      <form onSubmit={formik.handleSubmit} className='tw-space-y-3'>
        <div className='tw-space-y-2 tw-px-4 sm:tw-px-6'>
          <label className='tw-text-base tw-font-medium' htmlFor='new-survey-name'>
            Form Name
          </label>
          <input
            id='new-survey-name'
            className='tw-w-full tw-rounded-lg tw-border tw-border-light-gray tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-transition tw-duration-150 focus:tw-border-primary focus:tw-ring-2 focus:tw-ring-primary/20'
            type='text'
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder='Enter Form name'
          />
          {formik.touched.name && formik.errors.name && (
            <span className='tw-text-xs tw-text-red-500'>{formik.errors.name}</span>
          )}
        </div>

        <div>
          <span className='tw-font-medium tw-px-4 sm:tw-px-6'>Select Form Type</span>
          <div className='tw-flex tw-max-h-80 tw-flex-col tw-gap-3 tw-overflow-y-auto tw-px-4 sm:tw-px-6 tw-py-2'>
            {surveyTypes.map((type, index) => {
              const typeId = type.id ?? '';
              const isActive = typeId !== '' && typeId === formik.values.typeId;
              const optionId = typeId ? `survey-type-${typeId}` : `survey-type-${index}`;
              const isDisabled = !type.id;
              const labelText = type.name ?? 'Survey type option';

              return (
                <label
                  key={type.id ?? `${labelText}-${index}`}
                  htmlFor={optionId}
                  className={`tw-flex tw-cursor-pointer tw-items-center tw-gap-3 tw-rounded-lg tw-border tw-px-3 tw-py-2 tw-text-left tw-transition-all ${
                    isActive
                      ? 'tw-border-primary tw-bg-primary-light tw-shadow-custom'
                      : 'tw-border-light-gray tw-bg-white hover:tw-border-primary'
                  } ${isDisabled ? 'tw-cursor-not-allowed tw-opacity-60 hover:tw-border-light-gray' : ''}`}
                  aria-disabled={isDisabled}
                  aria-label={labelText}
                >
                  <input
                    id={optionId}
                    type='radio'
                    name='typeId'
                    value={typeId}
                    checked={isActive}
                    onBlur={formik.handleBlur}
                    onChange={() => {
                      if (!type.id) {
                        return;
                      }
                      formik.setFieldValue('typeId', type.id);
                      formik.setFieldTouched('typeId', true, false);
                    }}
                    className='tw-sr-only'
                    disabled={isDisabled}
                  />
                  <span className='tw-flex tw-items-center tw-gap-3'>
                    <span
                      className={`tw-flex tw-h-5 tw-w-5 tw-items-center tw-justify-center tw-rounded-full tw-transition-all ${
                        isActive ? 'tw-bg-primary tw-text-white' : 'tw-bg-white tw-text-light-grey-medium'
                      }`}
                    >
                      {isActive ? (
                        <MdOutlineRadioButtonChecked className='tw-w-5 tw-h-5 tw-flex-shrink-0 tw-transition-all' />
                      ) : (
                        <MdOutlineRadioButtonUnchecked className='tw-w-5 tw-h-5 tw-flex-shrink-0 tw-transition-all' />
                      )}
                    </span>
                    <span className='tw-text-sm tw-font-medium tw-text-charcoal-gray'>{labelText}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {typeIdError && <p className='tw-text-xs tw-text-red-500 tw-px-4 sm:tw-px-6'>{typeIdError}</p>}
        </div>

        <button type='submit' className='tw-hidden' />
        <Link ref={linkRef} href={ROUTES.ADMIN_FORM_BUILDER} className='tw-hidden' />
      </form>
    </Modal>
  );
};
