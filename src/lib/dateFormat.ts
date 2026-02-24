/**
 * Date formatting utilities
 *
 * @deprecated This entire file is deprecated. Use functions from @/helpers/dateFormatter instead.
 *
 * Migration guide:
 * - formatDateTimeNumeric() -> Use formatUSDateTime() or formatCustom() from @/helpers/dateFormatter
 */

import { formatInTimeZone } from 'date-fns-tz';

/**
 * @deprecated Use formatUSDateTime or formatCustom from @/helpers/dateFormatter instead
 */
export function formatDateTimeNumeric(
  date?: string | null,
  options?: {
    includeSeconds?: boolean;
    use24Hour?: boolean;
    dateSeparator?: string;
    timeSeparator?: string;
    dateTimeSeparator?: string;
  }
): string {
  if (!date) return '';

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const {
    includeSeconds = false,
    use24Hour = false,
    dateSeparator = '/',
    timeSeparator = ':',
    dateTimeSeparator = ' ',
  } = options || {};

  const US_TIMEZONE = 'America/New_York';

  // Build format string based on options
  const datePart = `MM${dateSeparator}dd${dateSeparator}yyyy`;
  let timePart = '';

  if (use24Hour) {
    timePart = includeSeconds ? `HH${timeSeparator}mm${timeSeparator}ss` : `HH${timeSeparator}mm`;
  } else {
    timePart = includeSeconds ? `h${timeSeparator}mm${timeSeparator}ss a` : `h${timeSeparator}mm a`;
  }

  const formatString = `${datePart}${dateTimeSeparator}${timePart}`;

  return formatInTimeZone(d, US_TIMEZONE, formatString);
}

// Usage examples:
// Migrate to @/helpers/dateFormatter:
// formatUSDateTime('2024-01-15T14:30:45') // "01/15/2024 2:30 PM"
// formatUSDateTimeWithSeconds('2024-01-15T14:30:45') // "01/15/2024 2:30:45 PM"
// formatCustom('2024-01-15T14:30:45', 'MM-dd-yyyy HH:mm') // "01-15-2024 14:30"
