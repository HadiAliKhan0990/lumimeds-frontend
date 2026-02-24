import { OrderStatus } from './types';
import { formatUSDateTimeShort, formatRelativeDate } from '@/helpers/dateFormatter';

export type JwtHeader = Record<string, unknown>;
export type JwtPayload = { exp?: number } & Record<string, unknown>;

export function quizOrCheckout() {
  const cookieName = 'lumimeds_quiz_taken';
  const value = document.cookie
    .split(';')
    .find((c) => c.trim().startsWith(`${cookieName}=`))
    ?.split('=')[1];
  if (value) window.location.href = '/products/summary';
  else window.location.href = '/intake';
}

export function decodeJWT(token: string): {
  decodedHeader: JwtHeader | undefined;
  decodedPayload: JwtPayload | undefined;
  signature: string | undefined;
} {
  try {
    if (!token || typeof token !== 'string') {
      return { decodedHeader: undefined, decodedPayload: undefined, signature: undefined };
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return { decodedHeader: undefined, decodedPayload: undefined, signature: undefined };
    }

    const [headerPart, payloadPart, signature] = parts;

    const base64UrlDecode = (input: string): string => {
      const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      try {
        if (typeof window === 'undefined') {
          // Node.js environment
          return Buffer.from(base64, 'base64').toString('utf-8');
        }
        // Browser environment
        // atob returns a binary string; JSON payloads are UTF-8 safe in practice
        // If needed, this can be enhanced to handle arbitrary unicode
        return atob(base64);
      } catch {
        return '';
      }
    };

    const safeJsonParse = <T = unknown>(jsonString: string): T | undefined => {
      try {
        return jsonString ? (JSON.parse(jsonString) as T) : undefined;
      } catch {
        return undefined;
      }
    };

    const decodedHeader = safeJsonParse<JwtHeader>(base64UrlDecode(headerPart));
    const decodedPayload = safeJsonParse<JwtPayload>(base64UrlDecode(payloadPart));

    return { decodedHeader, decodedPayload, signature };
  } catch {
    return { decodedHeader: undefined, decodedPayload: undefined, signature: undefined };
  }
}

export function ordinalSuffix(num: number) {
  const lastDigit = num % 10;
  if (lastDigit === 1 && num !== 11) return `${num}st`;
  if (lastDigit === 2 && num !== 12) return `${num}nd`;
  if (lastDigit === 3 && num !== 13) return `${num}rd`;
  return `${num}th`;
}

/**
 * Formats a date with time in US format
 *
 * @deprecated Use formatUSDateTimeShort from @/helpers/dateFormatter instead
 * @param date - Date string to format
 * @returns Formatted date string like "Nov 03, 2025, 4:39 PM" or empty string if invalid
 */
export function formatDatetime(date: string | null | undefined) {
  return formatUSDateTimeShort(date);
}

/**
 * Formats a date for chat lists/content in US Eastern timezone:
 * - Today: returns time only (e.g., "3:45 PM")
 * - Yesterday: returns "Yesterday"
 * - Older: returns date only (e.g., "Sep 05, 2025")
 *
 * @deprecated Use formatRelativeDate from @/helpers/dateFormatter instead
 */
export function formatRelativeChatTimestamp(date: string | Date | null | undefined): string {
  return formatRelativeDate(date);
}

export function pharmacyColor(pharmacy: string) {
  switch (pharmacy.toLowerCase()) {
    case 'beaker':
      return '#D5A6BD';
    case 'miller':
      return '#A4C2F4';
    case 'boothwyn':
      return '#B6D7A8';
    default:
      return '#E7E7E7';
  }
}

export function statusBackgroundColor(status: OrderStatus | null | undefined) {
  switch (status) {
    case 'Pending':
      return '#F3F4F6';
    case 'On_Hold':
      return '#FEFCE8';
    case 'Confirmed':
      return '#E0F2FE';
    case 'Failed':
      return '#FEF2F2';
    case 'Processing':
      return '#FEF3C7';
    case 'Shipped':
      return '#E0E7FF';
    case 'Out_for_Delivery':
      return '#D1FAE5';
    case 'Delivered':
      return '#DCFCE7';
    case 'Cancelled':
      return '#F3F4F6';
    case 'Returned':
      return '#FDE68A';
    case 'Refunded':
      return '#ECFDF5';
    case 'Active':
      return '#DCFFDA';
    case 'Disputed':
      return '#FEF2F2';
    case 'Unresponsive':
      return '#FEF3C7';
    case 'Refill':
      return '#E5E7EB';
    case 'Error':
      return '#FEF2F2';
  }
}

export function statusTextColor(status: OrderStatus | null | undefined) {
  switch (status) {
    case 'Pending':
      return '#111111';
    case 'On_Hold':
      return '#CA8A04';
    case 'Confirmed':
      return '#0369A1';
    case 'Failed':
      return '#B91C1C';
    case 'Processing':
      return '#D97706';
    case 'Shipped':
      return '#4338CA';
    case 'Out_for_Delivery':
      return '#047857';
    case 'Delivered':
      return '#166534';
    case 'Cancelled':
      return '#6B7280';
    case 'Returned':
      return '#92400E';
    case 'Refunded':
      return '#059669';
    case 'Active':
      return '#34AB2E';
    case 'Disputed':
      return '#B91C1C';
    case 'Unresponsive':
      return '#D97706';
    case 'Refill':
      return '#6B7280';
    case 'Error':
      return '#B91C1C';
  }
}

export const orderStatutsBaackgroundColor = (status: OrderStatus | null | undefined) => {
  switch (status?.trim()) {
    case 'Pending':
      return '#4F41B7';
    case 'Processing':
      return '#4F41B7';
    case 'Shipped':
      return '#8AE58A';
    case 'Approved':
      return '#8AE58A';
    case 'Paid':
      return '#8AE58A';
    case 'Delivered':
      return '#8AE58A';
    case 'Cancelled':
      return '#dc3545';
    case 'Declined':
      return '#dc3545';
    case 'Assigned':
      return '#F7E3C1';
    case 'Reverted':
      return '#EFE3E3';
    case 'Rolled_Back':
      return '#EFE3E3';
    case 'Pending_Renewal_Intake':
      return '#EFE3E3';
    case 'Pending_Medical_Intake':
    case 'Requires_Pending_Intake_Call':
    case 'Pending_Unresponsive':
      return '#EFE3E3';
    case 'Refunded':
      return '#d6e4ff';
    case 'Place':
      return '#ECEDC7';
    case 'Sent_To_Pharmacy':
      return '#ECEDC7';
    case 'Drafted':
    case 'Not_Paid':
      return '#191919';
    case 'Returned':
      return '#e5e7eb';
    case 'Completed':
      return '#d6e4ff';
    case 'On_Hold':
      return '#FEFCE8';
    case 'Confirmed':
      return '#E0F2FE';
    case 'Failed':
      return '#FEF2F2';
    case 'Out_for_Delivery':
      return '#D1FAE5';
    case 'Active':
      return '#DCFFDA';
    case 'Needs_VV':
      return '#FEF3C7';
    case 'Provider_Issue':
      return '#FEE2E2';
    case 'Intake_Missing':
      return '#DBEAFE';
    case 'Refill':
      return '#E5E7EB';
    case 'Error':
      return '#dc3545';
  }
};

export const orderStatutsTextColor = (status: OrderStatus | null | undefined) => {
  switch (status?.trim()) {
    case 'Pending':
      return '#ffffff';
    case 'Processing':
      return '#ffffff';
    case 'Shipped':
      return '#1b5e20';
    case 'Approved':
      return '#1b5e20';
    case 'Paid':
      return '#1b5e20';
    case 'Delivered':
      return '#1b5e20';
    case 'Cancelled':
      return '#ffffff';
    case 'Declined':
      return '#ffffff';
    case 'Assigned':
      return '#000000';
    case 'Reverted':
      return '#dc3545';
    case 'Rolled_Back':
      return '#dc3545';
    case 'Pending_Renewal_Intake':
      return '#dc3545';
    case 'Pending_Medical_Intake':
    case 'Requires_Pending_Intake_Call':
    case 'Pending_Unresponsive':
      return '#dc3545';
    case 'Refunded':
      return '#191919';
    case 'Place':
      return '#000000';
    case 'Sent_To_Pharmacy':
      return '#000000';
    case 'Drafted':
    case 'Not_Paid':
      return '#ffffff';
    case 'Returned':
      return '#191919';
    case 'Completed':
      return '#191919';
    case 'On_Hold':
      return '#CA8A04';
    case 'Confirmed':
      return '#0369A1';
    case 'Failed':
      return '#B91C1C';
    case 'Out_for_Delivery':
      return '#047857';
    case 'Active':
      return '#34AB2E';
    case 'Needs_VV':
      return '#92400E';
    case 'Provider_Issue':
      return '#991B1B';
    case 'Intake_Missing':
      return '#1E40AF';
    case 'Refill':
      return '#6B7280';
    case 'Error':
      return '#ffffff';
  }
};
export const formatStatusString = (status: string): string => {
  return status
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Separate camelCase words
    .replace(/_/g, ' ') // Replace underscores with spaces
    .toLowerCase() // Convert to lowercase
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first character of each word
};

export const formatOrderStatusForPatient = (status: string, isPatientView = false): string => {
  if (!isPatientView) {
    return formatStatusString(status);
  }
  
  const statusMap: Record<string, string> = {
    'Pending': 'Processing',
    'Approved': 'Prescription Approved',
    'Reverted': 'Action Required',
    'Rolled_Back': 'Action Required',
  };

  const mappedStatus = statusMap[status] || status;
  return formatStatusString(mappedStatus);
};

export function getAge(dob: string | null | undefined) {
  if (!dob) return '-';

  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }

  return age;
}
