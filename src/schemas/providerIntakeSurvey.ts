import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import * as Yup from 'yup';

export const providerIntakeSurveySchema = (currentQuestion?: SurveyQuestion) => {
  if (!currentQuestion) return Yup.object({});

  let schema: Yup.AnySchema;
  const fieldName = currentQuestion.id || 'field';
  const isLicenseQuestion = currentQuestion.questionText?.toLowerCase().includes('licen');
  const isProviderGroupQuestion = currentQuestion.questionText?.toLowerCase().includes('provider group');

  switch (currentQuestion.questionType) {
    case QuestionType.MULTIPLE_CHOICE: {
      let s = Yup.array().of(Yup.string().trim());
      if (currentQuestion.isRequired) {
        s = s.min(1, 'Please select at least one option');
      }
      if (isProviderGroupQuestion) {
        s = s.test(
          'other-requires-custom-group',
          'Please add at least one custom group when "Other" is selected',
          function (value) {
            if (!value || !Array.isArray(value)) return true;

            const standardOptions = currentQuestion.options || [];
            const hasOther = value.includes('Other');

            if (!hasOther) return true;

            const customGroups = value.filter(
              (group): group is string =>
                typeof group === 'string' && !standardOptions.includes(group) && group !== 'Other'
            );

            return customGroups.length > 0;
          }
        );
      }
      schema = s;
      break;
    }

    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES: {
      if (isProviderGroupQuestion) {
        // For single-selection provider group questions, value is a string
        let s = Yup.string().trim();
        if (currentQuestion.isRequired) {
          s = s.required('Please select a provider group');
        }
        s = s.test(
          'other-requires-custom-group',
          'Please enter a custom group name when "Other" is selected',
          function (value) {
            // If value is empty and question is not required, it's valid
            if (!value) {
              return !currentQuestion.isRequired;
            }

            const standardOptions = currentQuestion.options || [];

            // If value is "Other", it's invalid (user must add a custom group)
            if (value === 'Other') {
              return false;
            }

            // If value is a standard option, it's valid
            if (standardOptions.includes(value)) {
              return true;
            }

            // If value is a custom group (not in standard options and not "Other"), it's valid
            // But ensure it's not empty or just whitespace
            return value.trim().length > 0;
          }
        );
        schema = s;
        break;
      }

      let s = Yup.string().trim();
      if (currentQuestion.isRequired) {
        s = s.required('Please select an option');
      }
      schema = s;
      break;
    }

    case QuestionType.FILE_UPLOAD: {
      let s = Yup.mixed();
      if (currentQuestion.isRequired) {
        s = s.test('required', 'This question is required', (value) => {
          return value != null && value !== '';
        });
      }
      schema = s;
      break;
    }

    case QuestionType.INPUT_BOX:
    default: {
      if (isLicenseQuestion) {
        // Base license validation schema
        let licenseSchema = Yup.array().of(
          Yup.object().shape({
            state: Yup.string().required('State is required'),
            expiryDate: Yup.date().nullable().optional(),
            licenseNumber: Yup.string()
              .required('License number is required'),
          })
        );

        // If the question is required, enforce at least one license
        if (currentQuestion.isRequired) {
          licenseSchema = licenseSchema
            .min(1, 'At least one license is required')
            .required('At least one license is required');
        } else {
          // If not required, allow empty array but validate entries if user starts adding them
          licenseSchema = licenseSchema.test(
            'conditional-license-validation',
            'Please complete the license information or remove it',
            function (value) {
              // If array is empty, it's valid (not required)
              if (!value || value.length === 0) {
                return true;
              }
              // If user has started entering data, validate all entries
              return true; // The nested schema will handle validation of individual entries
            }
          );
        }

        schema = licenseSchema;
      } else {
        const text = (currentQuestion.questionText || '').toLowerCase();
        const isExperienceQuestion = text.includes('what areas of care have you worked in');

        // Start with base string schema
        let s: Yup.StringSchema = Yup.string().trim();

        // Apply specific validations based on field type
        if (text.includes('email')) {
          s = s.email('Enter a valid email');
        } else if (currentQuestion.validation === 'phone') {
          s = Yup.string()
            .transform((value) => value.replace(/\D/g, ''))
            .matches(/^\d{10}$/, 'Enter valid phone number');
        } else if (currentQuestion.validation === 'number' && !isExperienceQuestion) {
          // For numbers, use number schema instead
          let numSchema = Yup.string()
            .typeError('Must be a number')
            .transform((value, originalValue) => (originalValue === '' ? undefined : value));

          if (currentQuestion.validationRules?.min !== undefined) {
            numSchema = numSchema.min(
              currentQuestion.validationRules.min,
              `Must be at least ${currentQuestion.validationRules.min} characters`
            );
          }
          if (currentQuestion.validationRules?.max !== undefined) {
            numSchema = numSchema.max(
              currentQuestion.validationRules.max,
              `Must be at most ${currentQuestion.validationRules.max} characters`
            );
          }

          if (currentQuestion.isRequired) {
            numSchema = numSchema.required('This question is required');
          }

          schema = numSchema;
          break; // Break here since we've handled number case
        }

        if (isExperienceQuestion) {
          s = s.max(500, 'Experience description must be at most 500 characters');
        }

        // Apply required validation for string fields
        if (currentQuestion.isRequired) {
          s = s.required('This question is required');
        }

        schema = s;
      }
      break;
    }
  }

  return Yup.object({ [fieldName]: schema });
};
