import * as yup from 'yup';
import { ALLOWED_VARIABLES } from '@/schemas/messageTemplate';

// Helper function to strip HTML tags and check if content is empty
const stripHtmlAndTrim = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags
  const stripped = html.replaceAll(/<[^>]*>/g, '');
  // Decode HTML entities
  if (typeof document === 'undefined') {
    // Fallback for server-side
    return stripped.replaceAll('&nbsp;', ' ').trim();
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = stripped;
  return textarea.value.trim();
};

export const getValidationSchema = (isBlastMessaging: boolean = false) => {
  return yup
    .object()
    .shape({
      receiverId: isBlastMessaging ? yup.string().optional() : yup.string().required(),
      content: yup
        .string()
        .when('attachment', {
          is: (attachment: File | undefined) => !attachment,
          then: (schema) =>
            schema
              .required('Message content is required when no attachment is provided')
              .test('notEmpty', 'Message content cannot be empty or only whitespace', (value) => {
                if (!value) return false;
                const stripped = stripHtmlAndTrim(value);
                return stripped.length > 0;
              })
              .test('minLength', 'Content must be at least 1 character', (value) => {
                if (!value) return false;
                const stripped = stripHtmlAndTrim(value);
                return stripped.length >= 1;
              }),
          otherwise: (schema) =>
            schema.optional().test('notEmptyIfProvided', 'Message content cannot be only whitespace', (value) => {
              if (!value) return true; // Optional, so empty is ok
              const stripped = stripHtmlAndTrim(value);
              return stripped.length > 0;
            }),
        })
        .test('valid-variables', 'Invalid variables detected', function (value) {
          // Only validate variables if templateId is present
          const { templateId } = this.parent;
          if (!templateId || !value) return true;

          // Extract all variables from content (strip HTML first)
          const strippedContent = stripHtmlAndTrim(value);
          const variableRegex = /\{\{(\w+)\}\}/g;
          const matches = [...strippedContent.matchAll(variableRegex)];

          if (matches.length === 0) return true;

          const invalidVars: string[] = [];

          for (const match of matches) {
            const varName = match[1];
            if (!ALLOWED_VARIABLES.includes(varName as (typeof ALLOWED_VARIABLES)[number])) {
              invalidVars.push(varName);
            }
          }

          if (invalidVars.length > 0) {
            return this.createError({
              message: `Invalid variable(s): ${invalidVars.join(', ')}. Only ${ALLOWED_VARIABLES.join(
                ', '
              )} are allowed.`,
            });
          }

          return true;
        }),
      attachment: yup
        .mixed<File>()
        .optional()
        .test('fileSize', 'File size must be less than 5MB', (value) => {
          if (!value) return true; // Optional field
          return value.size <= 5 * 1024 * 1024; // 5MB in bytes
        })
        .test('fileType', 'Only PDF and image files (JPEG, JPG, PNG, GIF) are allowed', (value) => {
          if (!value) return true; // Optional field
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
          return allowedTypes.includes(value.type);
        }),

      templateId: yup.string().optional(),
    })
    .test('contentOrAttachment', 'Either message content or attachment is required', (values) => {
      if (values.attachment) return true;
      if (!values.content) return false;
      const stripped = stripHtmlAndTrim(values.content);
      return stripped.length > 0;
    });
};

// Keep the default export for backward compatibility
export const validationSchema = getValidationSchema(false);

export type MessageSchema = yup.InferType<typeof validationSchema>;
