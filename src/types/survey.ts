import { CompletedSurvey, MetaPayload, Response } from '@/lib/types';
import { PendingSurvey } from '@/store/slices/surveysApiSlice';

export type PatientIntakeFormValues = {
  answer: string | string[] | Date | File;
  otherText: string;
  multiInboxAnswers?: Record<string, string>; // For Multi Inbox questions: { fieldName: value }
};

export type IntakeFormValues = {
  [key: string]: string | string[] | Date | File | null | undefined;
  otherText?: string;
};

export type PatientSurveyState = {
  pending: {
    data: PendingSurvey[];
    meta: MetaPayload['meta'];
  };
  completed: {
    data: CompletedSurvey[];
    meta: MetaPayload['meta'];
  };
};

export type MappingModelColumn = {
  name: string;
  type: 'uuid' | 'varchar' | 'date' | 'enum' | 'text' | 'json' | 'boolean' | 'timestamptz' | 'jsonb';
  isNullable: boolean;
  isPrimary: boolean;
  length: number | null;
  default: unknown;
  jsonStructure?: Record<string, unknown>;
};

export interface GetMappingModelsResponse extends Response {
  data: {
    // models
    models?: string[];

    // tags
    tags?: string[];

    // schema

    modelName?: string;
    tableName?: string;
    columns?: MappingModelColumn[];
    totalColumns?: number;
  };
}

export type GetMappingModelsParams = {
  model_name?: string;
  schema?: boolean;
  tags?: boolean;
};
