'use client';

import toast from 'react-hot-toast';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Field, FormikHelpers, useFormik, FormikProvider } from 'formik';
import { SurveyQuestion, MultiInput } from '@/store/slices/surveyQuestionSlice';
import { useLazyGetMappingModelsQuery } from '@/store/slices/surveysApiSlice';
import { GetMappingModelsParams, MappingModelColumn } from '@/types/survey';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { createMultiInboxMappingValidationSchema, MultiInboxFormValues } from '@/schemas/multiInboxMapping';
import * as Yup from 'yup';

interface Props {
  question: SurveyQuestion;
  onUpdate: (updatedQuestion: SurveyQuestion) => void;
  onClose: () => void;
  mappingModels: string[];
}

export const MultiInboxMappingContent = ({ question, onUpdate, onClose, mappingModels }: Props) => {
  const [fields, setFields] = useState<MappingModelColumn[]>([]);

  const [triggerGetMappingModels, { isFetching }] = useLazyGetMappingModelsQuery();

  const fetchFields = useCallback(
    async (modelName: string) => {
      if (!modelName) {
        setFields([]);
        return;
      }

      try {
        const params: GetMappingModelsParams = {
          model_name: modelName,
          schema: true,
        };

        const { data } = await triggerGetMappingModels(params).unwrap();

        if (data?.columns) {
          setFields(data.columns);
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data.message
            : (error as Error).data.message || 'Failed to fetch mapping data'
        );
      }
    },
    [triggerGetMappingModels]
  );

  // Get JSON keys for a selected field
  const getJsonKeys = (fieldName: string): string[] => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field || (field.type !== 'json' && field.type !== 'jsonb')) {
      return [];
    }
    return field.jsonStructure ? Object.keys(field.jsonStructure) : [];
  };

  // Get nested JSON keys for a selected JSON key within a field
  const getNestedJsonKeys = (fieldName: string, jsonKey: string): string[] => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field?.jsonStructure || !jsonKey) {
      return [];
    }
    const keyValue = field.jsonStructure[jsonKey];
    // Check if the value is an object (not null, not array, not primitive)
    if (keyValue && typeof keyValue === 'object' && !Array.isArray(keyValue) && keyValue !== null) {
      return Object.keys(keyValue);
    }
    return [];
  };

  // Check if a JSON key is itself a JSON object
  const isJsonKeyAnObject = (fieldName: string, jsonKey: string): boolean => {
    return getNestedJsonKeys(fieldName, jsonKey).length > 0;
  };

  // Initialize form values from question's multiInputs
  const initialValues: MultiInboxFormValues = useMemo(() => {
    const inputMappings =
      question.multiInputs && Array.isArray(question.multiInputs) && question.multiInputs.length > 0
        ? question.multiInputs.map((input) => {
            const jsonKey = input.mapping?.jsonKey || '';
            const jsonKeyParts = jsonKey ? jsonKey.split('.') : [];
            return {
              fieldName: input.fieldName || '',
              placeholder: input.placeholder || '',
              field: input.mapping?.field || '',
              jsonKey: jsonKeyParts[0] || '',
              nestedJsonKey: jsonKeyParts[1] || '',
            };
          })
        : [];

    return {
      model_name: question.mapping?.model || '',
      inputMappings,
    };
  }, [question.multiInputs, question.mapping?.model, question.id]);

  const handleSubmit = async (values: MultiInboxFormValues, { resetForm }: FormikHelpers<MultiInboxFormValues>) => {
    // Validate form using the schema directly
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (error: unknown) {
      // Validation failed - show error via toast
      if (error instanceof Yup.ValidationError) {
        // Collect all error messages
        const errorMessages: string[] = [];

        error.inner.forEach((err: Yup.ValidationError) => {
          if (err.path && err.message) {
            errorMessages.push(err.message);
          }
        });

        // Show first error message via toast
        if (errorMessages.length > 0) {
          toast.error(errorMessages[0]);
        } else {
          toast.error('Please fill in all required fields');
        }
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }

    // Update the question with new mappings
    const updatedMultiInputs: MultiInput[] =
      question.multiInputs?.map((input, index) => {
        const mapping = values.inputMappings[index];
        // Combine jsonKey and nestedJsonKey if nestedJsonKey exists
        let combinedJsonKey = mapping.jsonKey || '';
        if (mapping.nestedJsonKey && mapping.jsonKey) {
          combinedJsonKey = `${mapping.jsonKey}.${mapping.nestedJsonKey}`;
        }

        return {
          ...input,
          mapping: {
            field: mapping.field,
            jsonKey: combinedJsonKey || null,
          },
        };
      }) || [];

    const updatedQuestion: SurveyQuestion = {
      ...question,
      multiInputs: updatedMultiInputs,
      mapping: {
        type: 'schema',
        model: values.model_name,
        field: null,
        tag: null,
        isMultiInput: true, // Flag for backend to process multiInputs array
      },
    };

    onUpdate(updatedQuestion);
    toast.success('Mappings saved successfully');
    resetForm();
    onClose();
  };

  // Check if a field is JSON type
  const isJsonField = (fieldName: string): boolean => {
    const field = fields.find((f) => f.name === fieldName);
    return field?.type === 'json' || field?.type === 'jsonb';
  };

  // Validation schema
  const validationSchema = useMemo(() => createMultiInboxMappingValidationSchema(fields), [fields]);

  // Use useFormik hook
  // Note: We don't pass validationSchema to Formik because we handle validation manually in handleSubmit
  // This ensures onSubmit is always called, allowing us to show toast errors
  const formik = useFormik<MultiInboxFormValues>({
    initialValues,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  const { values, setFieldValue, setValues } = formik;

  // Sync form values when question changes (for enableReinitialize)
  // Update form when question.id changes (different question selected)
  useEffect(() => {
    setValues(initialValues, false);
  }, [question.id, initialValues, setValues]); // Sync when question changes

  // Fetch fields on initial load if model is already selected
  useEffect(() => {
    if (initialValues.model_name) {
      fetchFields(initialValues.model_name);
    }
  }, []); // Only run on mount

  // Fetch fields and reset field mappings when model changes
  useEffect(() => {
    if (values.model_name) {
      fetchFields(values.model_name);
      // Reset all field mappings when model changes (only if it's a user-initiated change)
      // Check if this is a user change vs initial load by comparing with initialValues
      const isUserChange = values.model_name !== initialValues.model_name;
      if (isUserChange && values.inputMappings.length > 0) {
        values.inputMappings.forEach((_mapping, index: number) => {
          setFieldValue(`inputMappings.${index}.field`, '');
          setFieldValue(`inputMappings.${index}.jsonKey`, '');
          setFieldValue(`inputMappings.${index}.nestedJsonKey`, '');
        });
      }
    } else {
      setFields([]);
    }
  }, [values.model_name, setFieldValue, fetchFields, initialValues.model_name]);

  return (
    <FormikProvider value={formik}>
      <Form className='tw-space-y-4'>
        <div>
          <label htmlFor='model_name' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Model <span className='tw-text-red-500'>*</span>
          </label>
          <Field as='select' id='model_name' name='model_name' className='form-select text-base shadow-none'>
            <option value=''>Select Model</option>
            {mappingModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Field>
        </div>

        {values.model_name && (
          <div className='tw-space-y-3'>
            <div className='tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>Field Mappings</div>

            {values.inputMappings.length === 0 ? (
              <div className='tw-text-sm tw-text-gray-500 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200'>
                No input fields configured. Please add input fields to this Multiple Inputs question before mapping.
              </div>
            ) : (
              values.inputMappings.map((mapping: MultiInboxFormValues['inputMappings'][0], index: number) => {
                const jsonKeys = getJsonKeys(mapping.field);
                const showJsonKey = isJsonField(mapping.field) && jsonKeys.length > 0;

                // Get nested JSON keys for the selected JSON key
                const nestedJsonKeys = mapping.jsonKey ? getNestedJsonKeys(mapping.field, mapping.jsonKey) : [];
                const showNestedJsonKey =
                  showJsonKey &&
                  mapping.jsonKey &&
                  isJsonKeyAnObject(mapping.field, mapping.jsonKey) &&
                  nestedJsonKeys.length > 0;

                return (
                  <div
                    key={`${mapping.fieldName}-${index}`}
                    className='tw-border tw-border-gray-200 tw-rounded-lg tw-p-3 tw-space-y-2'
                  >
                    <div className='tw-text-sm tw-font-medium tw-text-gray-600'>
                      {mapping.fieldName || `Input ${index + 1}`} {mapping.placeholder && `(${mapping.placeholder})`}
                    </div>

                    <div className='tw-grid tw-grid-cols-1 tw-gap-2'>
                      <div>
                        <label
                          htmlFor={`inputMappings.${index}.field`}
                          className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'
                        >
                          Schema Field <span className='tw-text-red-500'>*</span>
                        </label>
                        <Field
                          as='select'
                          id={`inputMappings.${index}.field`}
                          name={`inputMappings.${index}.field`}
                          disabled={isFetching}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFieldValue(`inputMappings.${index}.field`, e.target.value);
                            // Reset jsonKey and nestedJsonKey when field changes
                            setFieldValue(`inputMappings.${index}.jsonKey`, '');
                            setFieldValue(`inputMappings.${index}.nestedJsonKey`, '');
                          }}
                          className='form-select form-select-sm text-base shadow-none'
                        >
                          <option value=''>{isFetching ? 'Loading...' : 'Select Field'}</option>
                          {fields.map((field) => (
                            <option key={field.name} value={field.name}>
                              {field.name} ({field.type})
                            </option>
                          ))}
                        </Field>
                      </div>

                      {showJsonKey && (
                        <div>
                          <label
                            htmlFor={`inputMappings.${index}.jsonKey`}
                            className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'
                          >
                            JSON Key <span className='tw-text-red-500'>*</span>
                          </label>
                          <Field
                            as='select'
                            id={`inputMappings.${index}.jsonKey`}
                            name={`inputMappings.${index}.jsonKey`}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              setFieldValue(`inputMappings.${index}.jsonKey`, e.target.value);
                              // Reset nestedJsonKey when jsonKey changes
                              setFieldValue(`inputMappings.${index}.nestedJsonKey`, '');
                            }}
                            className='form-select form-select-sm text-base shadow-none'
                          >
                            <option value=''>Select JSON Key</option>
                            {jsonKeys.map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </Field>
                        </div>
                      )}

                      {showNestedJsonKey && (
                        <div>
                          <label
                            htmlFor={`inputMappings.${index}.nestedJsonKey`}
                            className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'
                          >
                            Nested JSON Key <span className='tw-text-red-500'>*</span>
                          </label>
                          <Field
                            as='select'
                            id={`inputMappings.${index}.nestedJsonKey`}
                            name={`inputMappings.${index}.nestedJsonKey`}
                            className='form-select form-select-sm text-base shadow-none'
                          >
                            <option value=''>Select Nested JSON Key</option>
                            {nestedJsonKeys.map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </Field>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className='tw-flex tw-gap-3 tw-w-full tw-justify-end tw-pt-4 tw-pb-5'>
          <button
            type='button'
            onClick={onClose}
            className='tw-px-4 tw-py-2 tw-border tw-border-primary tw-border-solid tw-rounded-lg tw-text-primary tw-bg-white hover:tw-bg-primary/10 tw-transition-all'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={!values.model_name}
            className='tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-primary/90 tw-transition-all disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
          >
            Save Mappings
          </button>
        </div>
      </Form>
    </FormikProvider>
  );
};
