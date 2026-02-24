import * as Yup from 'yup';
import { QuestionType } from '@/lib/enums';
import { PatientSurveyAnswerType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { getBmi } from '@/helpers/intakeSurvey';
import { generalPhoneSchema } from '@/lib/schema/pharmacyPatient';

export const validationSchema = (question?: SurveyQuestion, current?: PatientSurveyAnswerType) => {
  let schema;

  const textKey = question?.questionText?.toLowerCase() ?? '';
  const isDateOfBirth = textKey.includes('birth') || textKey.includes('dob');
  const isHeight = textKey.includes('height');

  const minDob = new Date();
  minDob.setFullYear(minDob.getFullYear() - 100);
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const images = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
  };
  const fileTypes = { ...images, 'application/pdf': ['.pdf'] };
  const allowedMimeTypes = question?.metaData?.isSignature ? Object.keys(images) : Object.keys(fileTypes);

  switch (question?.questionType) {
    case QuestionType.MULTIPLE_CHOICE:
      schema = Yup.array().of(Yup.string());
      if (question?.isRequired) {
        schema = schema.min(1, 'Select at least one');
      }
      break;

    case QuestionType.DROPDOWN:
    case QuestionType.CHECKBOXES:
      schema = Yup.string().trim();
      if (question?.isRequired) {
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
            // Only validate required if the question is marked as required
            if (question?.isRequired) {
              return value !== null && value !== undefined && value !== '';
            }
            return true; // If not required, always pass
          });

        break;
      } else if (question?.validation === 'email') {
        schema = Yup.string().trim().email('Enter a valid email').required('Email is required');
      } else if (question?.validation === 'phone') {
        schema = generalPhoneSchema('Enter valid phone number').required('Phone Number is required');
      } else if (question?.validation === 'number') {
        let num = Yup.number().typeError('Must be a number');
        if (question?.validationRules?.min != null) {
          num = num.min(question.validationRules.min, `Must be at least ${question.validationRules.min}`);
        }
        if (question?.validationRules?.max != null) {
          num = num.max(question.validationRules.max, `Must be at most ${question.validationRules.max}`);
        }
        schema = num.required('Answer is required for this question');
      } else {
        // Default string validation for INPUT_BOX
        schema = Yup.string().trim().nullable();
        if (question?.isRequired) {
          schema = schema.required('Answer is required for this question');
        }
      }
      break;

    case QuestionType.FILE_UPLOAD:
      schema = Yup.mixed();
      if (question?.isRequired) {
        schema = schema.test('file-required', 'File is required', (v) => !!v);
      }

      if (typeof current?.answer !== 'string') {
        schema = schema
          .test('file-type', 'Unsupported file type', (v) => {
            if (!v) return true;
            return allowedMimeTypes.includes((v as File).type);
          })
          .test('fileSize', 'File size must be less than 10MB', (value) => {
            if (!value) return true;
            return (value as File).size <= 10485760;
          });
      }

      break;

    case QuestionType.MULTI_INBOX:
      // For multi-inbox, we validate the multiInboxAnswers object
      schema = Yup.mixed();
      break;

    default:
      schema = Yup.string();
  }

  // Handle "Other" option validation
  if (
    Array.isArray(question?.options) &&
    question?.options.some((item) => typeof item === 'string' && item.toLowerCase().includes('other')) &&
    !textKey.includes('gender')
  ) {
    schema = (schema as Yup.MixedSchema).test('other-text', 'Please specify other', function (v) {
      if (!v) return true;

      // Check if "Other" is selected in array (for multiple choice)
      if (Array.isArray(v) && v.some((item) => typeof item === 'string' && item.toLowerCase().includes('other'))) {
        const otherText = this.parent.otherText;
        return typeof otherText === 'string' && otherText.trim().length > 0;
      }

      // Check if single value contains "Other" (for dropdown/checkboxes)
      if (typeof v === 'string' && v.toLowerCase().includes('other')) {
        const otherText = this.parent.otherText;
        return typeof otherText === 'string' && otherText.trim().length > 0;
      }

      return true;
    });
  }

  if (isHeight) {
    schema = Yup.string()
      .required('Height and weight are required')
      .test('valid-format', 'Please enter valid height and weight', function (value) {
        if (!value || typeof value !== 'string') {
          return this.createError({ message: 'Height and weight are required' });
        }

        const [heightPart, weightPart] = value.split(',');
        if (!heightPart || !weightPart) {
          return this.createError({ message: 'Please enter both height and weight' });
        }

        // Validate height format (feet-inches)
        const [feet, inches] = heightPart.split('-');
        if (!feet || !inches) {
          return this.createError({ message: 'Please select valid height' });
        }

        return true;
      })
      .test('valid-values', 'Please enter valid height and weight values', function (value) {
        if (!value || typeof value !== 'string') return false;
        const [heightPart, weightPart] = value.split(',');
        if (!heightPart || !weightPart) return false;

        const [feet, inches] = heightPart.split('-');
        const feetNum = Number.parseInt(feet, 10);
        const inchesNum = Number.parseInt(inches, 10);
        const weightNum = Number.parseInt(weightPart, 10);

        // Validate feet (1-8)
        if (Number.isNaN(feetNum) || feetNum < 1 || feetNum > 8) {
          return this.createError({ message: 'Feet must be between 1 and 8' });
        }

        // Validate inches (0-11)
        if (Number.isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11) {
          return this.createError({ message: 'Inches must be between 0 and 11' });
        }

        // Validate weight (must be positive number, max 999)
        if (Number.isNaN(weightNum) || weightNum <= 0) {
          return this.createError({ message: 'Please enter a valid weight' });
        }

        if (weightNum > 999) {
          return this.createError({ message: 'Weight must be less than 1000 lbs' });
        }

        return true;
      })
      .test('bmi-min', 'Your BMI must be 18 or above to proceed', (value) => {
        if (!value || typeof value !== 'string') return false;
        const bmi = getBmi(value);
        return bmi >= 18;
      });
  }

  // Build the validation object
  const validationObj: {
    answer: Yup.Schema;
    otherText: Yup.Schema;
    multiInboxAnswers?: Yup.Schema;
  } = {
    answer: schema,
    otherText: Yup.string().when('answer', {
      is: (answer: PatientSurveyAnswerType['answer']) => {
        if (Array.isArray(answer) && !textKey.includes('gender')) {
          return answer.some((item) => typeof item === 'string' && item.toLowerCase().includes('other'));
        }
        if (typeof answer === 'string' && !textKey.includes('gender')) {
          return answer.toLowerCase().includes('other') || answer.toLowerCase().includes('please list');
        }
        return false;
      },
      then: (schema) => schema.required('Please specify other'),
      otherwise: (schema) => schema.notRequired(),
    }),
  };

  // Add validation for multi-inbox questions
  if (question?.questionType === QuestionType.MULTI_INBOX && question?.multiInputs) {
    const multiInboxShape: Record<string, Yup.Schema> = {};

    question.multiInputs.forEach((input) => {
      if (input.fieldName) {
        let fieldSchema: Yup.Schema = Yup.string().trim();

        // Apply validation based on field type
        if (input.fieldType === 'number') {
          fieldSchema = Yup.number().typeError('Must be a number');
        } else if (input.fieldType === 'email') {
          fieldSchema = Yup.string().trim().email('Enter a valid email');
        } else if (input.fieldType === 'date' || input.fieldType === 'datetime') {
          fieldSchema = Yup.string().trim();
        }

        // Add required validation if the question is marked as required
        if (question.isRequired) {
          if (input.fieldType === 'number') {
            fieldSchema = (fieldSchema as Yup.NumberSchema).required(`${input.fieldName} is required`);
          } else {
            fieldSchema = (fieldSchema as Yup.StringSchema).required(`${input.fieldName} is required`);
          }
        }

        multiInboxShape[input.fieldName] = fieldSchema;
      }
    });

    validationObj.multiInboxAnswers = Yup.object().shape(multiInboxShape);
  }

  return Yup.object(validationObj);
};
