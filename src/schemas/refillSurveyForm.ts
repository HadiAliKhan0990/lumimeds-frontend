import { QuestionType } from '@/lib/enums';
import { generalPhoneSchema } from '@/lib/schema/pharmacyPatient';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import * as Yup from 'yup';

export const getCurrentStepValidation = (question: SurveyQuestion | null) => {
  if (!question?.id) return Yup.object();

  // Check if this question is an address question
  const isQuestionAddressType =
    question?.questionText?.toLowerCase().includes('update your new address') ||
    question?.questionText?.toLowerCase().includes('update your address') ||
    question?.questionText?.toLowerCase().includes('new address');

  const isWeightQuestion = question?.questionText?.toLowerCase().includes('weight');
  const isLastInjectionDateQuestion =
    question?.questionText?.toLowerCase().includes('last injection') && question?.validation === 'date';

  // If it's an address question (any type), validate with Yes/No and conditional address fields
  if (isQuestionAddressType) {
    // Always require selection for address type questions
    const questionFieldSchema = Yup.string().required('Please select an option');

    return Yup.object().shape({
      [question.id]: questionFieldSchema,
      address: Yup.object().when(question.id ?? '', {
        is: (val: string) => val?.toLowerCase().includes('yes'),
        then: (schema) =>
          schema.shape({
            billingAddress: Yup.object().shape({
              firstName: Yup.string().trim().required('First name is required'),
              lastName: Yup.string().trim().required('Last name is required'),
              street: Yup.string().trim().required('Street is required'),
              street2: Yup.string().trim(),
              city: Yup.string().trim().required('City is required'),
              state: Yup.string().trim().required('State is required'),
              zip: Yup.string()
                .trim()
                .matches(/^\d{5}$/, 'ZIP code must be 5 digits')
                .required('ZIP code is required'),
              region: Yup.string().trim().required('Country/Region is required'),
            }),
            shippingAddress: Yup.object().when('sameAsBilling', {
              is: false,
              then: (schema) =>
                schema.shape({
                  firstName: Yup.string().trim().required('First name is required'),
                  lastName: Yup.string().trim().required('Last name is required'),
                  street: Yup.string().trim().required('Street is required'),
                  street2: Yup.string().trim(),
                  city: Yup.string().trim().required('City is required'),
                  state: Yup.string().trim().required('State is required'),
                  zip: Yup.string()
                    .trim()
                    .matches(/^\d{5}$/, 'ZIP code must be 5 digits')
                    .required('ZIP code is required'),
                  region: Yup.string().trim().required('Country/Region is required'),
                }),
              otherwise: (schema) =>
                schema.shape({
                  firstName: Yup.string().trim(),
                  lastName: Yup.string().trim(),
                  street: Yup.string().trim(),
                  street2: Yup.string().trim(),
                  city: Yup.string().trim(),
                  state: Yup.string().trim(),
                  zip: Yup.string().trim(),
                  region: Yup.string().trim(),
                }),
            }),
          }),
        otherwise: (schema) => schema,
      }),
    });
  }

  let fieldSchema: Yup.AnySchema;

  switch (question.questionType) {
    case QuestionType.MULTIPLE_CHOICE: {
      if (question.isRequired) {
        fieldSchema = Yup.array().min(1, 'This field is required').required('This field is required');
      } else {
        fieldSchema = Yup.array();
      }
      break;
    }

    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES: {
      if (question.isRequired) {
        fieldSchema = Yup.string().required('This field is required');
      } else {
        fieldSchema = Yup.string();
      }

      // Add validation for "other" text field - always required when "other" is selected
      const otherTextFieldSchema = Yup.string().when(question.id ?? '', {
        is: (val: string) => val?.toLowerCase().includes('other'),
        then: (schema) => schema.trim().required('Please specify your answer'),
        otherwise: (schema) => schema,
      });

      return Yup.object().shape({
        [question.id]: fieldSchema,
        [`${question.id}_other_text`]: otherTextFieldSchema,
      });
    }

    case QuestionType.FILE_UPLOAD: {
      // File upload validation - accepts File object or string URL
      const fileSchema = Yup.mixed<File | string>()
        .test('file-type', 'Only PDF or image files are allowed (PDF, JPEG, PNG, GIF, WebP)', (value) => {
          // If value is a string (URL), validate based on whether it's required
          if (typeof value === 'string') {
            // Empty string is valid if question is not required
            if (value.length === 0) {
              return !question.isRequired;
            }
            // Non-empty string (URL) is valid
            return true;
          }
          // If value is a File, validate it's a PDF or image
          if (value instanceof File) {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            return validTypes.includes(value.type);
          }
          // If value is null/undefined and not required, it's valid
          return value === null || value === undefined;
        })
        .test('file-size', 'File size must be less than 5MB', (value) => {
          // If value is a string (URL), it's already uploaded and valid
          if (typeof value === 'string') {
            return true;
          }
          // If value is a File, validate size
          if (value instanceof File) {
            return value.size <= 5 * 1024 * 1024; // 5MB
          }
          // If value is null/undefined and not required, it's valid
          return value === null || value === undefined;
        });

      if (question.isRequired) {
        fieldSchema = fileSchema.required('Please upload a PDF or image file');
      } else {
        fieldSchema = fileSchema.nullable();
      }
      break;
    }

    case QuestionType.INPUT_BOX:
      if (question.validation === 'date') {
        // Date fields - allow null for non-required fields
        let dateSchema = Yup.date().nullable();

        // For last injection date, prevent future dates
        if (isLastInjectionDateQuestion) {
          dateSchema = dateSchema.max(new Date(), 'Last injection date cannot be in the future');
        }

        if (question.isRequired) {
          fieldSchema = dateSchema.required('Answer is required for this question');
        } else {
          fieldSchema = dateSchema;
        }
      } else if (question.validation === 'email') {
        let emailSchema = Yup.string().trim();
        if (question.isRequired) {
          emailSchema = emailSchema.email('Enter a valid email').required('Email is required');
        } else {
          // For non-required email fields, only validate format if value is provided
          emailSchema = emailSchema.test(
            'email-format',
            'Enter a valid email',
            (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          );
        }
        fieldSchema = emailSchema;
      } else if (question.validation === 'phone') {
        if (question.isRequired) {
          fieldSchema = generalPhoneSchema('Enter valid phone number').required('Phone Number is required');
        } else {
          fieldSchema = generalPhoneSchema('Enter valid phone number');
        }
      } else if (question.validation === 'number') {
        let numSchema = Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? undefined : value))
          .nullable()
          .typeError('Please enter a valid number');

        if (isWeightQuestion) {
          numSchema = numSchema
            .test(
              'positive',
              'Please enter a positive number',
              (value) => value === null || value === undefined || value > 0
            )
            .test(
              'max-weight',
              'Weight must be less than or equal to 999',
              (value) => value === null || value === undefined || value <= 999
            );
        } else {
          numSchema = numSchema.test(
            'positive',
            'Please enter a positive number',
            (value) => value === null || value === undefined || value > 0
          );
        }

        if (question.isRequired) {
          numSchema = numSchema.required('This field is required');
        }
        fieldSchema = numSchema;
      } else if (question.validation === 'tags') {
        if (question.isRequired) {
          fieldSchema = Yup.array().min(1, 'Please add at least one tag').required('This field is required');
        } else {
          fieldSchema = Yup.array();
        }
      } else if (question.isRequired) {
        // Default text input - required
        fieldSchema = Yup.string().trim().required('This field is required');
      } else {
        // Default text input - optional
        fieldSchema = Yup.string().trim();
      }
      break;

    default:
      // Default case for any other question types
      if (question.isRequired) {
        fieldSchema = Yup.string().required('This field is required');
      } else {
        fieldSchema = Yup.string();
      }
  }

  return Yup.object().shape({ [question.id]: fieldSchema });
};
