import { QuestionType, TextInputType } from '@/lib/enums';
import { MappingModelColumn } from '@/types/survey';
import { PatientSurveyValidationType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';

/**
 * Column types available in the database
 */
type ColumnType = 'uuid' | 'varchar' | 'date' | 'enum' | 'text' | 'json' | 'boolean' | 'timestamptz' | 'jsonb';

/**
 * Determines compatible column types based on question type and validation
 */
export function getCompatibleColumnTypes(question: SurveyQuestion): ColumnType[] {
  const { questionType, validation } = question;

  if (!questionType) {
    // If no question type, allow all types
    return ['uuid', 'varchar', 'date', 'enum', 'text', 'json', 'boolean', 'timestamptz', 'jsonb'];
  }

  // Handle INPUT_BOX with different validation types
  if (questionType === QuestionType.INPUT_BOX) {
    const validationType = validation as TextInputType | PatientSurveyValidationType | undefined;

    switch (validationType) {
      case TextInputType.NUMBER:
      case 'number':
        // Numbers can be stored in varchar (as strings) or numeric types
        return ['varchar', 'text', 'json', 'jsonb'];

      case TextInputType.DATE:
      case 'date':
        // Dates should map to date or timestamptz
        return ['date', 'timestamptz', 'varchar', 'text'];

      case TextInputType.DATETIME:
        // Datetime should map to timestamptz or date
        return ['timestamptz', 'date', 'varchar', 'text'];

      case TextInputType.EMAIL:
      case 'email':
        // Email is typically stored as varchar or text
        return ['varchar', 'text'];

      case TextInputType.PHONE:
      case 'phone':
        // Phone numbers are typically varchar or text
        return ['varchar', 'text'];

      case TextInputType.TEXT:
      case 'text':
      default:
        // Text input can map to varchar, text, or json types
        return ['varchar', 'text', 'json', 'jsonb'];
    }
  }

  // Handle choice-based questions (multiple choice, checkboxes, dropdown)
  if (
    questionType === QuestionType.MULTIPLE_CHOICE ||
    questionType === QuestionType.CHECKBOXES ||
    questionType === QuestionType.DROPDOWN
  ) {
    // Choice questions can map to enum, varchar, text, or json/jsonb (for arrays)
    return ['enum', 'varchar', 'text', 'json', 'jsonb'];
  }

  // Handle file upload
  if (questionType === QuestionType.FILE_UPLOAD) {
    // File uploads typically store paths/URLs as varchar/text, or metadata as json/jsonb
    return ['varchar', 'text', 'json', 'jsonb'];
  }

  // Default: allow common types
  return ['varchar', 'text', 'json', 'jsonb'];
}

/**
 * Checks if a column is compatible with the given question
 */
export function isColumnCompatible(column: MappingModelColumn, question: SurveyQuestion): boolean {
  const compatibleTypes = getCompatibleColumnTypes(question);
  return compatibleTypes.includes(column.type);
}

/**
 * Filters columns to only include those compatible with the question
 */
export function filterCompatibleColumns(columns: MappingModelColumn[], question: SurveyQuestion): MappingModelColumn[] {
  return columns.filter((column) => isColumnCompatible(column, question));
}
