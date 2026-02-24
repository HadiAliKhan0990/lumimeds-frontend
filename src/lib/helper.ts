import drugDirections from '@/data/drugDirections.json';
import { ROUTES } from '@/constants';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { ProductType } from '@/store/slices/productTypeSlice';
import { PatientSurveyAnswerType } from '@/lib/types';
import { EnumdoctorGroup } from '@/store/slices/pharmaciesApiSlice';
import { store } from '@/store';
import { Order } from '@/store/slices/orderSlice';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { formatCustom } from '@/helpers/dateFormatter';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { PAYMENT_ERROR_MAP, GENERIC_PAYMENT_ERROR_MESSAGE } from '@/lib/constants';

export function getFriendlyPaymentErrorMessage(message?: string | null): string {
  if (!message) {
    return GENERIC_PAYMENT_ERROR_MESSAGE;
  }

  const normalizedMessage = message.toLowerCase();
  /** ------------------------
   Keeping this below code commented because we might want to app code specific mapping in the future
   Currently we are not sure what exact error codes are returned by OpenPay
   ------------------------ **/

  // Check for error codes first (e.g., "3001", "Error 3001", "Code: 3001", etc.)
  // const errorCodeMatch = normalizedMessage.match(/\b(300[1-5]|4\d{3}|5\d{3})\b/);
  // if (errorCodeMatch) {
  //   const code = errorCodeMatch[1];
  //   if (PAYMENT_ERROR_MAP[code]) {
  //     return PAYMENT_ERROR_MAP[code];
  //   }
  // }

  // Check for keyword matches (prioritize more specific matches)
  // Sort by key length (longest first) to match more specific phrases first
  const sortedKeys = Object.keys(PAYMENT_ERROR_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (normalizedMessage.includes(key)) {
      return PAYMENT_ERROR_MAP[key];
    }
  }

  return GENERIC_PAYMENT_ERROR_MESSAGE;
}

export function isPublicRoute(pathname: string) {
  const PUBLIC_ROUTES = [
    ROUTES.PATIENT_FORGOT_PASSWORD,
    ROUTES.PATIENT_LOGIN,
    ROUTES.ADMIN_LOGIN,
    ROUTES.PROVIDER_LOGIN,
    ROUTES.RESET_PASSWORD,
    ROUTES.PROVIDER_FORGOT_PASSWORD,
    ROUTES.ADMIN_FORGOT_PASSWORD,
    ROUTES.PROVIDER_SURVEY,
    ROUTES.IMPERSONATE,
  ];
  return PUBLIC_ROUTES.some((route) => pathname.includes(route));
}

/**
 * Capitalizes the first letter of the given string and
 * lowercases the rest.
 *
 * @param input - The string to transform
 * @returns The string with first character uppercase and the rest lowercase
 */
export function capitalizeFirst(input?: string | null): string {
  if (!input) return '';
  const lowerCased = input.toLowerCase();
  return lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
}

/**
 * Converts a string between camelCase and normal format.
 *
 * @param str - The string to convert
 * @param method - The conversion method: 'camelCase' or 'normal'
 * @returns The converted string
 *
 * @example
 * // Convert normal string to camelCase
 * convertStringFormat('Hello World', 'camelCase') // returns 'helloWorld'
 *
 * @example
 * // Convert camelCase to normal string
 * convertStringFormat('helloWorld', 'normal') // returns 'Hello World'
 */
export function convertStringCamelCaseHandler(str: string, method: 'camelCase' | 'normal'): string {
  if (!str) return '';

  if (method === 'camelCase') {
    // Check if string is already in camelCase
    const isCamelCase = /^[a-z]+([A-Z][a-z]*)*$/.test(str);
    if (isCamelCase) return str;

    // Convert normal string to camelCase
    return str
      .split(/[\s_-]+/) // Split by spaces, underscores, or hyphens
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  if (method === 'normal') {
    // Check if string is in camelCase
    const isCamelCase = /^[a-z]+([A-Z][a-z]*)*$/.test(str);
    if (!isCamelCase) {
      // If not camelCase, just capitalize first letter
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Convert camelCase to normal string with spaces and capitalize first letter
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
      .trim();
  }

  return str;
}

/**
 * Formats a date into US format (MM/DD/YYYY) with leading zeros in US timezone.
 * This is specifically for form inputs that require consistent MM/DD/YYYY format.
 *
 * @param dateInput - A Date object, ISO string, timestamp, or undefined/null.
 * @returns A formatted date string like "04/18/2025" or "" if invalid.
 */
export function formatDateForInput(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

/**
 * Extracts the file name (with extension) from a given URL.
 *
 * @example
 *   extractFileName(
 *     'https://lumi-stag.s3.us-east-2.amazonaws.com/products/Semaglutide/image.png'
 *   ); // returns 'image.png'
 *
 * @param url - Full URL of the image
 * @returns The file name (e.g. "image.png"), or an empty string if none found
 */
export function extractFileName(url?: string | null) {
  if (!url) {
    // no URL provided
    return '';
  }

  try {
    // Use the built-in URL parser to get the pathname
    const { pathname } = new URL(url);
    // Split on '/' and take the last segment
    const segments = pathname.split('/');
    return segments.pop() || '';
  } catch (err) {
    console.log(err);

    // If invalid URL, fallback to simple split
    const parts = url.split('/');
    return parts.length ? parts[parts.length - 1] : '';
  }
}

/**
 * Checks if a URL is an S3 URL or needs a signed URL to be accessed.
 *
 * @param url - The URL to check
 * @returns true if the URL is an S3 URL or needs signing, false otherwise
 *
 * @example
 *   isS3Url('https://bucket.s3.amazonaws.com/file.jpg'); // returns true
 *   isS3Url('attachments/file.jpg'); // returns true
 *   isS3Url('https://example.com/image.jpg'); // returns false
 */
export function isS3Url(url: string | undefined): boolean {
  if (!url) return false;

  if (url.startsWith('http')) {
    // Check for S3 URL patterns (more specific to avoid false positives)
    return /https?:\/\/[^\/]+\.s3[^\/]*\.amazonaws\.com/.test(url) || url.includes('s3.amazonaws.com');
  }

  // Check if it's an S3 key path (not a full URL) - starts with common S3 prefixes
  return /^(attachments|chat|general-survey|patient-uploads)/.test(url);
}

/**
 * Extracts the S3 key from a full S3 URL or returns the key if it's already a key.
 *
 * @param fileKeyOrUrl - The S3 key or full S3 URL
 * @returns The extracted S3 key
 *
 * @example
 *   extractS3Key('https://bucket.s3.amazonaws.com/path/to/file.jpg'); // returns 'path/to/file.jpg'
 *   extractS3Key('path/to/file.jpg'); // returns 'path/to/file.jpg'
 */
export function extractS3Key(fileKeyOrUrl: string): string {
  if (fileKeyOrUrl.startsWith('http')) {
    try {
      const urlObj = new URL(fileKeyOrUrl);
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    } catch {
      // If URL parsing fails, try to extract manually
      console.warn('Failed to parse URL, attempting regex extraction:', fileKeyOrUrl);
      const match = fileKeyOrUrl.match(/\.s3[^\/]*\.amazonaws\.com\/(.+)/);
      if (match && match[1]) {
        return match[1];
      }
      // If it's not an HTTP URL, assume it's already a key
      if (!fileKeyOrUrl.startsWith('http')) {
        return fileKeyOrUrl;
      }
      // Log warning for unexpected cases
      console.warn('Could not extract S3 key from URL:', fileKeyOrUrl);
      return fileKeyOrUrl;
    }
  }
  return fileKeyOrUrl;
}

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (value instanceof File || value instanceof Blob) return false;
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0) return true;
  return false;
};

export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textarea);
  }
}

// utils/formatToUSD.ts

// Create once and reuse
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number of US cents into a USD currency string.
 *
 * @param cents - Amount in US cents. Can be negative.
 * @returns A formatted USD string, e.g. "$1,234.56" or "-$0.99".
 */
export function formatToUSD(cents: number | null | undefined = 0): string {
  // Ensure number
  const amount = cents ?? 0;
  // Convert cents → dollars and format
  return usdFormatter.format(amount / 100);
}

/**
 * Calculates the sum of an array, converting values to numbers.
 * Non-array inputs are treated as empty, invalid entries are treated as zero.
 * @param {any[]} arr - The input array to sum.
 * @returns {number} The total sum of the array elements.
 */

export function sumArray(arr?: number[]): number {
  // If input is not an array, log and return 0
  if (!Array.isArray(arr)) {
    console.warn('sumArray: Input is not an array; treating as empty array.');
    return 0;
  }

  return arr.reduce((accumulator, currentValue, index) => {
    // Convert to number
    const num = Number(currentValue);

    // If conversion yields NaN, warn and treat as 0
    if (isNaN(num)) {
      console.warn(`sumArray: Non-numeric element at index ${index} (${currentValue}) - treated as 0.`);
      return accumulator;
    }

    // Sum the numeric value
    return accumulator + num;
  }, 0);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: string, filename: string, type: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime ?? type });
}

export function getAnswer(val: string, answers: PatientSurveyAnswerType[], questions: SurveyQuestion[]) {
  return answers.find((a) => {
    const q = questions.find((q) => q.id === a.questionId);
    return q?.validation === val || q?.questionText?.toLowerCase().includes(val);
  })?.answer as string;
}

/**
 * Converts a Data URL (base64 string) to a Blob object.
 * @param dataUrl - The Data URL to convert.
 * @returns A Blob representing the binary data.
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  // Split the header from the data
  const [header, base64] = dataUrl.split(',');

  // Extract the MIME type
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';

  // Decode base64 string
  const binaryString =
    typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');

  // Create an ArrayBuffer and convert to Uint8Array
  const len = binaryString.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryString.charCodeAt(i);
  }

  // Create and return the Blob
  return new Blob([u8arr], { type: mime });
}

/**
 * Generates an array of random non-dark colors for each item in the input array
 * @param array Input array of any type
 * @returns Array of HSL color strings in the format "hsl(hue, saturation%, lightness%)"
 */
export function generateRandomColors<T>(array: T[]): string[] {
  if (array.length === 0) return [];

  const colors: string[] = [];
  const usedHues = new Set<number>();
  const minLightness = 70; // Ensures colors aren't dark (0-100 scale)
  const maxLightness = 90;
  const minSaturation = 60; // Ensures colors aren't too washed out
  const maxSaturation = 100;

  // Calculate how much to increment hue to maximize color differences
  const hueIncrement = 360 / array.length;
  const baseHue = Math.floor(Math.random() * 360);

  for (let i = 0; i < array.length; i++) {
    let hue: number;

    // First try evenly distributed hues
    if (i < 360) {
      hue = (baseHue + i * hueIncrement) % 360;
    } else {
      // If we have more items than possible hues, fall back to random
      hue = Math.floor(Math.random() * 360);
    }

    // Make sure we don't repeat hues (unless we've exhausted all possibilities)
    let attempts = 0;
    while (usedHues.has(hue) && attempts < 360) {
      hue = (hue + 1) % 360;
      attempts++;
    }

    usedHues.add(hue);

    const saturation = Math.floor(Math.random() * (maxSaturation - minSaturation + 1)) + minSaturation;
    const lightness = Math.floor(Math.random() * (maxLightness - minLightness + 1)) + minLightness;

    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

export function formatUSPhone(value?: string) {
  if (!value) return '';

  // remove all non‑digits
  const digits = value.replace(/\D/g, '');

  // optionally drop leading "1" if accidentally typed twice
  const normalized = digits.startsWith('1') ? digits.slice(1) : digits;

  const part1 = normalized.slice(0, 3);
  const part2 = normalized.slice(3, 6);
  const part3 = normalized.slice(6, 10);

  if (part2) {
    // if we have at least 3+3 digits:
    return `+1 (${part1}) ${part2}${part3 ? '-' + part3 : ''}`;
  }
  if (part1) {
    // still typing area code
    return `+1 (${part1}`;
  }
  return '+1 ';
}

export const removeSpacesAndBracketsFromString = (str: string): string => {
  return str.replace(/[^\d]/g, '');
};

/**
 * Agent-specific phone formatting that properly handles clearing
 * Returns empty string when no meaningful digits are present
 */
export function formatAgentPhone(value?: string) {
  if (!value) return '';

  // remove all non‑digits
  const digits = value.replace(/\D/g, '');

  // If no digits after cleaning, return empty string
  if (!digits) return '';

  // optionally drop leading "1" if accidentally typed twice
  const normalized = digits.startsWith('1') ? digits.slice(1) : digits;

  const part1 = normalized.slice(0, 3);
  const part2 = normalized.slice(3, 6);
  const part3 = normalized.slice(6, 10);

  if (part2) {
    // if we have at least 3+3 digits:
    return `+1 (${part1}) ${part2}${part3 ? '-' + part3 : ''}`;
  }
  if (part1) {
    // still typing area code
    return `+1 (${part1}`;
  }
  // If we have no meaningful digits, return empty string instead of '+1 '
  return '';
}

/**
 * Cleans a phone number by removing spaces, brackets, and dashes.
 * Keeps only the + symbol and digits.
 *
 * @param phoneNumber - The phone number string to clean
 * @returns Cleaned phone number with only + symbol and digits
 */
export function cleanPhoneNumber(phoneNumber?: string): string {
  if (!phoneNumber) return '';

  // Remove all characters except + symbol and digits (0-9)
  return phoneNumber.replace(/[^+\d]/g, '');
}

/**
 * Converts a File object or DataURL to a base64 string.
 * Optimized to handle both input types efficiently.
 *
 * @param input - File object or DataURL string
 * @returns Promise resolving to base64 string
 * @throws Error if conversion fails
 */
export async function toBase64(input: File | string): Promise<string> {
  // If input is already a DataURL, return it
  if (typeof input === 'string' && input.startsWith('data:')) {
    return input;
  }

  // If input is a File object
  if (input instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(new Error(`Failed to convert file to base64: ${error}`));
      reader.readAsDataURL(input);
    });
  }

  throw new Error('Invalid input: Expected File object or DataURL string');
}

export const formatCurrentDateTime = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year}, ${formattedHours}:${minutes} ${ampm}`;
};

/**
 * Formats a date in MM DD YY format (e.g., "01 08 25")
 * @param date - The Date object to format
 * @returns A formatted date string like "01 08 25"
 */
export const formatDateMMDDYYSpaced = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year

  return `${month} ${day} ${year}`;
};

/**
 * Extracts the file name from a URL string.
 * Handles URLs with query parameters and fragments.
 *
 * @param url The URL string to extract the file name from
 * @returns The extracted file name or undefined if not found
 */
export function extractFileNameFromUrl(url: string): string | undefined {
  try {
    // Handle cases where the URL might have query parameters or fragments
    const urlWithoutQuery = url.split('?')[0];
    const urlWithoutFragment = urlWithoutQuery.split('#')[0];

    // Split by '/' and get the last part
    const parts = urlWithoutFragment.split('/');
    const lastPart = parts[parts.length - 1];

    // Return the last part if it's not empty, otherwise undefined
    return lastPart.trim() || undefined;
  } catch (error) {
    console.error('Error extracting file name from URL:', error);
    return undefined;
  }
}

export const getFileDisplayName = (file: File) => {
  if (file.name.length > 20) {
    return file.name.substring(0, 17) + '...';
  }
  return file.name;
};

export function formatHeightWeightString(inputStr: string): string {
  // Split the string into height and weight parts
  const [heightPart, weightPart] = inputStr.split(',');

  // Split height into feet and inches
  const [feetStr, inchesStr] = heightPart.split('-');

  // Convert to numbers
  const feet = parseInt(feetStr, 10);
  const inches = parseInt(inchesStr, 10);
  const pounds = parseInt(weightPart, 10);

  // Return as a single string formatted exactly like the image
  return `Height: ${feet} Ft ${inches} In\n and Weight: ${pounds}lbs`;
}

/**
 * Extracts the interval count (number of months) from a product name
 * @param productName - The product name to parse (e.g., "Semaglutide-2 Month Olympia 503B One-Time Purchase")
 * @returns The number of months as a number, or null if no interval count could be found
 */
export function getIntervalCountFromProductName(productName: string): number | null {
  // Match patterns like "1 Month", "2 Month", "3 Month" etc.
  const match = productName.match(/(\d+)\s*Month/i);

  if (match && match[1]) {
    const count = parseInt(match[1], 10);
    return isNaN(count) ? null : count;
  }

  return null;
}
export function pluralizeMonthInProductName(name?: string | null): string {
  if (!name) return '';
  // Regex to find number before "Month" (case-insensitive) - handles both space and hyphen
  const match = name.match(/(\d+)[\s-]*Month/i);
  if (match) {
    const num = Number(match[1]);
    // Add 's' if number > 1 and not already plural
    return name.replace(/(\d+[\s-]*Month)(?!s)/i, (_, m) => (num > 1 ? `${m}s` : m));
  }
  return name;
}

export const removeSearchParams = (pathname: string, params: ReadonlyURLSearchParams) => {
  const newSearchParams = new URLSearchParams(params);

  newSearchParams.delete('q');
  newSearchParams.delete('r');

  const newUrl = `${pathname}?${newSearchParams.toString()}`;
  window.history.replaceState(null, '', newUrl);
};

export const removeSearchParamsObject = (pathname: string, params: Record<string, string>) => {
  // Get current search params from URL instead of creating new ones from params
  const currentSearchParams = new URLSearchParams(window.location.search);

  // Remove the specified parameters
  Object.keys(params).forEach((key) => {
    currentSearchParams.delete(key);
  });

  // Build the new URL
  const newSearchString = currentSearchParams.toString();
  const newUrl = newSearchString ? `${pathname}?${newSearchString}` : pathname;

  window.history.replaceState(null, '', newUrl);
};

/**
 * Removes URL search parameters by keys provided via an object (or array).
 *
 * - Any key present in `keys` will be removed from current search params
 * - Accepts either an object (keys of the object are removed) or an array of strings
 * - Builds a clean URL without a trailing `?` when no params remain
 */
export const removeSearchParamsByObject = (keys: string[]) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  keys.forEach((key) => url.searchParams.delete(key));

  const newPathWithQuery = url.pathname + (url.search ? url.search : '');
  window.history.replaceState(null, '', newPathWithQuery);
};

export function getLowestPriceProduct(products: ProductType[]) {
  let lowestMonthlyPrice = Infinity;
  const productsWithMonthlyPrice = products.map((product) => {
    const price = product.prices?.[0];
    const monthlyPrice = price ? price.amount / (price.billingIntervalCount || 1) : Infinity;
    return { ...product, monthlyPrice };
  });

  // Find the minimum monthly price
  lowestMonthlyPrice = Math.min(...productsWithMonthlyPrice.map((p) => p.monthlyPrice), Infinity);

  // Filter products that match the lowest price
  return productsWithMonthlyPrice.filter((p) => p.monthlyPrice === lowestMonthlyPrice);
}

/**
 * Extracts the concentration in mg/mL from a product object
 * @param prodConcentration The prodConcentration containing concentration information
 * @returns The concentration in mg/mL as a number
 * @throws Error if the concentration format is invalid or cannot be parsed
 */

export function extractConcentrationMgPerMl(prodConcentration: string): number {
  if (!prodConcentration) {
    throw new Error('Product concentration is missing');
  }
  console.log(prodConcentration, 'prodConcentration');
  // Extract the numeric value from concentration string (e.g., "25mg/ml" -> 25)
  const matches = prodConcentration.match(/(\d+(\.\d+)?)mg\/ml/i);
  if (!matches || matches.length < 2) {
    throw new Error(`Invalid concentration format: ${prodConcentration}`);
  }

  const concentration = parseFloat(matches[1]);
  if (isNaN(concentration)) {
    throw new Error(`Could not parse concentration: ${prodConcentration}`);
  }

  return concentration;
}

export function generateDispensingInstructions(doseMg: number, concentrationMgPerMl: string): string {
  const concentration = extractConcentrationMgPerMl(concentrationMgPerMl);
  const volumeInMl = doseMg / concentration;
  const units = volumeInMl / 0.01;
  return `Inject ${units.toFixed()} units (${doseMg}mg) subcutaneously once a week for 4 weeks`;
}

export function generateDispensingInstructionsDrugCrafters({
  doseMg,
  daysSupply,
  doctorGroup,
  drugName,
}: {
  drugName: string;
  doseMg: number;
  daysSupply: number;
  doctorGroup: EnumdoctorGroup;
}): string {
  console.log({ doctorGroup }, 'drugName');

  const selectedDrugDirection = drugDirections?.[drugName?.toLowerCase() as keyof typeof drugDirections];

  const selectedDrugGroup =
    selectedDrugDirection?.[doctorGroup?.toLocaleLowerCase() as keyof typeof selectedDrugDirection];

  const selectedDaysSupply = selectedDrugGroup?.[`${daysSupply}` as keyof typeof selectedDrugGroup];

  const selectedNote = selectedDaysSupply?.[`${doseMg}` as keyof typeof selectedDaysSupply] ?? [];

  return selectedNote.map((note) => `• ${note}`).join('\n');
}

/**
 * Get age from a given date in years.
 * Accepts Date, string, or timestamp.
 */
export function getAge(dateInput?: string | number | Date): number {
  if (!dateInput) return 0;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format provided');
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  // Adjust if the birthday hasn't occurred yet this year
  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}

/**
 * Extracts error messages from an API response with nested errors
 * @param errorString The error string in format "400 - {\"errors\":[\"error1\", \"error2\"]}"
 * @returns Array of error messages or null if no errors found
 */
export function extractApiErrors(errorString: string): string[] | null {
  try {
    // Extract the JSON part from the string
    const jsonStart = errorString.indexOf('{');
    if (jsonStart === -1) return null;

    const jsonString = errorString.slice(jsonStart);
    const errorObject = JSON.parse(jsonString);

    // Check if errors array exists
    if (errorObject.errors && Array.isArray(errorObject.errors)) {
      return errorObject.errors;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse error string:', error);
    return null;
  }
}

export const convertDateFormat = ({
  date,
  fromFormat,
  toFormat,
}: {
  date: string;
  fromFormat: string;
  toFormat: string;
}): string => {
  if (!date || !fromFormat || !toFormat) return '';

  try {
    // Parse the input date based on fromFormat
    const parsedDate = parseDateString(date, fromFormat);
    if (!parsedDate || isNaN(parsedDate.getTime())) return '';

    // Format the date according to toFormat
    return formatDateString(parsedDate, toFormat);
  } catch (error) {
    console.error('Error converting date format:', error);
    return '';
  }
};

/**
 * Helper function to parse a date string based on a given format
 * @param dateString The date string to parse
 * @param format The format pattern (e.g., 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY')
 * @returns A Date object or null if parsing fails
 */
export const parseDateString = (dateString: string, format: string): Date | null => {
  // Normalize the format and date string
  const normalizedFormat = format.toUpperCase();

  // Common separators
  const separators = ['-', '/', '.', ' '];
  let separator = '';

  // Find the separator used in the format
  for (const sep of separators) {
    if (normalizedFormat.includes(sep)) {
      separator = sep;
      break;
    }
  }

  if (!separator) return null;

  // Split format and date string
  const formatParts = normalizedFormat.split(separator);
  const dateParts = dateString.split(separator);

  if (formatParts.length !== dateParts.length) return null;

  let year = 0,
    month = 0,
    day = 0;

  // Map format parts to date appointments
  for (let i = 0; i < formatParts.length; i++) {
    const formatPart = formatParts[i];
    const datePart = parseInt(dateParts[i], 10);

    if (isNaN(datePart)) return null;

    if (formatPart.includes('YYYY')) {
      year = datePart;
    } else if (formatPart.includes('YY')) {
      // Handle 2-digit years (assume 20xx for years < 50, 19xx for years >= 50)
      year = datePart < 50 ? 2000 + datePart : 1900 + datePart;
    } else if (formatPart.includes('MM')) {
      month = datePart - 1; // JavaScript months are 0-indexed
    } else if (formatPart.includes('DD')) {
      day = datePart;
    }
  }

  // Validate date appointments
  if (year === 0 || month < 0 || month > 11 || day === 0 || day > 31) return null;

  return new Date(year, month, day);
};

/**
 * Helper function to format a Date object according to a given format pattern
 *
 * @deprecated Use formatCustom from @/helpers/dateFormatter instead
 * @param date The Date object to format
 * @param format The desired format pattern (e.g., 'MM/dd/yyyy', 'yyyy-MM-dd')
 * @returns The formatted date string
 */
export const formatDateString = (date: Date, formatPattern: string): string => {
  // Convert legacy format to date-fns format
  const dateFnsFormat = formatPattern
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/MM/g, 'MM')
    .replace(/M/g, 'M')
    .replace(/DD/g, 'dd')
    .replace(/D/g, 'd');
  return formatCustom(date, dateFnsFormat);
};

/**
 * Extracts error messages from an API response with nested errors
 * @param errorString The error string in format "400 - {\"errors\":[\"error1\", \"error2\"]}"
 * @returns Array of error messages or null if no errors found
 */

export const extractNumbersFromString = (str: string): number[] => str.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];

// Generic utility function to convert any object to FormData
export const createFormDataFromObject = (
  obj: Record<string, unknown>,
  formData = new FormData(),
  parentKey = ''
): FormData => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      // Handle null/undefined values
      formData.append(formKey, '');
    } else if (value instanceof Blob) {
      // Handle File and Blob objects (File extends Blob)
      formData.append(formKey, value);
    } else if (value instanceof Date) {
      // Handle Date objects
      formData.append(formKey, value.toISOString());
    } else if (Array.isArray(value)) {
      // Handle Arrays
      if (value.length === 0) {
        formData.append(formKey, '');
      } else {
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;
          if (typeof item === 'object' && item !== null && !(item instanceof Blob)) {
            // Array of objects - flatten each object
            createFormDataFromObject(item, formData, arrayKey);
          } else {
            // Array of primitives
            formData.append(arrayKey, item?.toString() || '');
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects - can either flatten or stringify
      // Option 1: Flatten nested objects (creates keys like parent[child][grandchild])
      createFormDataFromObject(value as Record<string, unknown>, formData, formKey);

      // Option 2: Stringify nested objects (uncomment if you prefer this approach)
      // formData.append(formKey, JSON.stringify(value));
    } else {
      // Handle primitive values (string, number, boolean)
      formData.append(formKey, value as string);
    }
  });

  return formData;
};

// Alternative simpler version that stringifies complex objects instead of flattening
export const createFormDataFromObjectSimple = (obj: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value === null || value === undefined) {
      formData.append(key, '');
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      // Stringify arrays and objects
      formData.append(key, JSON.stringify(value));
    } else {
      // Handle primitives
      formData.append(key, value.toString());
    }
  });

  return formData;
};

/**
 * Downloads a file from a Blob with a given filename
 */
export const downloadFileFromBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Finds and returns a word from a string regardless of case sensitivity.
 * Searches for substrings within the text, not just exact word matches.
 *
 * @param text - The string to search in
 * @param wordsToFind - An array of words to look for as substrings
 * @returns The first matching search term found in the text, or null if none found
 */
export function findWordIgnoreCase(text: string, wordsToFind: string[]): string | null {
  if (!text || !wordsToFind || wordsToFind.length === 0) return null;

  const lowerText = text.toLowerCase();

  // Find the first search term that exists as a substring in the text
  const foundTerm = wordsToFind.find((searchWord) => lowerText.includes(searchWord.toLowerCase()));

  return foundTerm || null;
}

/**
 * Removes +1 from a string
 * @param str - The input string to remove +1 from
 * @returns The string without +1
 */
export const removePlusSign = (str: string): string => {
  return str.replace(/\+1/g, '');
};

export async function scrollToTop(id?: string) {
  if (!id) return '';

  const topRef = document.getElementById(id);
  if (topRef) {
    topRef.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

// Formats a US phone number into (XXX) XXX-XXXX
// Removes +1 if present at start
// Removes leading 1 if remaining digits are 10
export const formatUSPhoneWithoutPlusOne = (number: string): string => {
  if (!number) return '';

  let cleanNumber = number;

  // Remove +1 if present at the start
  if (cleanNumber.startsWith('+1')) {
    cleanNumber = cleanNumber.slice(2);
  }

  // Remove all non-digits
  const digits = cleanNumber.replace(/\D/g, '');

  // Remove leading 1 if there are 11 digits total (1 + 10 digits)
  let finalDigits = digits;
  if (digits.length === 11 && digits.startsWith('1')) {
    finalDigits = digits.slice(1);
  }

  // Limit to 10 digits max
  const limited = finalDigits.slice(0, 10);

  // If exactly 10 digits, return formatted version
  if (limited.length === 10) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }

  // Apply progressive formatting for partial input
  const match = limited.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (!match) return limited;

  let result = '';
  if (match[1]) result = `(${match[1]}`;
  if (match[1] && match[1].length === 3) result += ') ';
  if (match[2]) result += match[2];
  if (match[2] && match[2].length === 3) result += '-';
  if (match[3]) result += match[3];

  return result;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Removes plus (+) and minus (-) signs from a string
 * @param str - The input string to remove signs from
 * @returns The string without plus and minus signs
 */
export const removePlusMinusSigns = (str: string): string => {
  return str.replace(/[+-]/g, '');
};

/**
 * Extracts date and time appointments from a date in US Eastern timezone
 *
 * @param dateArg - Date string or Date object
 * @returns Object with date/time appointments or null if invalid
 */
export const formatDateWithTime = (dateArg: string | Date | null) => {
  if (!dateArg) return null;

  try {
    const date = new Date(dateArg);
    if (isNaN(date.getTime())) return null;

    const US_TIMEZONE = 'America/New_York';

    const zonedDate = toZonedTime(date, US_TIMEZONE);

    const month = format(zonedDate, 'MMM');
    const day = zonedDate.getDate();
    const year = zonedDate.getFullYear();
    const hours = zonedDate.getHours();
    const minutes = zonedDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const dayName = format(zonedDate, 'EEEE');

    return { month, day, hours, year, minutes, ampm, displayHours, dayName };
  } catch {
    return null;
  }
};

export const MapPharmacyTypeInOrders = (data: Order[]) => {
  const pharmacies = store.getState().adminPharmacies.pharmacies;

  const pharmaciesMaps: Map<string, PublicPharmacy> = new Map(
    pharmacies.map((pharmacy: PublicPharmacy) => [pharmacy.name, pharmacy])
  );

  const mappedOrders = data.map((order) => {
    const pharmacy = pharmaciesMaps.get(order.pharmacyName ?? '');

    return {
      ...order,
      pharmacyType: pharmacy?.pharmacyType,
    };
  });

  return mappedOrders;
};

export const valueChangeVerifyHandler = ({ value, updatedValue }: { value: string; updatedValue: string }) => {
  return value?.trim() === updatedValue?.trim();
};

export const getAppointmentTypeColor = (type: string, products?: string[] | string) => {
  // Handle both array and single string for products
  const productsArray = Array.isArray(products) ? products : products ? [products] : [];

  if (productsArray.length > 0 && productsArray.some((product) => product?.toLowerCase().includes('nad'))) {
    return '#008000'; // green
  }

  switch (type?.toLowerCase().trim()?.split('-')?.join('')) {
    case 'weightloss':
      return '#3060FE'; // blue
    case 'initialvisit':
      return '#27ae60'; // green
    case 'refill':
      return '#e74c3c'; // red
    case 'subscription':
      return '#3060FE';
    default:
      return '#6c757d'; // grey
  }
};

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return `${diffInDays} days ago`;
}

export const renderOrderTag = (tag: string) => {
  const decoratedTag = tag?.replace(/ /g, '')?.toLowerCase() ?? '';
  switch (decoratedTag) {
    case 'refill':
      return 'tw-bg-orange-400 tw-text-white';
    case 'subscription':
      return 'tw-bg-primary tw-text-white';
    case 'renewal':
      return 'tw-bg-purple-500 tw-text-white';
    case 'reordersubscription':
      return 'tw-bg-green-500 tw-text-white';
    case 'reorderotp':
      return 'tw-bg-yellow-500 tw-text-white';
    case 'otp':
      return 'tw-bg-blue-500 tw-text-white';
    default:
      return 'tw-bg-secondary tw-text-white';
  }
};

/**
 * Determines if an order is eligible for triage action.
 *
 * Triage button should only be visible when an order has been assigned to a provider.
 * This is independent of order status - only provider assignment matters.
 *
 * @param order - The order object to check
 * @returns true if the order has an assigned provider, false otherwise
 *
 * @example
 * // New order without provider assignment
 * isOrderTriageEligible({ id: '1', status: 'Drafted' }) // returns false
 *
 * // Order assigned to provider
 * isOrderTriageEligible({
 *   id: '1',
 *   status: 'Assigned',
 *   assignedProvider: { id: 'p1', name: 'Dr. Smith', ... }
 * }) // returns true
 *
 * // Order reassigned to admin (no provider)
 * isOrderTriageEligible({
 *   id: '1',
 *   status: 'Pending',
 *   assignedProvider: undefined
 * }) // returns false
 */
export function canOrderTriage(order: Order | null | undefined): boolean {
  // Handle null/undefined order
  if (!order) {
    return false;
  }

  // Check if order has an assigned provider
  // assignedProvider should be an object with at least an id property
  const hasAssignedProvider =
    order.assignedProvider !== null &&
    order.assignedProvider !== undefined &&
    typeof order.assignedProvider === 'object' &&
    'id' in order.assignedProvider &&
    order.assignedProvider.id !== null &&
    order.assignedProvider.id !== undefined &&
    order.assignedProvider.id !== '';

  return hasAssignedProvider;
}

/**
 * Validates if a date string matches MM/dd/yyyy or MM-dd-yyyy format
 * @param dateString - The date string to validate
 * @returns true if the string matches the expected date format
 */
export function isValidDateFormat(dateString: string): boolean {
  if (!dateString) return false;
  // Check if it matches MM/dd/yyyy or MM-dd-yyyy format
  const datePattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const match = dateString.trim().match(datePattern);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Validate month (1-12), day (1-31), and year (reasonable range)
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Create date and verify it's valid and matches the input
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false; // Invalid date (e.g., Feb 30)
  }

  return true;
}

/**
 * Safely checks if a date string is valid and matches MM/dd/yyyy or MM-dd-yyyy format
 * @param dateString - The date string to validate
 * @returns true if the date string is valid and matches the expected format
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  // First check if it matches the expected format
  if (!isValidDateFormat(dateString)) return false;

  try {
    // Parse as MM/dd/yyyy format
    const parts = dateString.split(/[\/\-]/);
    if (parts.length !== 3) return false;

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && !isNaN(date.getTime())
    );
  } catch {
    return false;
  }
}

/**
 * Formats a Date object to MM/dd/yyyy string format
 * @param date - The Date object to format
 * @returns A formatted date string in MM/dd/yyyy format, or empty string if invalid
 */
export function formatDateToMMDDYYYY(date: Date | null): string {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Serializes order filters to URL query parameters
 * @param filters - The filter state from Redux sort slice
 * @returns URLSearchParams object with filter query params
 */
export function serializeOrderFilters(filters: {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  statusArray?: Array<{ value: string | number; label: string }>;
  pharmacyType?: string;
  selectedAgent?: { id: string; name: string } | null;
  startDate?: string | null;
  endDate?: string | null;
  searchColumn?: string | null;
  visitType?: 'video' | 'document' | 'both' | null;
  newEmrFilter?: 'newEmr' | 'telepath' | 'both' | null;
  productType?: 'weight_loss' | 'longevity' | null;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.sortField) {
    params.set('sortField', filters.sortField);
  }
  if (filters.sortOrder) {
    params.set('sortOrder', filters.sortOrder);
  }
  if (filters.statusArray && filters.statusArray.length > 0) {
    params.set('status', filters.statusArray.map((s) => s.value).join(','));
  }
  if (filters.pharmacyType) {
    params.set('pharmacyType', filters.pharmacyType);
  }
  if (filters.selectedAgent?.id) {
    params.set('agentId', filters.selectedAgent.id);
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }
  if (filters.searchColumn) {
    params.set('searchColumn', filters.searchColumn);
  }
  if (filters.visitType) {
    params.set('visitType', filters.visitType);
  }
  if (filters.newEmrFilter) {
    params.set('newEmrFilter', filters.newEmrFilter);
  }
  if (filters.productType) {
    params.set('productType', filters.productType);
  }

  return params;
}

/**
 * Deserializes order filters from URL query parameters
 * @param searchParams - URLSearchParams or string query params
 * @returns Filter object compatible with Redux sort slice
 */
export function deserializeOrderFilters(searchParams: URLSearchParams | string): {
  search?: string;
  sortField?: string;
  sortOrder?: string;
  statusArray?: Array<{ value: string; label: string }>;
  pharmacyType?: string;
  selectedAgentId?: string;
  startDate?: string | null;
  endDate?: string | null;
  searchColumn?: string | null;
  visitType?: 'video' | 'document' | 'both' | null;
  newEmrFilter?: 'newEmr' | 'telepath' | 'both' | null;
  productType?: 'weight_loss' | 'longevity' | null;
} {
  const params = typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
  const filters: ReturnType<typeof deserializeOrderFilters> = {};

  const search = params.get('search');
  if (search) filters.search = search;

  const sortField = params.get('sortField');
  if (sortField) filters.sortField = sortField;

  const sortOrder = params.get('sortOrder');
  if (sortOrder) filters.sortOrder = sortOrder;

  const status = params.get('status');
  if (status) {
    filters.statusArray = status.split(',').map((s) => ({ value: s.trim(), label: s.trim() }));
  }

  const pharmacyType = params.get('pharmacyType');
  if (pharmacyType) filters.pharmacyType = pharmacyType;

  const agentId = params.get('agentId');
  if (agentId) filters.selectedAgentId = agentId;

  const startDate = params.get('startDate');
  if (startDate) filters.startDate = startDate;

  const endDate = params.get('endDate');
  if (endDate) filters.endDate = endDate;

  const searchColumn = params.get('searchColumn');
  if (searchColumn) filters.searchColumn = searchColumn;

  const visitType = params.get('visitType');
  if (visitType && (visitType === 'video' || visitType === 'document' || visitType === 'both')) {
    filters.visitType = visitType;
  }

  const newEmrFilter = params.get('newEmrFilter');
  if (newEmrFilter && (newEmrFilter === 'newEmr' || newEmrFilter === 'telepath' || newEmrFilter === 'both')) {
    filters.newEmrFilter = newEmrFilter;
  }

  const productType = params.get('productType');
  if (productType && (productType === 'weight_loss' || productType === 'longevity')) {
    filters.productType = productType;
  }

  return filters;
}


/**
 * Replaces occurrences of "month <number>" in a string with a given replacement.
 *
 * @param input - The original string to search in.
 * @param replacement - The string to replace matches with.
 * @returns A new string with all matches replaced.
 */
export const replaceMonthPattern = (input: string, replacement: string): string => {
  // Regular expression to match "month" followed by a space and an integer
  const regex = /\bmonth\s+\d+\b/gi;
  return input.replace(regex, replacement);
};
