'use client';

import { useState, useEffect, HTMLInputTypeAttribute, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import ReactSelect, { SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import { RefillQuestion, RefillSurveyPayload, useSubmitRefillSurveyMutation } from '@/store/slices/surveysApiSlice';
import { Error, OptionValue, RefillType } from '@/lib/types';
import { QuestionType } from '@/lib/enums';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Spinner } from 'react-bootstrap';
import { FaArrowRight, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { SelectDatepicker } from 'react-select-datepicker';
import { useRouter } from 'next/navigation';
import { useStates } from '@/hooks/useStates';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';

// Type definitions
interface ShippingAddress {
  street: string;
  street2: string;
  city: string;
  region: string;
  state: string;
  zip: string;
}

type FormValues = {
  [key: string]: string | string[] | ShippingAddress | Date | null;
  firstName: string;
  lastName: string;
  shippingAddress: ShippingAddress;
};

interface RefillSurveyFormProps {
  questions: RefillQuestion[];
  refillType?: RefillType | null;
  initialEmail?: string;
  surveyId: string;
  orderId: string;
}

export const RefillForm = ({ questions, refillType, initialEmail = '', orderId, surveyId }: RefillSurveyFormProps) => {
  const { push } = useRouter();
  const { stateOptions } = useStates();

  const [currentStep, setCurrentStep] = useState(0);
  const [visibleQuestions, setVisibleQuestions] = useState<RefillQuestion[]>([]);

  const [submitRefillSurvey, { isLoading }] = useSubmitRefillSurveyMutation();

  // Generate initial values dynamically
  const generateInitialValues = (): FormValues => {
    const values: FormValues = {
      firstName: '',
      lastName: '',
      shippingAddress: {
        street: '',
        street2: '',
        city: '',
        region: 'United States',
        state: '',
        zip: '',
      },
    };

    visibleQuestions.forEach((question) => {
      if (!question.id) return;

      const fieldName = `question_${question.id}`;

      // Set initial value based on question type
      if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
        values[fieldName] = [];
      } else {
        values[fieldName] = '';
      }

      // Pre-fill email if provided
      if (question.questionText?.toLowerCase().includes('email') && initialEmail) {
        values[fieldName] = initialEmail;
      }
    });

    return values;
  };

  // Generate validation schema dynamically
  const generateValidationSchema = () => {
    const schemaFields: Record<string, Yup.AnySchema> = {};

    // Validate current step question
    const currentQuestion = visibleQuestions[currentStep];
    if (!currentQuestion) return Yup.object(schemaFields);

    const fieldName = `question_${currentQuestion.id}`;
    const textKey = currentQuestion.questionText?.toLowerCase() || '';
    const isFullName = textKey.includes('full name');

    // Add validation for current question
    let fieldSchema: Yup.AnySchema;

    switch (currentQuestion.validation) {
      case 'email':
        fieldSchema = Yup.string().email('Invalid email format');
        break;
      case 'phone':
        fieldSchema = Yup.string()
          .matches(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
          .min(10, 'Phone number must be at least 10 digits');
        break;
      case 'date':
        fieldSchema = Yup.string().required('This field is required.');
        break;
      case 'text':
      default:
        fieldSchema = Yup.string();
        break;
    }

    // Add required validation if needed
    if (currentQuestion.isRequired) {
      if (currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE) {
        fieldSchema = Yup.array().min(1, `This field is required`);
      } else {
        fieldSchema = fieldSchema.required(`This field is required`);
      }
    }

    schemaFields[fieldName] = fieldSchema;

    // Add full name validation
    if (isFullName) {
      schemaFields.firstName = Yup.string().required('First name is required');
      schemaFields.lastName = Yup.string().required('Last name is required');
    }

    // Add shipping address validation if needed
    if (refillType === 'Order') {
      const shippingChangeQuestion = visibleQuestions.find(
        (q) =>
          currentQuestion.id === q.id &&
          currentQuestion.description?.toLowerCase().includes('complete shipping address')
      );

      const shippingPrev = visibleQuestions.findIndex(
        (q) =>
          currentQuestion.id === q.id &&
          currentQuestion.description?.toLowerCase().includes('complete shipping address')
      );

      const prevQ = visibleQuestions[shippingPrev - 1];

      if (shippingChangeQuestion) {
        const changeFieldName = `question_${prevQ.id}`;
        schemaFields.shippingAddress = Yup.object().when(changeFieldName, {
          is: 'Yes',
          then: () =>
            Yup.object({
              street: Yup.string().trim().required('Street address is required'),
              street2: Yup.string().trim(),
              city: Yup.string().trim().required('City is required'),
              region: Yup.string().default('United States'),
              state: Yup.string().trim().required('State is required'),
              zip: Yup.string()
                .trim()
                .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code format')
                .required('Zip code is required'),
            }),
          otherwise: () => Yup.object().nullable(),
        });
      }
    }

    return Yup.object(schemaFields);
  };

  const handleChangeDate = useCallback(
    (date: Date | null, field: string, setFieldValue: (field: string, value: Date | null) => void) => {
      setFieldValue(field, date);
    },
    []
  );

  const renderQuestion = (question: RefillQuestion, formik: FormikProps<FormValues>) => {
    if (!question.id || !question.questionText) return null;

    const fieldName = `question_${question.id}`;
    const { questionText, questionType, options, validation } = question;
    const textKey = questionText?.toLowerCase();
    const isFullName = textKey.includes('full name');
    const isDateQuestion = textKey.includes('date');

    // Check if this is a conditional question
    const isConditional = question.metaData?.conditional;
    if (isConditional) {
      const dependentQuestion = visibleQuestions.find((q) => q.position === isConditional.dependsOn);
      if (dependentQuestion?.id) {
        const dependentFieldName = `question_${dependentQuestion.id}`;
        const dependentValue = formik.values[dependentFieldName];
        if (dependentValue !== isConditional.showIf) {
          return null; // Don't render if condition not met
        }
      }
    }

    switch (questionType) {
      case QuestionType.INPUT_BOX:
        if (question.metaData?.addressField === 'shippingAddress') {
          return (
            <div className='row g-4'>
              <div className='col-12'>
                <label htmlFor='shippingAddress.street'>Address Line 1 (Primary address)</label>
                <Field
                  type='text'
                  name='shippingAddress.street'
                  className='form-control dark-input border-black rounded-1'
                  placeholder='Street Address'
                />
                <ErrorMessage name='shippingAddress.street' component='div' className='text-danger text-sm mt-1' />
              </div>
              <div className='col-12'>
                <label htmlFor='shippingAddress.street2'>
                  Address Line 2 (Optional: building, floor, landmark, etc.)
                </label>
                <Field
                  type='text'
                  name='shippingAddress.street2'
                  className='form-control dark-input border-black rounded-1'
                  placeholder='Apartment, suite, etc.'
                />
              </div>
              <div className='col-12'>
                <label htmlFor='shippingAddress.city'>City</label>
                <Field
                  type='text'
                  name='shippingAddress.city'
                  className='form-control dark-input border-black rounded-1'
                  placeholder='City'
                />
                <ErrorMessage name='shippingAddress.city' component='div' className='text-danger text-sm mt-1' />
              </div>
              <div className='col-lg-6'>
                <label htmlFor='shippingAddress.state'>State</label>
                <ReactSelect
                  options={stateOptions}
                  value={
                    formik.values.shippingAddress?.state
                      ? { value: formik.values.shippingAddress.state, label: formik.values.shippingAddress.state }
                      : null
                  }
                  onChange={(option: SingleValue<OptionValue>) => {
                    if (option) {
                      formik.setFieldValue('shippingAddress.state', option.value);
                    }
                  }}
                  isSearchable
                  placeholder='Select State'
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      width: '100%',
                      borderRadius: '6px',
                      borderColor: 'black',
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                    }),
                    indicatorSeparator: () => ({
                      display: 'none',
                    }),
                  }}
                />
                <ErrorMessage name='shippingAddress.state' component='div' className='text-danger text-sm mt-1' />
              </div>
              <div className='col-lg-6'>
                <label htmlFor='shippingAddress.zip'>Zip Code</label>
                <Field
                  type='text'
                  name='shippingAddress.zip'
                  className='form-control dark-input border-black rounded-1'
                  placeholder='12345'
                />
                <ErrorMessage name='shippingAddress.zip' component='div' className='text-danger text-sm mt-1' />
              </div>
              <div className='col-12'>
                <label htmlFor='shippingAddress.region'>Region</label>
                <Field
                  type='text'
                  name='shippingAddress.region'
                  className='form-control dark-input border-black rounded-1'
                  value='United States'
                  readOnly
                />
              </div>
            </div>
          );
        }

        // Full name handling
        if (isFullName) {
          return (
            <div className='row g-3'>
              <div className='col-md-6'>
                <input
                  value={formik.values.firstName}
                  id='firstName'
                  onChange={async (e) => {
                    formik.handleChange(e);
                    await formik.setFieldValue(fieldName, `${e.target.value} ${formik.values.lastName}`);
                    formik.setFieldTouched(fieldName, true);
                  }}
                  onBlur={formik.handleBlur}
                  name='firstName'
                  placeholder='First Name'
                  className='form-control dark-input border-black rounded-1'
                />
                <ErrorMessage name='firstName' component='div' className='text-danger small' />
              </div>
              <div className='col-md-6'>
                <input
                  value={formik.values.lastName}
                  id='lastName'
                  name='lastName'
                  onChange={async (e) => {
                    formik.handleChange(e);
                    await formik.setFieldValue(fieldName, `${formik.values.firstName} ${e.target.value}`);
                    formik.setFieldTouched(fieldName, true);
                  }}
                  onBlur={formik.handleBlur}
                  placeholder='Last Name'
                  className='form-control dark-input border-black rounded-1'
                />
                <ErrorMessage name='lastName' component='div' className='text-danger small' />
              </div>
            </div>
          );
        }

        // Phone number handling
        if (validation === 'phone') {
          return (
            <>
              <CustomPhoneInput
                autoFocus
                value={formik.values[fieldName] as string}
                onChange={(e) => {
                  const phone = e.target.value;
                  formik.setFieldValue(fieldName, phone);
                }}
                onBlur={formik.handleBlur}
                name={fieldName}
                className='form-control dark-input border-black rounded-1'
              />
              <ErrorMessage name={fieldName} component='div' className='text-danger text-sm mt-1' />
            </>
          );
        }

        if (isDateQuestion) {
          return (
            <>
              <SelectDatepicker
                selectedDate={formik.values[fieldName] ? (formik.values[fieldName] as Date) : null}
                onDateChange={(date) => handleChangeDate(date, fieldName, formik.setFieldValue)}
                hideLabels
                maxDate={new Date()}
                labels={{ yearPlaceholder: 'Year', dayPlaceholder: 'Day', monthPlaceholder: 'Month' }}
              />
              <ErrorMessage name={fieldName} component='div' className='text-danger text-sm mt-1' />
            </>
          );
        }

        // Regular input
        return (
          <>
            <Field
              type={(validation as HTMLInputTypeAttribute) || 'text'}
              name={fieldName}
              className='form-control dark-input border-black rounded-1'
              placeholder={`Enter ${questionText?.toLowerCase()}`}
            />
            <ErrorMessage name={fieldName} component='div' className='text-danger text-sm mt-1' />
          </>
        );

      case QuestionType.CHECKBOXES:
      case QuestionType.DROPDOWN:
        return (
          <>
            <div className='d-grid gap-3'>
              {options?.map((option, index) => (
                <button
                  key={option + index}
                  type='button'
                  onClick={() => formik.setFieldValue(fieldName, option)}
                  className={`tw-rounded border ${
                    option === formik.values[fieldName]
                      ? 'border-primary text-white bg-primary'
                      : 'border-secondary bg-white'
                  } w-100 tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4`}
                >
                  {option === formik.values[fieldName] ? (
                    <FaRegCheckCircle
                      className='flex-shrink-0'
                      color={option === formik.values[fieldName] ? 'white' : undefined}
                    />
                  ) : (
                    <FaRegCircle className='flex-shrink-0' />
                  )}
                  {option}
                </button>
              ))}
            </div>
            <ErrorMessage name={fieldName} component='div' className='text-danger text-sm mt-1' />
          </>
        );

      case QuestionType.MULTIPLE_CHOICE:
        const value = formik.values[fieldName];

        const handleOptionClick = (option: string) => {
          const arr = Array.isArray(value) ? [...value.filter((item) => !item?.toLowerCase().includes('none'))] : [];
          const idx = arr.indexOf(option);
          if (idx > -1) {
            arr.splice(idx, 1);
          } else {
            arr.push(option);
          }
          formik.setFieldValue(fieldName, arr);
        };

        function isSelected(option: string) {
          return Array.isArray(value) && value.includes(option);
        }

        return (
          <>
            <div className='form-group'>
              {options?.map((option, index) => (
                <button
                  key={option + index}
                  type='button'
                  onClick={() => handleOptionClick(option)}
                  className={`tw-rounded border ${
                    isSelected(option) ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
                  } tw-w-full tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4`}
                >
                  {isSelected(option) ? (
                    <FaRegCheckCircle className='flex-shrink-0' color={isSelected(option) ? 'white' : undefined} />
                  ) : (
                    <FaRegCircle className='flex-shrink-0' />
                  )}
                  {option}
                </button>
              ))}
              <ErrorMessage name={fieldName} component='div' className='text-danger text-sm mt-1' />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Updated shouldSkipToNext to handle positive path navigation
  const shouldSkipToNext = (currentQuestion: RefillQuestion, values: FormValues) => {
    const nextByAnswer = currentQuestion.metaData?.nextByAnswer;
    if (nextByAnswer && currentQuestion.id) {
      const fieldName = `question_${currentQuestion.id}`;
      const currentValue = values[fieldName];

      if (currentValue && nextByAnswer[currentValue as string]) {
        const nextPosition = nextByAnswer[currentValue as string];
        const nextQuestionIndex = visibleQuestions.findIndex((q) => q.position === nextPosition);
        if (nextQuestionIndex !== -1) {
          setCurrentStep(nextQuestionIndex);
          return true;
        }
      }
    }
    return false;
  };

  const handleSubmit = async (values: FormValues, {}: FormikHelpers<FormValues>) => {
    try {
      const answers = [];
      let email = '';
      let shippingAddress: ShippingAddress | null = null;

      // Process each question answer
      visibleQuestions.forEach((question) => {
        if (!question.id) return;

        const fieldName = `question_${question.id}`;
        const answer = values[fieldName];

        if (answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0)) {
          answers.push({
            questionId: question.id,
            answer: Array.isArray(answer) ? answer : String(answer),
            isRequired: question.isRequired || false,
          });

          // Extract email for root level
          if (question.questionText?.toLowerCase().includes('email')) {
            email = String(answer);
          }
        }
      });

      // Handle shipping address if applicable
      if (refillType === 'Order' && values.shippingAddress) {
        const shippingChangeQuestion = visibleQuestions.find((q) =>
          q.questionText?.toLowerCase().includes('change your shipping address')
        );

        if (shippingChangeQuestion) {
          const changeFieldName = `question_${shippingChangeQuestion.id}`;

          if (values[changeFieldName] === 'Yes') {
            // Add shipping address as an answer
            const shippingAddressQuestion = visibleQuestions.find(
              (q) =>
                q.questionText?.toLowerCase().includes('shipping address') &&
                !q.questionText?.toLowerCase().includes('change your shipping address')
            );

            if (shippingAddressQuestion?.id) {
              const addressData = {
                ...values.shippingAddress,
                firstName: values.firstName,
                lastName: values.lastName,
              };

              answers.push({
                questionId: shippingAddressQuestion.id,
                answer: Object.values(addressData).join(','),
                isRequired: shippingAddressQuestion.isRequired || false,
              });
            }

            // Include shipping address in payload
            shippingAddress = values.shippingAddress;
          }
        }
      } else if (refillType === 'Subscription') {
        const shippingChangeQuestion = questions.find((q) =>
          q.questionText?.toLowerCase().includes('change your shipping address')
        );

        answers.push({
          questionId: shippingChangeQuestion?.id,
          answer: 'No',
          isRequired: shippingChangeQuestion?.isRequired,
        });
      }

      const payload: RefillSurveyPayload = {
        email,
        answers,
        surveyId,
        orderId,
        ...(shippingAddress
          ? {
              shippingAddress: {
                ...shippingAddress,
                firstName: values.firstName,
                lastName: values.lastName,
              },
            }
          : { shippingAddress: null }),
      };

      const { error } = await submitRefillSurvey(payload);
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success('Intake form submitted successfully');
        push('/');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleNext = async (values: FormValues, formik: FormikHelpers<FormValues>) => {
    formik.setTouched({});

    const currentQuestion = visibleQuestions[currentStep];
    if (!currentQuestion?.id) return;

    const fieldName = `question_${currentQuestion.id}`;

    // Validate current field if required
    if (currentQuestion.isRequired) {
      await formik.setFieldTouched(fieldName, true);
      const errors = await formik.validateForm();
      if (errors[fieldName]) {
        return;
      }
    }

    // Check for conditional navigation
    if (shouldSkipToNext(currentQuestion, values)) {
      return;
    }

    // Check if this is a "No" answer that should skip remaining questions
    if (isSkippableNoAnswer(currentQuestion, values)) {
      await handleSubmit(values, formik);
      return;
    }

    // Regular navigation
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit(values, formik);
    }
  };

  // Helper function to determine if current answer should skip remaining questions
  const isSkippableNoAnswer = (question: RefillQuestion, values: FormValues): boolean => {
    if (!question.id || !question.options) return false;

    const fieldName = `question_${question.id}`;
    const answer = values[fieldName];

    // Check if this is a "No" answer to a binary choice question
    if (answer === 'No' && question.options.includes('No') && question.options.length === 2) {
      // Check if there are conditional questions after this one
      const nextQuestion = visibleQuestions[currentStep + 1];
      if (nextQuestion?.metaData?.conditional?.showIf === 'Yes') {
        return true;
      }
    }
    return false;
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Sort questions by position and filter based on conditions
  useEffect(() => {
    try {
      let filteredQuestions: RefillQuestion[] = [...questions]
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .filter(Boolean); // Remove any null/undefined questions

      // Filter out shipping address questions if refillType is not 'Order'
      if (refillType !== 'Order') {
        filteredQuestions = filteredQuestions.filter((q) => {
          if (!q.questionText) return true;
          const isShippingRelated =
            q.questionText?.toLowerCase().includes('shipping address') ||
            q.description?.toLowerCase().includes('complete shipping address');
          return !isShippingRelated;
        });
      }

      setVisibleQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error filtering questions:', error);
      setVisibleQuestions([]);
    }
  }, [questions, refillType]);

  if (visibleQuestions.length === 0) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '200px' }}>
        <div className='text-center'>
          <Spinner />
          <p className='mt-2'>Loading... Please Wait!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='form-container mx-auto'>
      <Formik
        initialValues={generateInitialValues()}
        validationSchema={generateValidationSchema()}
        onSubmit={handleNext}
        enableReinitialize
        validateOnMount
      >
        {(formik) => {
          const currentQuestion = visibleQuestions[currentStep];

          const isNext =
            refillType === 'Order'
              ? currentQuestion.metaData?.nextByAnswer?.[formik.values[`question_${currentQuestion.id}`] as string] &&
                currentStep === visibleQuestions.length - 2 &&
                currentStep < visibleQuestions.length - 1
              : currentStep < visibleQuestions.length - 1;
          return (
            <Form>
              <div className='mb-5 d-flex align-items-center gap-4'>
                {currentStep > 0 && (
                  <span
                    onClick={handlePrevious}
                    className='d-inline-flex user-select-none align-items-center gap-2 text-primary cursor-pointer'
                  >
                    <FiArrowLeft size={16} />
                    Back
                  </span>
                )}
                <div className='progress flex-grow-1'>
                  <div
                    className='progress-bar'
                    role='progressbar'
                    style={{
                      width: `${
                        ((refillType === 'Order' ? (isNext ? currentStep + 1 : currentStep + 2) : currentStep + 1) /
                          visibleQuestions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='mb-5 pb-3 font-instrument-serif text-center display-4'>
                    <span>{visibleQuestions[currentStep].questionText}</span>
                  </div>
                  <div className='mb-5'>{renderQuestion(visibleQuestions[currentStep], formik)}</div>
                  <div>
                    <button
                      type='submit'
                      className='btn btn-primary rounded-pill py-12  d-flex align-items-center w-100 justify-content-center gap-2'
                      disabled={formik.isSubmitting || !formik.isValid || isLoading}
                    >
                      {isNext
                        ? 'Next'
                        : currentStep < visibleQuestions.length - 2 && refillType === 'Order'
                        ? 'Next'
                        : 'Submit'}
                      {formik.isSubmitting || isLoading ? <Spinner size='sm' /> : <FaArrowRight size={18} />}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
