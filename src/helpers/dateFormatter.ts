/**
 * Standardized Date Formatting Helper
 *
 * This module provides consistent US date formatting across the entire platform.
 * All dates are formatted in the America/New_York timezone using date-fns-tz.
 *
 * Format Standards:
 * - Date only: MM/DD/YYYY (e.g., "11/03/2025")
 * - Date with time: MM/DD/YYYY h:mm AM/PM (e.g., "11/03/2025 4:39 PM")
 * - Short date: MMM DD, YYYY (e.g., "Nov 03, 2025")
 * - Long date with time: MMM DD, YYYY, h:mm AM/PM (e.g., "Nov 03, 2025, 4:39 PM")
 */

import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const US_TIMEZONE = 'America/New_York';

/**
 * Type for date input - accepts various formats
 */
export type DateInput = string | number | Date | null | undefined;

/**
 * Safely parses a date string by extracting the date part (YYYY-MM-DD) and creating a Date object in local timezone.
 * This prevents timezone shifts when parsing date-only strings.
 *
 * @param dateString - Date string to parse (e.g., "1970-05-01" or "1970-05-01T00:00:00Z")
 * @returns Date object in local timezone, or null if parsing fails
 *
 * @example
 * parseDateString("1970-05-01") // Date object for May 1, 1970 in local timezone
 * parseDateString("1970-05-01T00:00:00Z") // Date object for May 1, 1970 in local timezone
 */
export function parseDateString(dateString: string | null | undefined): Date | null {
  if (!dateString || typeof dateString !== 'string') return null;

  try {
    // Extract date part (YYYY-MM-DD) from any ISO date string
    const dateMatch = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      // Create date in LOCAL timezone (month is 0-indexed in Date constructor)
      // This ensures the date displayed matches the date in the string, regardless of timezone
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback: if format doesn't match, try original parsing
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Main date formatter - formats date in US format (MM/DD/YYYY)
 *
 * @param dateInput - Date to format (can be Date object, ISO string, timestamp, or null/undefined)
 * @returns Formatted date string like "11/03/2025" or empty string if invalid
 *
 * @example
 * formatUSDate(new Date()) // "11/03/2025"
 * formatUSDate("2025-11-03") // "11/03/2025"
 * formatUSDate(null) // ""
 */
export function formatUSDate(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    // Handle date-only strings (YYYY-MM-DD)
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      const [year, month, day] = dateInput.split('-').map(Number);
      const paddedMonth = String(month).padStart(2, '0');
      const paddedDay = String(day).padStart(2, '0');
      return `${paddedMonth}/${paddedDay}/${year}`;
    }

    // Handle ISO date strings with time (extract date part only to avoid timezone shifts)
    if (typeof dateInput === 'string') {
      const dateOnlyMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        const paddedMonth = String(month).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        return `${paddedMonth}/${paddedDay}/${year}`;
      }
    }

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yyyy');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time in US format (MM/DD/YYYY h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11/03/2025 4:39 PM" or empty string if invalid
 *
 * @example
 * formatUSDateTime(new Date()) // "11/03/2025 4:39 PM"
 * formatUSDateTime("2025-11-03T16:39:00") // "11/03/2025 4:39 PM"
 */
export function formatUSDateTime(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yyyy h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time and seconds in US format (MM/DD/YYYY h:mm:ss AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11/03/2025 4:39:30 PM" or empty string if invalid
 */
export function formatUSDateTimeWithSeconds(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yyyy h:mm:ss a');
  } catch {
    return '-';
  }
}

/**
 * Formats date in short US format (MMM DD, YYYY)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "Nov 03, 2025" or empty string if invalid
 *
 * @example
 * formatUSDateShort(new Date()) // "Nov 03, 2025"
 */
export function formatUSDateShort(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MMM dd, yyyy');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time in short US format (MMM DD, YYYY, h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "Nov 03, 2025, 4:39 PM" or empty string if invalid
 *
 * @example
 * formatUSDateTimeShort(new Date()) // "Nov 03, 2025, 4:39 PM"
 */
export function formatUSDateTimeShort(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MMM dd, yyyy, h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats time only in US format (h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted time string like "4:39 PM" or empty string if invalid
 */
export function formatUSTime(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats date in compact US format (MM/DD/YYYY)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11/03/25" or empty string if invalid
 */
export function formatUSDateCompact(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yy');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time in compact US format (MM/DD/YY h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11/03/25 4:39 PM" or empty string if invalid
 */
export function formatUSDateTimeCompact(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yy h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats date with hyphen separator (MM-DD-YYYY)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11-03-2025" or empty string if invalid
 */
export function formatUSDateHyphen(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM-dd-yyyy');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time and hyphen separator (MM-DD-YYYY h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11-03-2025 4:39 PM" or empty string if invalid
 */
export function formatUSDateTimeHyphen(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM-dd-yyyy h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats date in compact hyphen format (MM-DD-YY)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11-03-25" or empty string if invalid
 */
export function formatUSDateCompactHyphen(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM-dd-yy');
  } catch {
    return '-';
  }
}

/**
 * Formats date with time in compact hyphen format (MM-DD-YY h:mm AM/PM)
 *
 * @param dateInput - Date to format
 * @returns Formatted date string like "11-03-25 4:39 PM" or empty string if invalid
 */
export function formatUSDateTimeCompactHyphen(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, 'MM-dd-yy h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats relative timestamp for chat/messages
 * - Today: returns time only (e.g., "3:45 PM")
 * - Yesterday: returns "Yesterday"
 * - Older: returns short date (e.g., "Sep 05, 2025")
 *
 * @param dateInput - Date to format
 * @returns Formatted string or empty string if invalid
 */
export function formatRelativeDate(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    const now = toZonedTime(new Date(), US_TIMEZONE);
    const inputDate = toZonedTime(date, US_TIMEZONE);

    const nowDate = format(now, 'MM/dd/yyyy');
    const inputDateStr = format(inputDate, 'MM/dd/yyyy');

    if (nowDate === inputDateStr) {
      // Today - show time only
      return formatInTimeZone(date, US_TIMEZONE, 'h:mm a');
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'MM/dd/yyyy');

    if (inputDateStr === yesterdayStr) {
      return 'Yesterday';
    }

    // Older - show date only
    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yyyy');
  } catch {
    return '-';
  }
}

export function formatRelativeDateWithTime(dateInput: DateInput): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    const now = toZonedTime(new Date(), US_TIMEZONE);
    const inputDate = toZonedTime(date, US_TIMEZONE);

    const nowDateStr = format(now, 'MM/dd/yyyy');
    const inputDateStr = format(inputDate, 'MM/dd/yyyy');

    if (nowDateStr === inputDateStr) {
      return `Today, ${formatInTimeZone(date, US_TIMEZONE, 'h:mm a')}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'MM/dd/yyyy');

    if (inputDateStr === yesterdayStr) {
      return `Yesterday, ${formatInTimeZone(date, US_TIMEZONE, 'h:mm a')}`;
    }

    return formatInTimeZone(date, US_TIMEZONE, 'MM/dd/yyyy, h:mm a');
  } catch {
    return '-';
  }
}


/**
 * Adds days to a date and formats it in short US format
 *
 * @param dateInput - Starting date
 * @param daysToAdd - Number of days to add (can be negative)
 * @returns Formatted date string or "-" if invalid
 *
 * @example
 * addDaysAndFormat("2025-11-03", 21) // "Nov 24, 2025"
 */
export function addDaysAndFormat(dateInput: DateInput, daysToAdd: number = 0): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    date.setDate(date.getDate() + daysToAdd);
    return formatUSDateShort(date);
  } catch {
    return '-';
  }
}

/**
 * Custom date formatter with flexible options
 *
 * @param dateInput - Date to format
 * @param formatString - date-fns format string (e.g., "MM/dd/yyyy", "PPpp")
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * formatCustom(new Date(), "MM/dd/yyyy") // "11/03/2025"
 * formatCustom(new Date(), "EEEE, MMMM do, yyyy") // "Monday, November 3rd, 2025"
 */
export function formatCustom(dateInput: DateInput, formatString: string): string {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '-';

    return formatInTimeZone(date, US_TIMEZONE, formatString);
  } catch {
    return '-';
  }
}


export function formatTableDateTime(dateInput: DateInput): string {
  if (!dateInput) return '';

  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    return formatInTimeZone(date, US_TIMEZONE, 'MMM dd, yyyy h:mm a');
  } catch {
    return '';
  }
}