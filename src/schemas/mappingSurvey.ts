import * as Yup from 'yup';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { MappingModelColumn } from '@/types/survey';
import { isColumnCompatible } from '@/helpers/mappingHelpers';

export interface FormValues {
  model_name: string;
  mapTo: string;
  field: string;
  jsonKey: string;
  tag: string;
}

/**
 * Creates a validation schema for mapping form
 * @param question - The survey question being mapped
 * @param availableFields - The available fields/columns from the selected model
 */
export const createMappingValidationSchema = (question?: SurveyQuestion, availableFields?: MappingModelColumn[]) => {
  const baseSchema = Yup.object({
    model_name: Yup.string().required('Model name is required'),
    mapTo: Yup.string()
      .oneOf(['schema', 'tag'], "Map to must be either 'schema' or 'tag'")
      .required('Map to is required'),
  });

  // Build field validation
  let fieldSchema = Yup.string();
  if (question && availableFields && availableFields.length > 0) {
    fieldSchema = fieldSchema.test(
      'field-compatibility',
      'Selected field type is not compatible with this question type',
      function (value) {
        if (!value) return true; // Required check handled separately

        const selectedField = availableFields.find((field) => field.name === value);
        if (!selectedField) return true; // Field not found, let other validation handle it

        // Skip type validation for JSON fields
        if (selectedField.type === 'json' || selectedField.type === 'jsonb') {
          return true;
        }

        return isColumnCompatible(selectedField, question);
      }
    );
  }

  // Build tag validation
  const tagSchema = Yup.string();

  // Build jsonKey validation - required when field type is json
  const jsonKeySchema = Yup.string().when(['field', 'mapTo'], {
    is: (field: string, mapTo: string) => {
      if (mapTo !== 'schema' || !field) return false;
      const selectedField = availableFields?.find((f) => f.name === field);
      return selectedField?.type === 'json' || selectedField?.type === 'jsonb';
    },
    then: () => Yup.string().required('JSON key is required for JSON fields'),
    otherwise: () => Yup.string().notRequired(),
  });

  return baseSchema.shape({
    field: Yup.string().when('mapTo', {
      is: 'schema',
      then: () => fieldSchema.required('Field is required when mapping to schema'),
      otherwise: () => Yup.string().notRequired(),
    }),
    jsonKey: jsonKeySchema,
    tag: Yup.string().when('mapTo', {
      is: 'tag',
      then: () => tagSchema.required('Tag is required when mapping to tag'),
      otherwise: () => Yup.string().notRequired(),
    }),
  });
};
