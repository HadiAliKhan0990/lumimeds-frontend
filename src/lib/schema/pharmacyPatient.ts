import { EnumRxType, PharmacyName, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { EnumdoctorGroup, EnumPrescriberType } from '@/store/slices/pharmaciesApiSlice';
import * as Yup from 'yup';
import { format, parse, isValid, startOfDay, isAfter } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { SCRIPT_RX_DIAGNOSIS_VALUES } from '@/constants/pharmacy';
import { parsePhoneNumber } from 'libphonenumber-js';

const minDateValidation = new Date(new Date().setFullYear(new Date().getFullYear() - 100));
const today = new Date();
const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

export const generalPhoneSchema = (msg?: string) =>
  Yup.string()
    .transform((value) => value.replace(/\D/g, ''))
    .test('valid-us-phone', msg || 'Please enter a valid US phone number', function (value) {
      if (!value) return false;
      // Parse and validate US phone number
      // The value is already transformed to digits only
      try {
        const phoneNumber = parsePhoneNumber(value, 'US');
        return phoneNumber ? phoneNumber.isValid() : false;
      } catch {
        return false;
      }
    });

export const integerValidator = (value: string) => {
  if (!value) return false;
  const trimmed = value.trim();

  // Check if it's only digits
  if (!/^\d+$/.test(trimmed)) {
    return false;
  }

  // Allow single digit with leading zero (01, 02, 03, ..., 09)
  // Reject multiple leading zeros or leading zeros with multi-digit numbers
  if (trimmed.startsWith('0')) {
    // Allow "0" by itself
    if (trimmed === '0') return true;
    // Allow "01" to "09" (single digit with leading zero)
    if (trimmed.length === 2 && /^0[1-9]$/.test(trimmed)) return true;
    // Reject all other cases with leading zeros
    return false;
  }

  // Convert to number and check range
  const num = parseInt(trimmed, 10);
  return num >= 0;
};

const US_TIMEZONE = 'America/New_York';

export const dateWrittenValidator = (value: string | undefined) => {
  if (!value) return false;

  // Check if the format is MM/DD/YYYY
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dateRegex.test(value)) {
    return false;
  }

  try {
    // Parse the date string as MM/DD/YYYY
    const parsedDate = parse(value, 'MM/dd/yyyy', new Date());

    // Check if the parsed date is valid
    if (!isValid(parsedDate)) {
      return false;
    }

    // Verify the parsed date matches the input (catches invalid dates like 02/30/2024)
    const formatted = format(parsedDate, 'MM/dd/yyyy');
    if (formatted !== value) {
      return false;
    }

    // Check if the date is not in the future (using US timezone)
    const todayInUS = toZonedTime(new Date(), US_TIMEZONE);
    const startOfTodayUS = startOfDay(todayInUS);
    const inputDateInUS = toZonedTime(parsedDate, US_TIMEZONE);

    if (isAfter(startOfDay(inputDateInUS), startOfTodayUS)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const zipCodeLengthSchema: Record<PharmacyName, number> = {
  axtell: 4,
  'script rx': 4,
  olympia: 5,
  optiorx: 5,
  'drug crafters': 4,
  'premier rx': 4,
  cre8: 4,
  beaker: 4,
  valiant: 4,
  boothwyn: 5,
  'first choice': 4,
};

export const zipCodeValidator = ({
  pharmacyName,
  schema,
}: {
  pharmacyName: PharmacyName;
  schema: Yup.StringSchema;
}) => {
  const minLength = zipCodeLengthSchema?.[pharmacyName] ?? 5;

  return schema
    .min(minLength, `ZIP Code must be at least ${minLength} characters`)
    .max(10, 'ZIP Code must be at most 10 characters')
    .required('ZIP Code is required');
};

const commonSchema = {
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  dob: Yup.date()
    .required('DOB is required')
    .min(minDateValidation, 'Date cannot be before January 1, 1930')
    .max(maxDob, 'You must be at least 18 years old'),
  gender: Yup.mixed<'M' | 'F'>().oneOf(['M', 'F']),
  patientPhone: generalPhoneSchema(),
  medications: Yup.string().required('Medications are required'),
  allergies: Yup.string().required('Allergies is required'),

  // Billing Address
  patientBillingStreet: Yup.string().required('Street Address is required'),
  patientBillingStreet2: Yup.string(),
  patientBillingCity: Yup.string().required('City is required'),
  patientBillingState: Yup.string().required('State is required'),
  patientBillingZip: Yup.string().when('selectedPharmacyName', ([selectedPharmacyName], schema) =>
    zipCodeValidator({ pharmacyName: selectedPharmacyName, schema })
  ),

  // Shipping Address
  patientShippingStreet: Yup.string().required('Street Address is required'),
  patientShippingStreet2: Yup.string(),
  patientShippingCity: Yup.string().required('City is required'),
  patientShippingState: Yup.string().required('State is required'),
  patientShippingZip: Yup.string().when('selectedPharmacyName', ([selectedPharmacyName], schema) =>
    zipCodeValidator({ pharmacyName: selectedPharmacyName, schema })
  ),

  // Doctor Information
  prescriber: Yup.string().required('Prescriber is required'),
  doctorFirstName: Yup.string().required('Doctor first name is required'),
  doctorLastName: Yup.string().required('Doctor last name is required'),
  doctorEmail: Yup.string().email('Invalid email address').required('Email is required'),

  doctorAddress: Yup.string().required('Doctor address is required'),
  doctorDea: Yup.string(),
  doctorNpi: Yup.number(),
  doctorState: Yup.string(),
  doctorStateLicense: Yup.string().optional().nullable(),
};

const axtellAndDrugsCraftersSchemaCommonSchema = {
  drugName: Yup.string().required('Drug name is required'),
  rxType: Yup.mixed<EnumRxType>().oneOf(Object.values(EnumRxType)).required('Rx type is required'),
  drugStrength: Yup.string().required('Drug strength is required'),
  drugForm: Yup.string().required('Drug form is required'),
  lfProductId: Yup.number().required('LF product ID is required'),
  quantity: Yup.string().when('selectedPharmacyName', ([selectedPharmacyName], schema) => {
    return selectedPharmacyName === 'first choice'
      ? schema.required('Quantity is required')
      : schema.required('Quantity is required');
  }),
  quantityUnits: Yup.string().required('Quantity units is required'),
  directions: Yup.string().required('Notes are required'),
  dateWritten: Yup.string()
    .required('Date written is required')
    .test(
      'valid-date',
      'Date must be in MM/DD/YYYY format, be a valid date, and not in the future',
      dateWrittenValidator
    ),
  daysSupply: Yup.number().required('Days supply is required'),
  refills: Yup.string()
    .required('Refills is required')
    .test('valid-integer', 'Refills must be a valid integer number', integerValidator),
  rxNumber: Yup.string().when('rxType', ([rxType], schema) => {
    return rxType === EnumRxType.REFILL
      ? schema.required('Rx number is required')
      : schema.notRequired();
  }),
};

export const olympiaValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  // Prescription Information
  drugName: Yup.string().required('Drug name is required'),
  dosage: Yup.number().min(0, 'Must be at least 0').optional(),
  instructions: Yup.string().required('Instructions are required'),
  notes: Yup.string().optional(),
  refills: Yup.number()
    .typeError('Refills must be a number')
    .max(99, 'Refills must be at most 2 digits')
    .required('Refills is required'),

  qty: Yup.number()
    .typeError('Quantity must be a number')
    .min(1, 'Quantity must be greater than or equal to 1')
    .max(99, 'Quantity must be at most 2 digits')
    .required('Quantity is required'),

  lastVisit: Yup.date()
    .required('Last visit is required')
    .min(minDateValidation, 'Date cannot be before January 1, 1930'),
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
});

export const axtellValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  // Prescription Information
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
});

export const scriptRxValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  // Prescription Information
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  diagnosis: Yup.string()
    .oneOf([...SCRIPT_RX_DIAGNOSIS_VALUES], 'Invalid diagnosis code')
    .required('Diagnosis is required'),
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
});

export const drugsCraftersValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  vials: Yup.string().required('Vials are required'),
  instructions: Yup.string().required('Notes are requited'),
  directions: Yup.string().required('Directions are required'),
  patientPhone: generalPhoneSchema(),
});

export const premierRxValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  vials: Yup.string().optional(),
  instructions: Yup.string().required('Notes are requited'),
  directions: Yup.string().required('Directions are required'),
  patientPhone: generalPhoneSchema(),
  vialSize: Yup.string().optional(),
  totalMg: Yup.string().optional(),
  quantity: Yup.string().required('Vial Size (1st) is required'),
});

export const cre8ValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  vials: Yup.number()
    .typeError('Vials must be a number')
    .min(0, 'Vials cannot be negative')
    .required('Vials are required'),
  instructions: Yup.string().required('Notes are requited'),
  directions: Yup.string().required('Directions are required'),
  patientPhone: generalPhoneSchema(),
});

export const optiroxValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  dateWritten: Yup.string()
    .required('Date written is required')
    .test(
      'valid-date',
      'Date must be in MM/DD/YYYY format, be a valid date, and not in the future',
      dateWrittenValidator
    ),
  drugName: Yup.string().required('Drug name is required'),
  quantity: Yup.string()
    .required('Quantity is required'),

  refills: Yup.string()
    .required('Refills is required')
    .test('valid-integer', 'Refills must be a valid integer number', integerValidator),
  directions: Yup.string().required('Directions are required'),
  doctorType: Yup.string().required('Prescriber type is required'),
  daysSupply: Yup.number().optional(),
});

export const valiantValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  // Prescription Information
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
});

export const beakerValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  // Prescription Information
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
});

export const boothwynValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  drugName: Yup.string().required('Drug name is required'),
  lfProductId: Yup.number().required('LF product ID is required'),
  quantity: Yup.string()
    .required('Quantity is required'),
  quantityUnits: Yup.string().required('Quantity units is required'),
  directions: Yup.string().required('Directions are required'),
  instructions: Yup.string().required('Notes are required'),
  daysSupply: Yup.number().required('Days supply is required'),
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
  orderType: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Order type is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
  drugStrength: Yup.string().required('Drug strength is required'),
  patientPhone: generalPhoneSchema(),
});

export const firstChoiceValidationSchema = Yup.object<PatientFormValues>({
  ...commonSchema,
  ...axtellAndDrugsCraftersSchemaCommonSchema,
  shippingService: Yup.object().shape({
    id: Yup.mixed<number | string>().required('Shipping method is required'),
    name: Yup.string().required('Shipping method is required'),
  }),
  instructions: Yup.string().required('Notes are required'),
  directions: Yup.string().required('Directions are required'),
});

export interface AxtellPatientFormValues {
  rxType?: EnumRxType | null;
  drugStrength?: string;
  drugForm?: string;
  lfProductId?: number;
  quantity?: number | string;
  quantityUnits?: string;
  directions?: string;
  dateWritten?: string;
  daysSupply?: number;
  rxNumber?: string | number;
  diagnosis?: string;
}

export interface commonPharmacyFormValues {
  drugName: string;
  instructions?: string;
  refills?: number;
  orderType?: { id: number | string; name: string };
  route?: 'im' | 'sq'; // Route for NAD drugs (Intramuscular or Subcutaneous)
  startingDose?: number; // Starting dose for NAD drugs (mg value)
}

export interface OlympiaPatientFormValues {
  dosage?: number;
  notes?: string;
  qty?: number;
}

export interface DrugsCraftersPatientFormValues {
  vials?: DrugCrafterQuantitySize;
}

export interface PremierRxPatientFormValues {
  vials?: PremierRxQuantitySize;
  vialSize?: string;
  totalMg?: string;
  totalMl?: string;
  quantity2?: number | string;
  vials2?: PremierRxQuantitySize;
}

export type OptiroxPatientFormValues = commonPharmacyFormValues;

export type PharmacyProductFormValues =
  | AxtellPatientFormValues
  | OlympiaPatientFormValues
  | DrugsCraftersPatientFormValues
  | PremierRxPatientFormValues
  | OptiroxPatientFormValues;

export enum DrugCrafterQuantitySize {
  TWO_ML = '2',
  FOUR_ML = '4',
  SIX_ML = '6',
  EIGHT_ML = '8',
  TEN_ML = '10',
  TWELVE_ML = '12',
  FOURTEEN_ML = '14',
  SIXTEEN_ML = '16',
  EIGHTEEN_ML = '18',
  TWENTY_ML = '20',
  TWENTY_TWO_ML = '22',
  TWENTY_FOUR_ML = '24',
  TWENTY_SIX_ML = '26',
}

export enum PremierRxQuantitySize {
  TWO_ML = '2',
  FOUR_ML = '4',
  SIX_ML = '6',
  EIGHT_ML = '8',
  TEN_ML = '10',
  TWELVE_ML = '12',
  FOURTEEN_ML = '14',
  SIXTEEN_ML = '16',
  EIGHTEEN_ML = '18',
  TWENTY_ML = '20',
  TWENTY_TWO_ML = '22',
  TWENTY_FOUR_ML = '24',
  TWENTY_SIX_ML = '26',
}

export type PatientFormValues = {
  doctorGroup?: EnumdoctorGroup;
  doctorSpi?: string;
  firstName: string;
  lastName: string;
  email: string;
  patientPhone: string;
  dob: Date | null;
  gender: 'M' | 'F';

  allergies: string;
  medications: string;

  patientShippingStreet: string;
  patientShippingStreet2: string;
  patientShippingCity: string;
  patientShippingState: string;
  patientShippingZip: string;

  patientBillingStreet: string;
  patientBillingStreet2: string;
  patientBillingCity: string;
  patientBillingState: string;
  patientBillingZip: string;
  selectedPharmacyName: PharmacyName | null;

  prescriber: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorAddress: string;
  doctorState: string;
  doctorDea?: string;
  doctorNpi?: string;
  doctorStateLicense: string | null;
  doctorType?: EnumPrescriberType;
  drugName: string;
  dosage?: number;
  instructions: string;
  notes?: string;
  qty?: number;
  refills: number;
  lastVisit: Date | null;
  doctorZipCode?: number;

  pdfFile: Blob | null;

  selectedProduct?: PharmacyProduct;
  shippingService: { id: number | string; name: string } | null;
} & AxtellPatientFormValues &
  OlympiaPatientFormValues &
  commonPharmacyFormValues &
  DrugsCraftersPatientFormValues &
  PremierRxPatientFormValues &
  Cre8PatientFormValues &
  OptiroxPatientFormValues;

export interface Cre8PatientFormValues {
  vials?: number | string;
  quantity2?: number | string;
  vials2?: number | string;
  quantity3?: number | string;
  vials3?: number | string;
  totalMg?: string;
  prescriptionId?: string;
}
