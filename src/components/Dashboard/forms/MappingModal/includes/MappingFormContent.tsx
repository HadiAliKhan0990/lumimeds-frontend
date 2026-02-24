import CreatableSelect from 'react-select/creatable';
import { MappingModelColumn } from '@/types/survey';
import { useEffect, useMemo } from 'react';
import { Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { FormValues } from '@/schemas/mappingSurvey';
import { SingleValue } from 'react-select';

interface Props {
  mappingModels: string[];
  fetchMappingData: (modelName: string, mapTo: string) => void;
  fields: MappingModelColumn[];
  tags: string[];
  isLoadingFields: boolean;
}

interface TagOption {
  value: string;
  label: string;
}

export const MappingFormContent = ({ mappingModels, fetchMappingData, fields, tags, isLoadingFields }: Props) => {
  const { values, handleChange, errors, touched, setFieldValue } = useFormikContext<FormValues>();

  // Get selected field to check if it's a JSON type
  const selectedField = useMemo(() => {
    if (!values.field) return null;
    return fields.find((field) => field.name === values.field) || null;
  }, [fields, values.field]);

  // Check if selected field is JSON type
  const isJsonField = selectedField?.type === 'json' || selectedField?.type === 'jsonb';

  // Get JSON structure keys for the selected field
  const jsonKeys = useMemo(() => {
    if (!isJsonField || !selectedField?.jsonStructure) return [];
    return Object.keys(selectedField.jsonStructure);
  }, [isJsonField, selectedField]);

  // Handle tag selection/creation
  const handleTagChange = (option: SingleValue<TagOption>) => {
    if (option) {
      setFieldValue('tag', option.value);
    } else {
      setFieldValue('tag', '');
    }
  };

  // Handle creating new tag
  const handleCreateTag = (inputValue: string) => {
    const newTag = inputValue.trim();
    if (newTag) {
      setFieldValue('tag', newTag);
    }
  };

  // Convert tags array to options format for CreatableSelect
  const tagOptions = useMemo<TagOption[]>(() => {
    return tags.map((tag) => ({ value: tag, label: tag }));
  }, [tags]);

  // Get current selected tag option
  const selectedTagOption = useMemo<TagOption | null>(() => {
    if (!values.tag) return null;
    return { value: values.tag, label: values.tag };
  }, [values.tag]);

  useEffect(() => {
    if (values.model_name && values.mapTo) {
      fetchMappingData(values.model_name, values.mapTo);
      // Reset field/tag when mapTo changes
      if (values.mapTo === 'schema') {
        setFieldValue('tag', '');
      } else if (values.mapTo === 'tags') {
        setFieldValue('field', '');
        setFieldValue('jsonKey', '');
      }
    }
  }, [values.model_name, values.mapTo, fetchMappingData, setFieldValue]);

  return (
    <Form id='mapping-form' className='tw-space-y-4'>
      <div>
        <label htmlFor='model_name' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
          Modal <span className='tw-text-red-500'>*</span>
        </label>
        <Field
          as='select'
          id='model_name'
          name='model_name'
          value={values.model_name}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            handleChange(e);
            // Reset mapTo, field, jsonKey, and tag when model changes
            setFieldValue('mapTo', '');
            setFieldValue('field', '');
            setFieldValue('jsonKey', '');
            setFieldValue('tag', '');
          }}
          className={`form-select text-base shadow-none ${
            errors.model_name && touched.model_name ? 'tw-border-red-500' : ''
          }`}
        >
          <option value=''>Select Modal</option>
          {mappingModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </Field>
        <ErrorMessage name='model_name' component='div' className='tw-text-red-500 tw-text-sm tw-mt-1' />
      </div>

      <div>
        <fieldset className='tw-border-0 tw-p-0 tw-m-0'>
          <legend className='tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Map To <span className='tw-text-red-500'>*</span>
          </legend>
          <div className='tw-flex tw-gap-4'>
            <label className='tw-flex tw-items-center tw-gap-2 tw-cursor-pointer'>
              <Field
                type='radio'
                name='mapTo'
                value='schema'
                className='tw-w-4 tw-h-4 tw-accent-primary'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  setFieldValue('tag', '');
                  setFieldValue('jsonKey', '');
                }}
              />
              Schema Field
            </label>
            <label className='tw-flex tw-items-center tw-gap-2 tw-cursor-pointer'>
              <Field
                type='radio'
                name='mapTo'
                value='tag'
                className='tw-w-4 tw-h-4 tw-accent-primary'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  setFieldValue('field', '');
                  setFieldValue('jsonKey', '');
                }}
              />
              Tag
            </label>
          </div>
        </fieldset>
        <ErrorMessage name='mapTo' component='div' className='tw-text-red-500 tw-text-sm tw-mt-1' />
      </div>

      {values.mapTo === 'schema' && (
        <div>
          <label htmlFor='field' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Field <span className='tw-text-red-500'>*</span>
          </label>
          <Field
            as='select'
            id='field'
            name='field'
            disabled={isLoadingFields}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange(e);
              // Reset jsonKey when field changes
              setFieldValue('jsonKey', '');
            }}
            className={`form-select text-base shadow-none ${errors.field && touched.field ? 'tw-border-red-500' : ''}`}
          >
            <option value=''>{isLoadingFields ? 'Loading fields...' : 'Select Field'}</option>
            {fields.length > 0 ? (
              fields.map((column) => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.type})
                </option>
              ))
            ) : (
              <option value='' disabled>
                No compatible fields found for this question type
              </option>
            )}
          </Field>
          <ErrorMessage name='field' component='div' className='tw-text-red-500 tw-text-sm tw-mt-1' />
        </div>
      )}

      {values.mapTo === 'schema' && isJsonField && jsonKeys.length > 0 && (
        <div>
          <label htmlFor='jsonKey' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            JSON Key <span className='tw-text-red-500'>*</span>
          </label>
          <Field
            as='select'
            id='jsonKey'
            name='jsonKey'
            disabled={isLoadingFields}
            className={`form-select text-base shadow-none ${
              errors.jsonKey && touched.jsonKey ? 'tw-border-red-500' : ''
            }`}
          >
            <option value=''>Select JSON Key</option>
            {jsonKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Field>
          <ErrorMessage name='jsonKey' component='div' className='tw-text-red-500 tw-text-sm tw-mt-1' />
        </div>
      )}

      {values.mapTo === 'tag' && (
        <div className='tw-min-h-52'>
          <label htmlFor='tag' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Tag <span className='tw-text-red-500'>*</span>
          </label>
          <CreatableSelect<TagOption>
            inputId='tag'
            isClearable
            isDisabled={isLoadingFields}
            placeholder={isLoadingFields ? 'Loading tags...' : 'Select or create a tag...'}
            options={tagOptions}
            value={selectedTagOption}
            onChange={handleTagChange}
            onCreateOption={handleCreateTag}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            onBlur={() => setFieldValue('tag', values.tag || '')}
            maxMenuHeight={150}
            classNames={{
              indicatorSeparator: () => 'tw-hidden',
            }}
          />
          <ErrorMessage name='tag' component='div' className='tw-text-red-500 tw-text-sm tw-mt-1' />
        </div>
      )}
    </Form>
  );
};
