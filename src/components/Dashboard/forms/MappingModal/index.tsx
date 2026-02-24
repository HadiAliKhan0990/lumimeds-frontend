'use client';

import toast from 'react-hot-toast';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/elements';
import { Formik, FormikHelpers } from 'formik';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { createMappingValidationSchema, FormValues } from '@/schemas/mappingSurvey';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetMappingModelsQuery } from '@/store/slices/surveysApiSlice';
import { GetMappingModelsParams, MappingModelColumn } from '@/types/survey';
import { MappingFormContent } from './includes/MappingFormContent';
import { MultiInboxMappingContent } from './includes/MultiInboxMappingContent';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { QuestionType } from '@/lib/enums';

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: SurveyQuestion;
  onUpdate: (updatedQuestion: SurveyQuestion) => void;
}

export const MappingModal = ({ isOpen, onClose, question, onUpdate }: MappingModalProps) => {
  const [fields, setFields] = useState<MappingModelColumn[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  const mappingModels = useSelector((state: RootState) => state.formBuilder.mappingModels);

  const [triggerGetMappingModels] = useLazyGetMappingModelsQuery();

  // Memoize fetchMappingData to avoid recreating it on every render
  const fetchMappingDataMemoized = useCallback(
    async (modelName: string, mapTo: string) => {
      if (!modelName || !mapTo) {
        setFields([]);
        setTags([]);
        return;
      }

      setIsLoadingFields(true);
      try {
        const params: GetMappingModelsParams = {
          model_name: modelName,
        };

        if (mapTo === 'schema') {
          params.schema = true;
        } else if (mapTo === 'tag') {
          params.tags = true;
        }

        const { data } = await triggerGetMappingModels(params).unwrap();

        if (mapTo === 'schema' && data?.columns) {
          setFields(data.columns);
          setTags([]);
        } else if (mapTo === 'tag' && data?.tags) {
          setTags(data.tags);
          setFields([]);
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data.message
            : (error as Error).data.message || 'Failed to fetch mapping data'
        );
      } finally {
        setIsLoadingFields(false);
      }
    },
    [triggerGetMappingModels]
  );

  // Recalculate initialValues when question changes
  const initialValues: FormValues = useMemo<FormValues>(() => {
    const fieldValue = question.mapping?.field || '';
    // Parse nested field format (e.g., "medicalHistory.allergies" -> field: "medicalHistory", jsonKey: "allergies")
    let field = fieldValue;
    let jsonKey = '';

    if (fieldValue.includes('.')) {
      const parts = fieldValue.split('.');
      field = parts[0];
      jsonKey = parts.slice(1).join('.');
    }

    return {
      model_name: question.mapping?.model || '',
      mapTo: question.mapping?.type || '',
      field,
      jsonKey,
      tag: question.mapping?.tag || '',
    };
  }, [question.mapping]);

  const handleSubmit = (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    try {
      // Combine field and jsonKey into nested format if jsonKey exists
      let fieldValue = values.field;
      if (values.mapTo === 'schema' && values.jsonKey) {
        fieldValue = `${values.field}.${values.jsonKey}`;
      }

      // Update the question's mapping
      const mapping = {
        type: values.mapTo,
        model: values.model_name,
        field: values.mapTo === 'schema' ? fieldValue : null,
        tag: values.mapTo === 'tag' ? values.tag : null,
      };
      onUpdate({ ...question, mapping });
      resetForm();
      onClose();
    } catch {
      toast.error('Failed to update mapping');
    }
  };

  // Fetch fields/tags when modal opens with existing mapping
  useEffect(() => {
    if (isOpen && question.mapping?.model && question.mapping?.type) {
      fetchMappingDataMemoized(question.mapping.model, question.mapping.type);
    } else if (!isOpen) {
      // Reset fields and tags when modal closes
      setFields([]);
      setTags([]);
    }
  }, [isOpen, question.mapping?.model, question.mapping?.type, fetchMappingDataMemoized]);

  // Check if this is a Multi Inbox question
  const isMultiInbox = question.questionType === QuestionType.MULTI_INBOX;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMultiInbox ? 'Map Multiple Inputs Fields' : 'Add Mapping'}
      size='md'
      footer={
        !isMultiInbox ? (
          <div className='tw-flex tw-gap-3 tw-w-full tw-justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='tw-px-4 tw-py-2 tw-border tw-border-primary tw-border-solid tw-rounded-lg tw-text-primary tw-bg-white hover:tw-bg-primary/10 tw-transition-all'
            >
              Cancel
            </button>
            <button
              type='submit'
              form='mapping-form'
              className='tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-primary/90 tw-transition-all'
            >
              Save Mapping
            </button>
          </div>
        ) : undefined
      }
    >
      {isMultiInbox ? (
        <MultiInboxMappingContent
          question={question}
          onUpdate={onUpdate}
          onClose={onClose}
          mappingModels={mappingModels}
        />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={createMappingValidationSchema(question, fields)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <MappingFormContent
            mappingModels={mappingModels}
            fetchMappingData={fetchMappingDataMemoized}
            fields={fields}
            tags={tags}
            isLoadingFields={isLoadingFields}
          />
        </Formik>
      )}
    </Modal>
  );
};
