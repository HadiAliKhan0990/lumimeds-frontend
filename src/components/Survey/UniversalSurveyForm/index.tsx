'use client';

import SurveyMultiInbox from '@/components/PatientSurvey/SurveyMultiInbox';
import Dropzone from 'react-dropzone';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ErrorMessage, Field, FieldProps, Formik, Form, FormikProps, FormikHelpers } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { QuestionType } from '@/lib/enums';
import { MultipleChoice } from '@/modules/landing/survey/PatientIntakeSurvey/includes/MultipleChoice';
import { SingleChoice } from '@/modules/landing/survey/PatientIntakeSurvey/includes/SingleChoice';
import { InputQuestionBox } from '@/modules/landing/survey/PatientIntakeSurvey/includes/InputQuestionBox';
import { HeightQuestion } from '@/modules/landing/survey/PatientIntakeSurvey/includes/HeightQuestion';
import { FaArrowRight, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { useStates } from '@/hooks/useStates';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { RiCloseLargeLine } from 'react-icons/ri';
import { Spinner } from 'react-bootstrap';
import { extractFileName } from '@/lib/helper';
import { PatientIntakeFormValues } from '@/types/survey';
import { PatientSurveyAnswerType, PatientSurveyValidationType, Error as ApiError } from '@/lib/types';
import { SurveyQuestion, MultiInput } from '@/store/slices/surveyQuestionSlice';
import { useLazyGetQuestionByIdQuery } from '@/store/slices/surveysApiSlice';
import { validationSchema } from '@/schemas/patientIntakeSurvey';
import { uploadSurveyFile } from '@/lib/fileUpload';

// Address Data Type
type AddressData = {
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    region: string;
    state: string;
    zip: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    region: string;
    state: string;
    zip: string;
  };
  sameAsBilling: boolean;
};

// Address Form Component - defined outside to prevent recreation on each render
// Custom comparison function to prevent unnecessary re-renders while allowing address data updates
const AddressFormComponent = React.memo(
  ({
    addressData,
    setAddressData,
    errors,
    clearFieldError,
  }: {
    addressData: AddressData;
    setAddressData: React.Dispatch<React.SetStateAction<AddressData>>;
    errors: Record<string, string>;
    clearFieldError: (fieldName: string) => void;
  }) => {
    const { stateNames, isLoading: isLoadingStates } = useStates();

    return (
      <div className='tw-space-y-8'>
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
                value={addressData.billingAddress.firstName}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, firstName: e.target.value },
                  }));
                  clearFieldError('billingAddress.firstName');
                }}
                className={`form-control ${errors['billingAddress.firstName'] ? 'tw-border-red-500' : ''}`}
              />
              {errors['billingAddress.firstName'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.firstName']}</div>
              )}
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Last Name <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.billingAddress.lastName}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, lastName: e.target.value },
                  }));
                  clearFieldError('billingAddress.lastName');
                }}
                className={`form-control ${errors['billingAddress.lastName'] ? 'tw-border-red-500' : ''}`}
              />
              {errors['billingAddress.lastName'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.lastName']}</div>
              )}
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.billingAddress.street}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, street: e.target.value },
                  }));
                  clearFieldError('billingAddress.street');
                }}
                className={`form-control ${errors['billingAddress.street'] ? 'tw-border-red-500' : ''}`}
              />
              {errors['billingAddress.street'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.street']}</div>
              )}
            </div>

            <div className='md:tw-col-span-2'>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Street Address 2 (Optional)
              </label>
              <input
                type='text'
                value={addressData.billingAddress.street2}
                onChange={(e) =>
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, street2: e.target.value },
                  }))
                }
                className='form-control'
              />
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                City <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.billingAddress.city}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, city: e.target.value },
                  }));
                  clearFieldError('billingAddress.city');
                }}
                className={`form-control ${errors['billingAddress.city'] ? 'tw-border-red-500' : ''}`}
              />
              {errors['billingAddress.city'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.city']}</div>
              )}
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                State <span className='tw-text-red-500'>*</span>
              </label>
              <select
                value={addressData.billingAddress.state}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, state: e.target.value },
                  }));
                  clearFieldError('billingAddress.state');
                }}
                className={`form-select ${errors['billingAddress.state'] ? 'tw-border-red-500' : ''}`}
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
              {errors['billingAddress.state'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.state']}</div>
              )}
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                ZIP Code <span className='tw-text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={addressData.billingAddress.zip}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    billingAddress: { ...prev.billingAddress, zip: e.target.value },
                  }));
                  clearFieldError('billingAddress.zip');
                }}
                maxLength={5}
                className={`form-control ${errors['billingAddress.zip'] ? 'tw-border-red-500' : ''}`}
              />
              {errors['billingAddress.zip'] && (
                <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['billingAddress.zip']}</div>
              )}
            </div>

            <div>
              <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                Country/Region <span className='tw-text-red-500'>*</span>
              </label>
              <input type='text' value={addressData.billingAddress.region} disabled className='form-control' />
            </div>
          </div>
        </div>

        {/* Same as Billing Checkbox */}
        <div>
          <label className='tw-flex tw-items-center tw-space-x-3 tw-cursor-pointer'>
            <input
              type='checkbox'
              checked={addressData.sameAsBilling}
              onChange={(e) => {
                setAddressData((prev) => ({
                  ...prev,
                  sameAsBilling: e.target.checked,
                  shippingAddress: e.target.checked ? prev.billingAddress : prev.shippingAddress,
                }));
              }}
              className='tw-w-5 tw-h-5 tw-text-blue-600 tw-border-gray-300 tw-rounded'
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
                  value={addressData.shippingAddress.firstName}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, firstName: e.target.value },
                    }));
                    clearFieldError('shippingAddress.firstName');
                  }}
                  className={`form-control ${errors['shippingAddress.firstName'] ? 'tw-border-red-500' : ''}`}
                />
                {errors['shippingAddress.firstName'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.firstName']}</div>
                )}
              </div>

              <div>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  Last Name <span className='tw-text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={addressData.shippingAddress.lastName}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, lastName: e.target.value },
                    }));
                    clearFieldError('shippingAddress.lastName');
                  }}
                  className={`form-control ${errors['shippingAddress.lastName'] ? 'tw-border-red-500' : ''}`}
                />
                {errors['shippingAddress.lastName'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.lastName']}</div>
                )}
              </div>

              <div className='md:tw-col-span-2'>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  Street Address <span className='tw-text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={addressData.shippingAddress.street}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, street: e.target.value },
                    }));
                    clearFieldError('shippingAddress.street');
                  }}
                  className={`form-control ${errors['shippingAddress.street'] ? 'tw-border-red-500' : ''}`}
                />
                {errors['shippingAddress.street'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.street']}</div>
                )}
              </div>

              <div className='md:tw-col-span-2'>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  Street Address 2 (Optional)
                </label>
                <input
                  type='text'
                  value={addressData.shippingAddress.street2}
                  onChange={(e) =>
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, street2: e.target.value },
                    }))
                  }
                  className='form-control'
                />
              </div>

              <div>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  City <span className='tw-text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={addressData.shippingAddress.city}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, city: e.target.value },
                    }));
                    clearFieldError('shippingAddress.city');
                  }}
                  className={`form-control ${errors['shippingAddress.city'] ? 'tw-border-red-500' : ''}`}
                />
                {errors['shippingAddress.city'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.city']}</div>
                )}
              </div>

              <div>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  State <span className='tw-text-red-500'>*</span>
                </label>
                <select
                  value={addressData.shippingAddress.state}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, state: e.target.value },
                    }));
                    clearFieldError('shippingAddress.state');
                  }}
                  className={`form-select ${errors['shippingAddress.state'] ? 'tw-border-red-500' : ''}`}
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
                {errors['shippingAddress.state'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.state']}</div>
                )}
              </div>

              <div>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  ZIP Code <span className='tw-text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={addressData.shippingAddress.zip}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, zip: e.target.value },
                    }));
                    clearFieldError('shippingAddress.zip');
                  }}
                  maxLength={5}
                  className={`form-control ${errors['shippingAddress.zip'] ? 'tw-border-red-500' : ''}`}
                />
                {errors['shippingAddress.zip'] && (
                  <div className='tw-mt-1 tw-text-sm tw-text-red-600'>{errors['shippingAddress.zip']}</div>
                )}
              </div>

              <div>
                <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
                  Country/Region <span className='tw-text-red-500'>*</span>
                </label>
                <input type='text' value={addressData.shippingAddress.region} disabled className='form-control' />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
AddressFormComponent.displayName = 'AddressFormComponent';

interface SurveyQuestionResponse {
  position?: number;
  answer: string;
  options?: string[];
  questionId: string;
  questionText: string;
  questionType: string;
  isHighlighted?: boolean;
  validation?: string;
  multiInputs?: MultiInput[] | null;
}

interface Props {
  questions: SurveyQuestionResponse[];
  onSubmit: (answers: PatientSurveyAnswerType[]) => Promise<void> | void;
  initialAnswers?: PatientSurveyAnswerType[];
  isLoading?: boolean;
  isEdit?: boolean;
  surveyId?: string;
  productId?: string;
  patientId?: string;
  surveyType?: string; // Survey type enum (e.g., 'PRODUCT_REFILL')
}

export const UniversalSurveyForm = ({
  questions,
  onSubmit,
  initialAnswers = [],
  isLoading = false,
  isEdit = false,
  surveyId,
  productId,
  patientId,
  surveyType,
}: Readonly<Props>) => {
  const formikRef = useRef<FormikProps<PatientIntakeFormValues>>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [emailAgreement, setEmailAgreement] = useState<boolean>(true);
  const [phoneAgreement, setPhoneAgreement] = useState<boolean>(true);

  // Maintain answers state internally to persist values across steps
  const [answers, setAnswers] = useState<PatientSurveyAnswerType[]>(initialAnswers);

  // Loading state for fetching question info
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);

  // Address validation errors
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Hook to fetch question by ID
  const [getQuestionById] = useLazyGetQuestionByIdQuery();

  // Address state type
  type AddressData = {
    billingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
    shippingAddress: {
      firstName: string;
      lastName: string;
      street: string;
      street2: string;
      city: string;
      region: string;
      state: string;
      zip: string;
    };
    sameAsBilling: boolean;
  };

  // Address state for address questions
  const [addressData, setAddressData] = useState<AddressData>({
    billingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      street2: '',
      city: '',
      region: 'United States',
      state: '',
      zip: '',
    },
    shippingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      street2: '',
      city: '',
      region: 'United States',
      state: '',
      zip: '',
    },
    sameAsBilling: false,
  });

  // Store the original address JSON to restore when switching back to "Yes"
  const [savedAddressJson, setSavedAddressJson] = useState<string | null>(null);

  // Update answers when initialAnswers prop changes (e.g., when modal reopens)
  useEffect(() => {
    if (initialAnswers.length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  // Map question type string to QuestionType enum
  const mapQuestionType = (questionType: string): QuestionType => {
    const typeMap: Record<string, QuestionType> = {
      multiple_choice: QuestionType.MULTIPLE_CHOICE,
      file_upload: QuestionType.FILE_UPLOAD,
      text: QuestionType.INPUT_BOX,
      radio: QuestionType.CHECKBOXES,
      single_choice: QuestionType.DROPDOWN,
      checkbox: QuestionType.MULTIPLE_CHOICE,
      multi_inbox: QuestionType.MULTI_INBOX,
    };
    return typeMap[questionType] || QuestionType.INPUT_BOX;
  };

  // Map validation type - checks both the validation field and question text for date of birth
  const mapValidation = (
    questionType: string,
    questionText?: string,
    validationField?: string
  ): PatientSurveyValidationType | undefined => {
    // First check if validation field is explicitly set
    if (validationField) {
      if (validationField === 'email') return 'email';
      if (validationField === 'phone') return 'phone';
      if (validationField === 'number') return 'number';
      if (validationField === 'date') return 'date';
      if (validationField === 'tags') return 'tags';
    }

    // Check question text for date of birth or injection date
    const textKey = (questionText || '').toLowerCase();
    if (
      textKey.includes('birth') ||
      textKey.includes('dob') ||
      textKey.split(' ').join('').toLowerCase() == 'whatwasthedateofyourlastinjection?'
    ) {
      return 'date';
    }

    // Fallback to checking questionType (for backward compatibility)
    if (questionType === 'email') return 'email';
    if (questionType === 'phone') return 'phone';
    if (questionType === 'number') return 'number';
    if (questionType === 'date') return 'date';
    if (questionType === 'tags') return 'tags';

    return undefined;
  };

  // Sort questions by position (use index + 1 if position is not provided)
  const sortedQuestions = useMemo(() => {
    // First, assign positions to questions that don't have one (use their index + 1)
    const questionsWithPositions = questions.map((q, index) => ({
      ...q,
      position: q.position ?? index + 1, // Use index + 1 if position is not provided
    }));

    // Sort by position
    const sorted = questionsWithPositions.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    // Map to SurveyQuestion format
    return sorted.map((q) => ({
      id: q.questionId,
      questionText: q.questionText,
      questionType: mapQuestionType(q.questionType),
      options: q.options || [],
      isRequired: false, // Default to not required, can be adjusted based on your needs
      position: q.position ?? 1, // Should always have a position at this point
      validation: mapValidation(q.questionType, q.questionText, q.validation),
      isHighlighted: q.isHighlighted,
      multiInputs: q.multiInputs || null, // Include multiInputs for MULTI_INBOX questions
    })) as SurveyQuestion[];
  }, [questions]);

  const currentQuestion = sortedQuestions[currentStep];
  const isLastStep = currentStep === sortedQuestions.length - 1;
  const totalSteps = sortedQuestions.length;

  // Get current answer from internal answers state
  const currentAnswer = useMemo(() => {
    return answers.find((a) => a?.questionId === currentQuestion?.id);
  }, [currentQuestion?.id, answers]);

  // Helper function to parse date string in various formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;

    try {
      // Handle MM/DD/YYYY format (e.g., "11/01/2025")
      const mmddyyyyMatch = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyyMatch) {
        const month = parseInt(mmddyyyyMatch[1], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(mmddyyyyMatch[2], 10);
        const year = parseInt(mmddyyyyMatch[3], 10);
        const date = new Date(year, month, day);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }

      // Handle YYYY-MM-DD format (e.g., "2025-11-01")
      const yyyymmddMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (yyyymmddMatch) {
        const year = parseInt(yyyymmddMatch[1], 10);
        const month = parseInt(yyyymmddMatch[2], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(yyyymmddMatch[3], 10);
        const date = new Date(year, month, day);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }

      // Fallback to native Date parsing
      const date = new Date(dateStr);
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Check if current question is height
  const isHeight = useMemo(() => {
    const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
    return textKey.includes('height');
  }, [currentQuestion?.questionText]);

  // Check if current question is an address question
  const isAddressQuestion = useMemo(() => {
    const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
    return (
      textKey.includes('update your new address') ||
      textKey.includes('update your address') ||
      textKey.includes('new address')
    );
  }, [currentQuestion?.questionText]);

  // Check if current question is Multi Inbox
  const isMultiInbox = useMemo(() => {
    return currentQuestion?.questionType === QuestionType.MULTI_INBOX;
  }, [currentQuestion?.questionType]);

  // Clear address errors when question changes
  useEffect(() => {
    setAddressErrors({});
  }, [currentQuestion?.id]);

  // Parse and populate address data when address question answer changes
  useEffect(() => {
    if (isAddressQuestion && currentAnswer?.answer) {
      const answerStr = currentAnswer.answer as string;
      // If it's "No", don't set address data and clear errors
      if (answerStr.toLowerCase().trim() === 'no') {
        setAddressErrors({});
        return;
      }
      // If it's a JSON string, parse it and set address data
      try {
        const parsedAddress = JSON.parse(answerStr);
        if (parsedAddress.billingAddress && parsedAddress.shippingAddress) {
          // Save this JSON for potential restoration later
          setSavedAddressJson(answerStr);

          // Check if shipping address is same as billing
          const isSameAsBilling =
            JSON.stringify(parsedAddress.billingAddress) === JSON.stringify(parsedAddress.shippingAddress);

          // Set address data with parsed values
          setAddressData({
            billingAddress: {
              firstName: parsedAddress.billingAddress.firstName || '',
              lastName: parsedAddress.billingAddress.lastName || '',
              street: parsedAddress.billingAddress.street || '',
              street2: parsedAddress.billingAddress.street2 || '',
              city: parsedAddress.billingAddress.city || '',
              region: parsedAddress.billingAddress.region || 'United States',
              state: parsedAddress.billingAddress.state || '',
              zip: parsedAddress.billingAddress.zip || '',
            },
            shippingAddress: {
              firstName: parsedAddress.shippingAddress.firstName || '',
              lastName: parsedAddress.shippingAddress.lastName || '',
              street: parsedAddress.shippingAddress.street || '',
              street2: parsedAddress.shippingAddress.street2 || '',
              city: parsedAddress.shippingAddress.city || '',
              region: parsedAddress.shippingAddress.region || 'United States',
              state: parsedAddress.shippingAddress.state || '',
              zip: parsedAddress.shippingAddress.zip || '',
            },
            sameAsBilling: isSameAsBilling,
          });
        }
      } catch (error) {
        // If parsing fails, don't set address data
        console.log('Error parsing address JSON:', error);
      }
    }
  }, [isAddressQuestion, currentAnswer?.answer]);

  // Initial values for current question
  const initialValues: PatientIntakeFormValues = useMemo(() => {
    const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
    const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');
    const isInjectionDate = textKey.split(' ').join('').toLowerCase() == 'whatwasthedateofyourlastinjection?';

    // For height questions, preserve the answer format (feet-inches,weight)
    if (isHeight && currentAnswer?.answer) {
      return {
        answer: currentAnswer.answer as string,
        otherText: currentAnswer.otherText ?? '',
      };
    }

    // Handle address questions - check if answer is "No" or JSON string
    if (isAddressQuestion && currentAnswer?.answer) {
      const answerStr = currentAnswer.answer as string;
      // If it's "No", return "No"
      if (answerStr.toLowerCase().trim() === 'no') {
        return {
          answer: 'No',
          otherText: '',
        };
      }
      // If it's a JSON string, return "Yes" (address data will be set in useEffect)
      try {
        const parsedAddress = JSON.parse(answerStr);
        if (parsedAddress.billingAddress && parsedAddress.shippingAddress) {
          return {
            answer: 'Yes',
            otherText: '',
          };
        }
      } catch (error) {
        if (error instanceof Error) toast.error(error.message ?? 'Error parsing address JSON');

        return {
          answer: 'No',
          otherText: '',
        };
      }
    }

    // Handle date fields (date of birth, injection date, or any field with validation === 'date')
    if ((isDateOfBirth || isInjectionDate || currentQuestion?.validation === 'date') && currentAnswer?.answer) {
      const dateStr = currentAnswer.answer as string;
      const date = parseDateString(dateStr);
      return {
        answer: date || currentAnswer.answer,
        otherText: currentAnswer.otherText ?? '',
      };
    }

    if (currentQuestion?.validation === 'email') {
      return {
        answer: (currentAnswer?.answer as string) || '',
        otherText: '',
      };
    }

    // Handle Multi Inbox questions - parse JSON answer into multiInboxAnswers
    if (isMultiInbox && currentAnswer?.answer) {
      try {
        const parsedAnswers = JSON.parse(currentAnswer.answer as string);
        return {
          answer: '',
          otherText: '',
          multiInboxAnswers: parsedAnswers,
        };
      } catch {
        // If parsing fails, initialize empty multiInboxAnswers
        const emptyAnswers: Record<string, string> = {};
        currentQuestion?.multiInputs?.forEach((input) => {
          if (input.fieldName) {
            emptyAnswers[input.fieldName] = '';
          }
        });
        return {
          answer: '',
          otherText: '',
          multiInboxAnswers: emptyAnswers,
        };
      }
    }

    return {
      answer: currentAnswer?.answer ?? (currentQuestion?.questionType === QuestionType.MULTIPLE_CHOICE ? [] : ''),
      otherText: currentAnswer?.otherText ?? '',
    };
  }, [currentQuestion, currentAnswer, isHeight, isAddressQuestion, isMultiInbox]);

  const handleNext = async (
    values: PatientIntakeFormValues,
    { setTouched, setFieldError, setErrors }: FormikHelpers<PatientIntakeFormValues>
  ) => {
    setTouched({});

    // Fetch question info via API before proceeding
    let fetchedQuestion: SurveyQuestion | null = null;
    if (currentQuestion?.id) {
      setIsFetchingQuestion(true);
      try {
        const questionData = await getQuestionById({
          questionId: currentQuestion.id,
          type: surveyType,
          patientId: patientId,
        }).unwrap();
        fetchedQuestion = questionData;
      } catch (error) {
        setIsFetchingQuestion(false);

        const errorStatus = (error as ApiError)?.status;

        if (errorStatus !== 404) {
          const errorMessage = 'Failed to fetch question information. Please try again.';

          // Show toast notification
          toast.error(errorMessage);
          setFieldError('answer', errorMessage);

          return;
        }
      } finally {
        setIsFetchingQuestion(false);
      }
    }

    // Use fetched question for validation if available, otherwise use currentQuestion
    const questionToValidate = fetchedQuestion || currentQuestion;

    // Validate the answer using the fetched question data
    if (questionToValidate) {
      try {
        const schema = validationSchema(questionToValidate, currentAnswer);
        await schema.validate(values, { abortEarly: false });
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const validationErrors: Record<string, string> = {};
          let answerError = '';

          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[err.path] = err.message;
              // Get the answer error message
              if (err.path === 'answer') {
                answerError = err.message;
              }
            }
          });

          // Show toast notification with the error message
          if (answerError) {
            toast.error(answerError);
          } else if (error.inner.length > 0) {
            // If no answer error but other errors exist, show the first error
            toast.error(error.inner[0].message);
          }

          setErrors(validationErrors);
          return;
        }
      }
    }

    // Handle date fields - convert Date to YYYY-MM-DD string format
    const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
    const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');
    const isInjectionDate = textKey.split(' ').join('').toLowerCase() == 'whatwasthedateofyourlastinjection?';
    const isDateField = isDateOfBirth || isInjectionDate || currentQuestion?.validation === 'date';

    let processedAnswer: PatientSurveyAnswerType['answer'];

    // For height questions, preserve the string format (feet-inches,weight)
    if (isHeight && values.answer) {
      processedAnswer = values.answer as string;
    } else if (isMultiInbox && values.multiInboxAnswers) {
      // Handle Multi Inbox - stringify the multiInboxAnswers object
      processedAnswer = JSON.stringify(values.multiInboxAnswers);
    } else if (isAddressQuestion && values.answer) {
      // Handle address question - if "Yes", stringify address, if "No", send "No"
      const selectedValue = (values.answer as string) || '';
      if (selectedValue.toLowerCase().includes('yes')) {
        // Validate address fields before proceeding
        const addressValidationErrors: Record<string, string> = {};

        // Validate billing address
        if (!addressData.billingAddress.firstName.trim()) {
          addressValidationErrors['billingAddress.firstName'] = 'First name is required';
        }
        if (!addressData.billingAddress.lastName.trim()) {
          addressValidationErrors['billingAddress.lastName'] = 'Last name is required';
        }
        if (!addressData.billingAddress.street.trim()) {
          addressValidationErrors['billingAddress.street'] = 'Street is required';
        }
        if (!addressData.billingAddress.city.trim()) {
          addressValidationErrors['billingAddress.city'] = 'City is required';
        }
        if (!addressData.billingAddress.state.trim()) {
          addressValidationErrors['billingAddress.state'] = 'State is required';
        }
        if (!addressData.billingAddress.zip.trim()) {
          addressValidationErrors['billingAddress.zip'] = 'ZIP code is required';
        } else if (!/^\d{5}$/.test(addressData.billingAddress.zip.trim())) {
          addressValidationErrors['billingAddress.zip'] = 'ZIP code must be 5 digits';
        }
        if (!addressData.billingAddress.region.trim()) {
          addressValidationErrors['billingAddress.region'] = 'Country/Region is required';
        }

        // Validate shipping address only if sameAsBilling is false
        if (!addressData.sameAsBilling) {
          if (!addressData.shippingAddress.firstName.trim()) {
            addressValidationErrors['shippingAddress.firstName'] = 'First name is required';
          }
          if (!addressData.shippingAddress.lastName.trim()) {
            addressValidationErrors['shippingAddress.lastName'] = 'Last name is required';
          }
          if (!addressData.shippingAddress.street.trim()) {
            addressValidationErrors['shippingAddress.street'] = 'Street is required';
          }
          if (!addressData.shippingAddress.city.trim()) {
            addressValidationErrors['shippingAddress.city'] = 'City is required';
          }
          if (!addressData.shippingAddress.state.trim()) {
            addressValidationErrors['shippingAddress.state'] = 'State is required';
          }
          if (!addressData.shippingAddress.zip.trim()) {
            addressValidationErrors['shippingAddress.zip'] = 'ZIP code is required';
          } else if (!/^\d{5}$/.test(addressData.shippingAddress.zip.trim())) {
            addressValidationErrors['shippingAddress.zip'] = 'ZIP code must be 5 digits';
          }
          if (!addressData.shippingAddress.region.trim()) {
            addressValidationErrors['shippingAddress.region'] = 'Country/Region is required';
          }
        }

        // If there are validation errors, set them and return
        if (Object.keys(addressValidationErrors).length > 0) {
          setAddressErrors(addressValidationErrors);
          // Show first error as toast
          const firstError = Object.values(addressValidationErrors)[0];
          toast.error(firstError);
          return;
        }

        // Clear errors if validation passes
        setAddressErrors({});

        // Stringify the address object
        processedAnswer = JSON.stringify({
          billingAddress: addressData.billingAddress,
          shippingAddress: addressData.sameAsBilling ? addressData.billingAddress : addressData.shippingAddress,
        });
      } else {
        // Clear errors when "No" is selected
        setAddressErrors({});
        processedAnswer = 'No';
      }
    } else if (isDateField && values.answer) {
      let date: Date | null = null;

      if (values.answer instanceof Date) {
        date = values.answer;
      } else if (typeof values.answer === 'string') {
        date = parseDateString(values.answer);
      }

      if (date && !Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        processedAnswer = `${year}-${month}-${day}`;
      } else {
        // If parsing failed, preserve the original string value
        processedAnswer = typeof values.answer === 'string' ? values.answer : '';
      }
    } else {
      // For non-date fields, ensure we convert Date to string if present
      if (values.answer instanceof Date) {
        processedAnswer = values.answer.toISOString();
      } else if (values.answer !== null && values.answer !== undefined) {
        processedAnswer = values.answer as string | string[] | File;
      } else {
        processedAnswer = undefined;
      }
    }

    // Update or add answer
    const updatedAnswers = [
      ...answers.filter((a) => a.questionId !== currentQuestion?.id),
      {
        questionId: currentQuestion?.id || '',
        answer: processedAnswer,
        ...(values.otherText && { otherText: values.otherText }),
      },
    ];

    // Update internal answers state to persist values
    setAnswers(updatedAnswers);

    if (isLastStep) {
      // Upload files before submitting if we have the required IDs
      let finalAnswers = updatedAnswers;

      // Check if we have files to upload and required IDs
      const hasFiles = updatedAnswers.some((answer) => answer.answer instanceof File);

      if (hasFiles && surveyId && patientId && productId) {
        try {
          // Process all answers and upload files if needed
          finalAnswers = await Promise.all(
            updatedAnswers.map(async (answer) => {
              // Check if answer is a File object
              if (answer.answer instanceof File) {
                try {
                  // Upload file to S3
                  const fileUrl = await uploadSurveyFile({
                    surveyId,
                    productId,
                    patientId,
                    file: answer.answer,
                  });

                  // Replace File object with URL
                  return {
                    ...answer,
                    answer: fileUrl,
                  };
                } catch (error) {
                  toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  // Return original answer if upload fails
                  throw error;
                }
              }
              return answer;
            })
          );
        } catch (error) {
          if (error instanceof Error) toast.error(error.message ?? 'Failed to upload files. Please try again.');
          return; // Halt submission
        }
      } else if (hasFiles && (!surveyId || !patientId || !productId)) {
        // Warn if files exist but required IDs are missing
        toast.error('Cannot upload files: Missing required information (surveyId, patientId, or productId)');
      }

      // Call onSubmit with all answers (files should now be URLs if uploaded)
      await onSubmit(finalAnswers);
    } else {
      // Move to next step
      setIsNavigatingBack(false);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setIsNavigatingBack(true);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // File upload handling
  const images = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
  };
  const fileTypes = { ...images, 'application/pdf': ['.pdf'] };

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  return (
    <div className='tw-w-full'>
      {/* Progress Bar */}
      <div className='tw-mb-8'>
        <div className='tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2'>
          <div
            className='tw-bg-primary tw-h-2 tw-rounded-full tw-transition-all tw-duration-300'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className='tw-text-sm tw-text-gray-600 tw-mt-2'>
          Question {currentStep + 1} of {totalSteps}
        </div>
      </div>

      <Formik
        key={currentQuestion.id}
        innerRef={formikRef}
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleNext}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          // Check if "Yes" is selected for address question
          const isYesSelected = isAddressQuestion && (values.answer as string)?.toLowerCase() === 'yes';

          // Combine isSubmitting and isFetchingQuestion for button state
          const isButtonDisabled = isSubmitting || isLoading || isFetchingQuestion;
          const showSpinner = isSubmitting || isLoading || isFetchingQuestion;

          return (
            <Form>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {/* Question Text */}
                  <div className='tw-my-6 md:tw-mt-10 md:tw-mb-8'>
                    <p className='md:tw-text-[22px] md:tw-leading-[27px] tw-font-medium tw-font-secondary'>
                      {currentQuestion.questionText}
                      {currentQuestion.isRequired && <span className='tw-text-red-500 tw-ml-1'>*</span>}
                    </p>
                    {currentQuestion.description && (
                      <span className='tw-text-sm tw-text-gray-600'>{currentQuestion.description}</span>
                    )}
                  </div>

                  {/* Question Fields */}
                  {currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE && (
                    <MultipleChoice question={currentQuestion} />
                  )}

                  {[QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(
                    currentQuestion.questionType as QuestionType
                  ) && (
                    <SingleChoice
                      question={currentQuestion}
                      isNavigatingBack={isNavigatingBack}
                      isLastQuestion={isLastStep}
                    />
                  )}

                  {/* Address Question - Yes/No with conditional address form */}
                  {isAddressQuestion ? (
                    <div className='tw-space-y-6 tw-animate-fade-in'>
                      {/* Custom Radio Buttons for Yes/No */}
                      <div>
                        <div className='tw-space-y-3'>
                          {['Yes', 'No'].map((option: string) => {
                            const isSelected = (values.answer as string) === option;
                            const optionId = `${currentQuestion.id}_${option.toLowerCase().replaceAll(/\s+/g, '_')}`;

                            return (
                              <label
                                key={option}
                                htmlFor={optionId}
                                onClick={() => {
                                  setFieldValue('answer', option);
                                  if (option === 'No') {
                                    // Reset address data when "No" is selected (keep savedAddressJson for restoration)
                                    setAddressData({
                                      billingAddress: {
                                        firstName: '',
                                        lastName: '',
                                        street: '',
                                        street2: '',
                                        city: '',
                                        region: 'United States',
                                        state: '',
                                        zip: '',
                                      },
                                      shippingAddress: {
                                        firstName: '',
                                        lastName: '',
                                        street: '',
                                        street2: '',
                                        city: '',
                                        region: 'United States',
                                        state: '',
                                        zip: '',
                                      },
                                      sameAsBilling: false,
                                    });
                                  } else if (option === 'Yes' && savedAddressJson) {
                                    // Only restore if address data is currently empty (switching from "No" to "Yes")
                                    const isAddressEmpty =
                                      !addressData.billingAddress.firstName &&
                                      !addressData.billingAddress.lastName &&
                                      !addressData.billingAddress.street;

                                    if (isAddressEmpty) {
                                      // Restore saved address data when switching back to "Yes"
                                      try {
                                        const parsedAddress = JSON.parse(savedAddressJson);
                                        if (parsedAddress.billingAddress && parsedAddress.shippingAddress) {
                                          const isSameAsBilling =
                                            JSON.stringify(parsedAddress.billingAddress) ===
                                            JSON.stringify(parsedAddress.shippingAddress);
                                          setAddressData({
                                            billingAddress: {
                                              firstName: parsedAddress.billingAddress.firstName || '',
                                              lastName: parsedAddress.billingAddress.lastName || '',
                                              street: parsedAddress.billingAddress.street || '',
                                              street2: parsedAddress.billingAddress.street2 || '',
                                              city: parsedAddress.billingAddress.city || '',
                                              region: parsedAddress.billingAddress.region || 'United States',
                                              state: parsedAddress.billingAddress.state || '',
                                              zip: parsedAddress.billingAddress.zip || '',
                                            },
                                            shippingAddress: {
                                              firstName: parsedAddress.shippingAddress.firstName || '',
                                              lastName: parsedAddress.shippingAddress.lastName || '',
                                              street: parsedAddress.shippingAddress.street || '',
                                              street2: parsedAddress.shippingAddress.street2 || '',
                                              city: parsedAddress.shippingAddress.city || '',
                                              region: parsedAddress.shippingAddress.region || 'United States',
                                              state: parsedAddress.shippingAddress.state || '',
                                              zip: parsedAddress.shippingAddress.zip || '',
                                            },
                                            sameAsBilling: isSameAsBilling,
                                          });
                                        }
                                      } catch (error) {
                                        console.log('Error restoring address data:', error);
                                      }
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setFieldValue('answer', option);
                                  }
                                }}
                                className={
                                  'tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4' +
                                  (isSelected ? ' tw-border-primary tw-text-white tw-bg-primary' : ' tw-bg-white')
                                }
                              >
                                <Field type='radio' hidden id={optionId} name='answer' value={option} />

                                {isSelected ? (
                                  <FaRegCheckCircle
                                    className='flex-shrink-0'
                                    color={isSelected ? 'white' : undefined}
                                  />
                                ) : (
                                  <FaRegCircle className='flex-shrink-0' />
                                )}
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Show Address Form when "Yes" is selected */}
                      {isYesSelected && (
                        <div className='tw-mt-6' key='address-form'>
                          <AddressFormComponent
                            addressData={addressData}
                            setAddressData={setAddressData}
                            errors={addressErrors}
                            clearFieldError={(fieldName) => {
                              setAddressErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[fieldName];
                                return newErrors;
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : currentQuestion.questionType === QuestionType.INPUT_BOX && isHeight ? (
                    <HeightQuestion currentAnswer={currentAnswer} />
                  ) : currentQuestion.questionType === QuestionType.INPUT_BOX ? (
                    <InputQuestionBox
                      disableEmail={isEdit}
                      question={currentQuestion}
                      showCalendlyStep={false}
                      position={currentStep + 1}
                      emailAgreement={emailAgreement}
                      setEmailAgreement={setEmailAgreement}
                      phoneAgreement={phoneAgreement}
                      setPhoneAgreement={setPhoneAgreement}
                    />
                  ) : currentQuestion.questionType === QuestionType.MULTI_INBOX ? (
                    <SurveyMultiInbox question={currentQuestion} answers={answers} setAnswers={setAnswers} />
                  ) : null}

                  {currentQuestion.questionType === QuestionType.FILE_UPLOAD && (
                    <Field name='answer'>
                      {({ field, form }: FieldProps) => {
                        const answer = field.value;
                        const isString = typeof answer === 'string';

                        const onDrop = async (files: File[]) => {
                          form.setFieldValue('answer', files[0]);
                        };

                        function handleRemove() {
                          form.setFieldValue('answer', undefined);
                        }

                        const allowedExtensions = Object.values(fileTypes).flat().join(', ');
                        return (
                          <>
                            <Dropzone disabled={isEdit} onDrop={onDrop} accept={fileTypes}>
                              {({ getRootProps, getInputProps, isDragActive }) => (
                                <div
                                  {...getRootProps()}
                                  className={
                                    'tw-p-12 tw-rounded-lg file-dropzone tw-bg-white tw-flex tw-flex-col tw-items-center tw-gap-y-3' +
                                    (isDragActive ? 'drag-active' : ' tw-opacity-50 tw-pointer-events-none ')
                                  }
                                >
                                  <input {...getInputProps()} />
                                  <IoCloudUploadOutline size={24} />
                                  <span>Click or drag file to this area to upload</span>
                                  <p className='tw-text-sm tw-text-gray-500'>Allowed file types: {allowedExtensions}</p>
                                </div>
                              )}
                            </Dropzone>

                            {answer instanceof File ||
                            (answer && typeof answer === 'object' && 'name' in answer) ||
                            (isString && extractFileName(answer)) ? (
                              <div
                                className={`rounded-2 file-name-container tw-flex tw-justify-between tw-items-center tw-bg-white mt-4 ${
                                  isEdit ? 'tw-opacity-50 tw-pointer-events-none' : ''
                                }`}
                              >
                                <div className='tw-inline-flex tw-items-center tw-gap-x-2'>
                                  <IoImageOutline size={24} />
                                  <span>{isString ? extractFileName(answer) : (answer as File).name}</span>
                                </div>
                                <RiCloseLargeLine className={`cursor-pointer`} onClick={handleRemove} />
                              </div>
                            ) : null}
                          </>
                        );
                      }}
                    </Field>
                  )}

                  <ErrorMessage name='otherText' component='div' className='tw-text-red-500 tw-text-sm tw-mt-2' />

                  {/* Navigation Buttons */}
                  <div className='tw-mt-8 tw-flex tw-gap-3 tw-justify-center'>
                    {currentStep > 0 && (
                      <button
                        type='button'
                        onClick={handlePrevious}
                        disabled={isButtonDisabled || showSpinner}
                        className=' !tw-text-primary hover:!tw-bg-primary hover:!tw-text-white !tw-border tw-border-primary !tw-rounded-full md:!tw-text-lg !tw-py-2 !tw-px-6 bouncing-effect md:!tw-py-3 !tw-flex tw-items-center gap-3 tw-font-semibold tw-justify-center disabled:!tw-opacity-50 disabled:!tw-pointer-events-none'
                      >
                        Previous
                      </button>
                    )}

                    <button
                      type='submit'
                      disabled={isButtonDisabled || showSpinner}
                      className='!tw-bg-primary !tw-text-white !tw-rounded-full md:!tw-text-lg !tw-py-2 !tw-px-6 bouncing-effect md:!tw-py-3 !tw-flex tw-items-center gap-3 tw-font-semibold tw-justify-center disabled:!tw-opacity-50 disabled:!tw-pointer-events-none tw-shadow-subtle'
                    >
                      <span>{isLastStep ? (isEdit ? 'Update' : 'Submit') : 'Next'}</span>
                      {showSpinner ? <Spinner size='sm' className='border-2' /> : <FaArrowRight />}
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
