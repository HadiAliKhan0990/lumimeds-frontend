import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';
import { PatientAnswerType } from '@/lib/types';
import { QuestionType } from '@/lib/enums';

/**
 * Check if the question is about dates
 * @param questionText - The question text to check
 * @returns Whether the question is likely asking for a date
 */
export const isDateQuestion = (questionText: string): boolean => {
  return /date/i.test(questionText);
};

/**
 * Try to parse and format a date string
 * @param dateString - The string to parse as a date
 * @returns Formatted date string or null if parsing fails
 */
export const tryFormatDate = (dateString: string): string | null => {
  if (!dateString || typeof dateString !== 'string') return null;

  try {
    // Try parsing ISO date
    const date = parseISO(dateString);
    if (isValid(date)) {
      return formatInTimeZone(date, 'America/New_York', 'MMM dd, yyyy');
    }

    // Try creating date directly (for other formats)
    const directDate = new Date(dateString);
    if (isValid(directDate)) {
      return formatInTimeZone(directDate, 'America/New_York', 'MMM dd, yyyy');
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Try to parse JSON string
 * @param str - The string to parse as JSON
 * @returns Parsed object or null if parsing fails
 */
export const tryParseJSON = (str: string): object | null => {
  if (!str || typeof str !== 'string') return null;

  try {
    // Check if it looks like JSON (starts with { or [)
    const trimmed = str.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;

    const parsed = JSON.parse(trimmed);
    // Only return if it's an object or array
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Format key name to be more readable
 * Convert camelCase or snake_case to Title Case
 * @param key - The key name to format
 * @returns Formatted key name
 */
export const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Check if a value is empty
 * @param value - The value to check
 * @returns Whether the value is empty (null, undefined, empty string, empty array, or empty object)
 */
export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * Check if a PatientAnswerType is empty
 * @param answer - The answer value to check
 * @returns Whether the answer is empty (null, undefined, empty string, empty array, or empty object)
 */
export const isEmptyAnswer = (answer?: PatientAnswerType): boolean => {
  if (answer === null || answer === undefined || answer === '') {
    return true;
  }
  if (Array.isArray(answer)) {
    return answer.length === 0;
  }
  if (typeof answer === 'object' && !Array.isArray(answer)) {
    return Object.keys(answer).length === 0;
  }
  return false;
};

/**
 * Render value based on its type
 * @param value - The value to render
 * @returns String representation of the value
 */
export const renderFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Empty list' : value.join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

/**
 * Check if a question type is a choice-based question (multiple choice, dropdown, or checkboxes)
 * @param questionType - The question type to check
 * @returns Whether the question type is a choice question
 */
export const isChoiceQuestion = (questionType?: QuestionType | null): boolean => {
  return (
    questionType === QuestionType.MULTIPLE_CHOICE ||
    questionType === QuestionType.DROPDOWN ||
    questionType === QuestionType.CHECKBOXES
  );
};
