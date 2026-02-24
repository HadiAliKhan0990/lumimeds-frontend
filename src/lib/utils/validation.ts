/**
 * Validates if a string is a valid UUID v4 format
 * @param value - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

