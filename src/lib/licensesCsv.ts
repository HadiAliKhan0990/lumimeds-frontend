import { LicenseQuestionAnswer } from '@/services/providerIntake/types';
import * as XLSX from 'xlsx';

/**
 * Validates license number is not empty
 * Backend will handle format validation
 */
function validateLicenseNumber(licenseNumber: string): boolean {
  return licenseNumber.trim().length > 0;
}

/**
 * Normalizes date string to MM-DD-YYYY format (adds leading zeros if needed)
 * Accepts formats like: M-D-YYYY, MM-D-YYYY, M-DD-YYYY, MM-DD-YYYY
 */
function normalizeDateFormat(dateStr: string): string {
  // Handle edge cases
  if (!dateStr || typeof dateStr !== 'string') {
    return dateStr;
  }

  const trimmed = dateStr.trim();
  // Match dates with 1-2 digits for month, 1-2 digits for day, and 4 digits for year
  const dateMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!dateMatch) {
    // Return as-is if it doesn't match the expected pattern (will be caught by regex validation)
    return trimmed;
  }

  const [, month, day, year] = dateMatch;
  const normalizedMonth = month.padStart(2, '0');
  const normalizedDay = day.padStart(2, '0');

  return `${normalizedMonth}-${normalizedDay}-${year}`;
}

/**
 * Parses CSV text into license records
 */
export function parseLicenseCsv(text: string): LicenseQuestionAnswer[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error('The CSV file is empty. Please add license data.');
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const stateIdx = header.indexOf('state');
  const licenseIdx = header.indexOf('license');
  const expirationIdx = header.indexOf('expiration');

  if (stateIdx === -1 || licenseIdx === -1 || expirationIdx === -1) {
    throw new Error('File must contain headers');
  }

  const records: LicenseQuestionAnswer[] = [];
  const seenStates = new Set<string>();

  // Accept dates with or without leading zeros: M-D-YYYY, MM-D-YYYY, M-DD-YYYY, MM-DD-YYYY
  const dateFormatRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < header.length) continue;

    const state = (cols[stateIdx] || '').trim();
    const licenseNumber = (cols[licenseIdx] || '').trim();
    const expirationRaw = (cols[expirationIdx] || '').trim();

    if (!state && !licenseNumber && !expirationRaw) continue;

    if (!state) throw new Error(`State is required.`);
    if (!licenseNumber) throw new Error(`License number is required.`);

    if (!validateLicenseNumber(licenseNumber)) {
      throw new Error('License number is required.');
    }

    // Check for duplicate states within the CSV (case-insensitive)
    // Store original trimmed state, but check duplicates case-insensitively
    const stateLower = state.toLowerCase();
    if (seenStates.has(stateLower)) {
      throw new Error('Duplicate state(s) found. Each state can have only one license.');
    }
    seenStates.add(stateLower);

    let expiryDate: Date | null = null;
    if (expirationRaw) {
      // Try to parse date in MM-DD-YYYY format (with or without leading zeros)
      // If it matches the format, normalize and parse it
      // Backend will handle validation if format is different
      if (dateFormatRegex.test(expirationRaw)) {
        try {
          // Normalize date format (add leading zeros if needed)
          const normalizedDate = normalizeDateFormat(expirationRaw);
          const [month, day, year] = normalizedDate.split('-').map(Number);
          expiryDate = new Date(year, month - 1, day);

          // Only validate if date is invalid
          if (Number.isNaN(expiryDate.getTime())) {
            expiryDate = null; // Let backend handle invalid dates
          }
        } catch {
          expiryDate = null; // Let backend handle parsing errors
        }
      }
      // If date doesn't match MM-DD-YYYY format, leave as null and let backend handle it
    }

    records.push({ state, licenseNumber, expiryDate });
  }

  if (records.length === 0) {
    throw new Error('No valid license records found. Please check your CSV data.');
  }

  return records;
}

/**
 * Parses Excel file into license records
 */
export function parseLicenseExcel(file: ArrayBuffer): LicenseQuestionAnswer[] {
  const workbook = XLSX.read(file, { type: 'array', cellDates: false });

  if (workbook.SheetNames.length === 0) {
    throw new Error('The Excel file is empty. Please add license data.');
  }

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

  if (jsonData.length === 0) {
    throw new Error('The Excel file is empty. Please add license data.');
  }

  // Check for headers
  const header = (jsonData[0] as string[]).map((h: string) => (h || '').toString().trim().toLowerCase());

  const stateIdx = header.indexOf('state');
  const licenseIdx = header.indexOf('license');
  const expirationIdx = header.indexOf('expiration');

  if (stateIdx === -1 || licenseIdx === -1 || expirationIdx === -1) {
    throw new Error('File must contain headers');
  }

  const records: LicenseQuestionAnswer[] = [];
  const seenStates = new Set<string>();

  // Accept dates with or without leading zeros: M-D-YYYY, MM-D-YYYY, M-DD-YYYY, MM-DD-YYYY
  const dateFormatRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as string[];
    if (!row || row.length === 0) continue;

    const state = (row[stateIdx] || '').toString().trim();
    const licenseNumber = (row[licenseIdx] || '').toString().trim();
    let expirationRaw = (row[expirationIdx] || '').toString().trim();

    // Skip empty rows
    if (!state && !licenseNumber && !expirationRaw) continue;

    if (!state) throw new Error(`State is required.`);
    if (!licenseNumber) throw new Error(`License number is required.`);

    if (/^\d+(\.\d+)?$/.test(expirationRaw)) {
      const serialNumber = Number.parseFloat(expirationRaw);
      // Excel date serial number conversion
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + serialNumber * 86400000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      expirationRaw = `${month}-${day}-${year}`;
    }

    // Validate license number format (4-10 alphanumeric characters)
    if (!validateLicenseNumber(licenseNumber)) {
      throw new Error('License number is required.');
    }

    // Check for duplicate states within the Excel file (case-insensitive)
    // Store original trimmed state, but check duplicates case-insensitively
    const stateLower = state.toLowerCase();
    if (seenStates.has(stateLower)) {
      throw new Error('Duplicate state(s) found. Each state can have only one license.');
    }
    seenStates.add(stateLower);

    let expiryDate: Date | null = null;
    if (expirationRaw) {
      // Try to parse date in MM-DD-YYYY format (with or without leading zeros)
      // If it matches the format, normalize and parse it
      // Backend will handle validation if format is different
      if (dateFormatRegex.test(expirationRaw)) {
        try {
          // Normalize date format (add leading zeros if needed)
          const normalizedDate = normalizeDateFormat(expirationRaw);
          const [month, day, year] = normalizedDate.split('-').map(Number);
          expiryDate = new Date(year, month - 1, day);

          // Only validate if date is invalid
          if (Number.isNaN(expiryDate.getTime())) {
            expiryDate = null; // Let backend handle invalid dates
          }
        } catch {
          expiryDate = null; // Let backend handle parsing errors
        }
      }
      // If date doesn't match MM-DD-YYYY format, leave as null and let backend handle it
    }

    records.push({ state, licenseNumber, expiryDate });
  }

  if (records.length === 0) {
    throw new Error('No valid license records found. Please check your Excel data.');
  }

  return records;
}

export function mergeLicenses(
  existing: LicenseQuestionAnswer[],
  incoming: LicenseQuestionAnswer[],
  shouldAppend: boolean
): LicenseQuestionAnswer[] {
  // Handle edge cases
  const validExisting = existing || [];
  const validIncoming = incoming || [];

  // Check for duplicate states in incoming data vs existing data when appending (case-insensitive)
  if (shouldAppend) {
    const existingStatesLower = new Set(validExisting.map((license) => (license.state || '').toLowerCase().trim()));
    const duplicateStates = validIncoming.filter((license) => {
      const stateLower = (license.state || '').toLowerCase().trim();
      return stateLower && existingStatesLower.has(stateLower);
    });

    if (duplicateStates.length > 0) {
      throw new Error('Duplicate state(s) found. Each state can have only one license.');
    }
  }

  const combined = shouldAppend ? [...validIncoming, ...validExisting] : [...validIncoming];
  const seen = new Set<string>();
  const deduped: LicenseQuestionAnswer[] = [];
  for (const item of combined) {
    // Use case-insensitive key for state comparison
    const stateKey = (item.state || '').toLowerCase().trim();
    const key = `${stateKey}|${item.licenseNumber || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  return deduped;
}
