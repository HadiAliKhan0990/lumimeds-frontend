/**
 * Helper function to check if a name already has a doctor title
 * Handles formats like: "Dr", "Dr.", "DR", "Doctor", "Dr.saqib", etc.
 * Prevents false positives like "Drim" or "Android"
 */
const hasDoctorTitle = (name: string): boolean => {
  const trimmed = name.trim();

  // Matches any standalone "dr" or "doctor" (case-insensitive),
  // optionally followed by a dot or space before the name.
  return /\b(dr|doctor)\b\.?/i.test(trimmed);
};

/**
 * Helper function to normalize doctor titles to "Dr." format
 * Converts "Doctor" or "Dr" (in any form) to "Dr."
 * Handles edge cases like "Dr.saqib", "DoctorSaqib", "dr.Saqib", etc.
 */
const normalizeDoctorTitle = (name: string): string => {
  if (!name) return '';

  let normalized = name.trim();

  // Remove Dr/Doctor prefix from the beginning with or without dot/space
  normalized = normalized.replace(/^(doctor|dr)[.\s]*/gi, '');

  // Remove Dr/Doctor from the middle of the name as well
  normalized = normalized.replace(/\b(doctor|dr)[.\s]+/gi, '');

  // Capitalize each word properly
  normalized = normalized
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Clean up extra spaces
  return normalized.replace(/\s+/g, ' ').trim();
};

/**
 * Utility function to format provider names with "Dr." prefix
 */
export const formatProviderName = (firstName?: string | null, lastName?: string | null): string => {
  if (!firstName && !lastName) return 'N/A';

  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (!fullName) return 'N/A';

  if (hasDoctorTitle(fullName)) {
    return normalizeDoctorTitle(fullName);
  }

  // Special case: Don't add "Dr." prefix for "Care Team"
  if (fullName.toLowerCase() === 'care team') {
    return 'Care Team';
  }

  // Capitalize and prefix "Dr."
  const capitalized = fullName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return `${capitalized}`;
};

/**
 * Utility function to format first name with "Dr." prefix
 */
export const formatProviderFirstName = (firstName?: string | null): string => {
  if (!firstName || !firstName.trim()) return 'N/A';

  const trimmed = firstName.trim();

  if (hasDoctorTitle(trimmed)) {
    return normalizeDoctorTitle(trimmed);
  }

  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  return `${capitalized}`;
};

/**
 * Utility function to format last name with proper capitalization
 */
export const formatProviderLastName = (lastName?: string | null): string => {
  if (!lastName || !lastName.trim()) return 'N/A';

  const trimmed = lastName.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Alternative function that takes a full name string
 */
export const formatProviderNameFromString = (fullName?: string | null): string => {
  if (!fullName || !fullName.trim()) return 'N/A';

  const trimmed = fullName.trim();

  if (hasDoctorTitle(trimmed)) {
    return normalizeDoctorTitle(trimmed);
  }

  if (trimmed.toLowerCase() === 'care team') {
    return 'Care Team';
  }

  const capitalized = trimmed
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return `${capitalized}`;
};
