import * as Yup from 'yup';
import { calculateBMI } from '@/helpers/intakeSurvey';
import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { IntakeFormValues } from '@/types/survey';
import { generalPhoneSchema } from '@/lib/schema/pharmacyPatient';

export const validationSchema = (currentQuestion?: SurveyQuestion, allAnswers?: IntakeFormValues) => {
  if (!currentQuestion || !allAnswers) return Yup.object({});

  const currentAnswer = allAnswers[currentQuestion.id || ''];

  const textKey = currentQuestion?.questionText?.toLowerCase() ?? '';
  const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');
  const isHeight = textKey.includes('height');

  const minDob = new Date();
  minDob.setFullYear(minDob.getFullYear() - 100);
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const fieldName = currentQuestion.id || 'field';

  let schema;

  switch (currentQuestion.questionType) {
    case QuestionType.MULTIPLE_CHOICE:
      schema = Yup.array().of(Yup.string());
      if (currentQuestion.isRequired) {
        schema = schema.min(1, 'Select at least one');
      }
      break;

    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES:
      schema = Yup.string().trim();
      if (currentQuestion.isRequired) {
        schema = schema.required('Select an option');
      }
      break;

    case QuestionType.INPUT_BOX:
      if (isDateOfBirth) {
        schema = Yup.mixed()
          .nullable()
          .test('is-valid-date', 'Please select a valid date', (value) => {
            if (!value || value === '' || value === null) return true; // Allow empty during editing
            const date = value instanceof Date ? value : new Date(value as string);
            return !Number.isNaN(date.getTime());
          })
          .test('date-range', 'Date of birth is not correct!', (value) => {
            if (!value || value === '' || value === null) return true;
            const date = value instanceof Date ? value : new Date(value as string);
            return !Number.isNaN(date.getTime()) && date >= minDob;
          })
          .test('age-requirement', 'You must be at least 18 years old', (value) => {
            if (!value || value === '' || value === null) return true;
            const date = value instanceof Date ? value : new Date(value as string);
            return !Number.isNaN(date.getTime()) && date <= eighteenYearsAgo;
          })
          .test('required-validation', 'Date of birth is required', (value) => {
            const currentValue = value || currentAnswer;
            // Only validate required if the question is marked as required
            if (currentQuestion?.isRequired) {
              return currentValue !== null && currentValue !== undefined && currentValue !== '';
            }
            return true; // If not required, always pass
          });

        break;
      } else if (isHeight) {
        schema = Yup.string()
          .trim()
          .matches(/^\d+-\d+,\d+$/, 'Height and weight are required')
          .test('valid-height-weight', 'Please enter valid height and weight', function (value) {
            if (!value) return !currentQuestion.isRequired;

            const parts = value.split(',');
            if (parts.length !== 2) return this.createError({ message: 'Please enter both height and weight' });

            const [heightPart, weightPart] = parts;
            const heightValues = heightPart.split('-');

            if (heightValues.length !== 2) return this.createError({ message: 'Please select valid height' });

            const feet = parseInt(heightValues[0]);
            const inches = parseInt(heightValues[1]);
            const weight = parseInt(weightPart);

            // Validate feet (1-8)
            if (isNaN(feet) || feet < 1 || feet > 8) {
              return this.createError({ message: 'Feet must be between 1 and 8' });
            }

            // Validate inches (0-11)
            if (isNaN(inches) || inches < 0 || inches > 11) {
              return this.createError({ message: 'Inches must be between 0 and 11' });
            }

            // Validate weight (must be positive number)
            if (isNaN(weight) || weight <= 0) {
              return this.createError({ message: 'Please enter a valid weight' });
            }

            return true;
          })
          .test('bmi-validation', 'Your BMI must be 18 or above to proceed', function (value) {
            if (!value) return !currentQuestion.isRequired;

            const parts = value.split(',');
            if (parts.length !== 2) return true; // Let the previous test handle format errors

            const [heightPart, weightPart] = parts;
            const heightValues = heightPart.split('-');

            if (heightValues.length !== 2) return true; // Let the previous test handle format errors

            const feet = parseInt(heightValues[0]);
            const inches = parseInt(heightValues[1]);
            const weight = parseInt(weightPart);

            if (isNaN(feet) || isNaN(inches) || isNaN(weight)) return true; // Let the previous test handle

            // Calculate BMI using helper function
            const heightInInches = feet * 12 + inches;
            const bmi = calculateBMI(heightInInches, weight);

            // BMI must be 18 or above
            return bmi >= 18;
          });

        if (currentQuestion.isRequired) {
          schema = schema.required('Height and weight are required');
        }
      } else if (currentQuestion.validation === 'email') {
        schema = Yup.string().trim().email('Enter a valid email').required('Email is required');
      } else if (currentQuestion.validation === 'phone') {
        schema = generalPhoneSchema('Enter valid phone number').required('Phone Number is required');
      } else if (currentQuestion.validation === 'number') {
        let num = Yup.number().typeError('Must be a number');
        if (currentQuestion.validationRules?.min != null) {
          num = num.min(currentQuestion.validationRules.min, `Must be at least ${currentQuestion.validationRules.min}`);
        }
        if (currentQuestion.validationRules?.max != null) {
          num = num.max(currentQuestion.validationRules.max, `Must be at most ${currentQuestion.validationRules.max}`);
        }
        schema = num.required('Answer is required for this question');
      } else {
        schema = Yup.string().trim();
        if (currentQuestion.isRequired) {
          schema = schema.required('Answer is required for this question');
        }
      }
      break;

    default:
      schema = Yup.string();
  }

  // Handle "Other" option validation
  const hasOtherInOptions =
    Array.isArray(currentQuestion.options) &&
    currentQuestion.options.some((item) => typeof item === 'string' && item.toLowerCase().includes('other')) &&
    !textKey.includes('gender');

  if (hasOtherInOptions) {
    schema = (schema as Yup.MixedSchema).test(
      'other-text',
      'Please specify other',
      function (v, context: Yup.TestContext) {
        if (!v) return true;

        if (Array.isArray(v) && v.some((item) => typeof item === 'string' && item.toLowerCase().includes('other'))) {
          const otherText = context.parent.otherText;
          return typeof otherText === 'string' && otherText.trim().length > 0;
        }

        if (typeof v === 'string' && v.toLowerCase().includes('other')) {
          const otherText = context.parent.otherText;
          return typeof otherText === 'string' && otherText.trim().length > 0;
        }

        return true;
      }
    );
  }

  return Yup.object({
    [fieldName]: schema,
    otherText: Yup.string().when(fieldName, {
      is: (answer: IntakeFormValues['answer']) => {
        if (Array.isArray(answer) && !textKey.includes('gender')) {
          return answer.some((item: string) => typeof item === 'string' && item.toLowerCase().includes('other'));
        }
        if (typeof answer === 'string' && !textKey.includes('gender')) {
          return answer.toLowerCase().includes('other') || answer.toLowerCase().includes('please list');
        }
        return false;
      },
      then: (schema) => schema.required('Please specify other'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
};
