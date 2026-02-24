import * as Yup from 'yup';

// Allowed variables in templates
export const ALLOWED_VARIABLES = ['firstName', 'lastName', 'email', 'trustPilotReviewLink'] as const;

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

export const messageTemplateValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Template name is required')
    .max(100, 'Template name must be less than 100 characters'),

  content: Yup.string()
    .trim()
    .required('Content is required')
    .test('minLength', 'Content must be at least 10 characters', function (value) {
      if (!value) return false;
      const stripped = stripHtmlAndTrim(value);
      return stripped.length >= 10;
    })
    .test('valid-variables', function (value) {
      if (!value) return true;

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
          message: `Invalid variable(s): ${invalidVars.join(', ')}. Only ${ALLOWED_VARIABLES.join(', ')} are allowed.`,
        });
      }

      return true;
    }),

  isActive: Yup.boolean(),
});

export type MessageTemplateFormValues = Yup.InferType<typeof messageTemplateValidationSchema>;
