import * as Yup from 'yup';
import { MappingModelColumn } from '@/types/survey';

export interface MultiInboxFormValues {
  model_name: string;
  inputMappings: Array<{
    fieldName: string;
    placeholder: string;
    field: string;
    jsonKey: string;
    nestedJsonKey?: string;
  }>;
}

/**
 * Creates a validation schema for multi-inbox mapping form
 * @param fields - The available fields/columns from the selected model
 * @param inputMappings - Current input mappings to determine which fields need validation
 */
export const createMultiInboxMappingValidationSchema = (fields: MappingModelColumn[] = []) => {
  return Yup.object({
    model_name: Yup.string().required('Model is required'),
    inputMappings: Yup.array()
      .of(
        Yup.object().shape({
          fieldName: Yup.string().required(),
          placeholder: Yup.string(),
          field: Yup.string().required('Schema Field is required'),
          jsonKey: Yup.string().when(['field'], {
            is: (field: string) => {
              if (!field) return false;
              const selectedField = fields.find((f) => f.name === field);
              if (!selectedField) return false;
              const isJsonField = selectedField.type === 'json' || selectedField.type === 'jsonb';
              if (!isJsonField) return false;
              // Check if field has JSON structure with keys
              return selectedField.jsonStructure && Object.keys(selectedField.jsonStructure).length > 0;
            },
            then: () => Yup.string().required('JSON Key is required'),
            otherwise: () => Yup.string().notRequired(),
          }),
          nestedJsonKey: Yup.string().when(['field', 'jsonKey'], {
            is: (field: string, jsonKey: string) => {
              if (!field || !jsonKey) return false;
              const selectedField = fields.find((f) => f.name === field);
              if (!selectedField || !selectedField.jsonStructure) return false;

              // Extract first-level key from jsonKey (handle "key.nested" format)
              const jsonKeyParts = jsonKey ? jsonKey.split('.') : [];
              const firstLevelKey = jsonKeyParts[0] || '';

              if (!firstLevelKey) return false;

              const keyValue = selectedField.jsonStructure[firstLevelKey];
              // Check if the value is an object (not null, not array, not primitive)
              return (
                keyValue &&
                typeof keyValue === 'object' &&
                !Array.isArray(keyValue) &&
                keyValue !== null &&
                Object.keys(keyValue).length > 0
              );
            },
            then: () => Yup.string().required('Nested JSON Key is required'),
            otherwise: () => Yup.string().notRequired(),
          }),
        })
      )
      .min(1, 'At least one input mapping is required'),
  });
};
