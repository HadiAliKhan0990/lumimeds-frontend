import { OptionValue } from '@/lib/types';
import { GroupBase, OptionsOrGroups } from 'react-select';

// DEPRECATED: Use useStates() hook from @/hooks/useStates instead
// Keeping for backward compatibility during migration
import STATES from '@/data/states.json';

export const ROUTES = {
  HOME: '/',
  FAQS: '/faqs',
  MEMBERSHIP_TERMS: '/memberterms',
  TERMS_OF_USE: '/termsofuse',
  PRIVACY_POLICY: '/privacypolicy',
  CAREER_JOBS: '/job',
  CARE_PORTAL: '/care-portal',

  // Admin Routes

  ADMIN_USERS: '/admin/users',
  ADMIN_ADD_PATIENTS: '/admin/users/patients/add',
  ADMIN_FORMS_SURVEYS: '/admin/forms',
  ADMIN_FORM_BUILDER: '/admin/forms/builder',
  ADMIN_FORM_SUBMISSIONS: '/admin/forms/submissions',
  ADMIN_ARCHIVED_PATIENTS: '/admin/users/patients/archived',
  ADMIN_ARCHIVED_PRODUCTS: '/admin/medications/archived',
  PROVIDER_UPDATE_PASSWORD: '/provider/update-password',
  ADMIN_LOGIN: '/admin/login',
  PROVIDER_LOGIN: '/provider/login',
  ADMIN_HOME: '/admin/dashboard',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_APPOINTMENTS: '/admin/appointments',
  ADMIN_LEGEND: '/admin/legend',
  ADMIN_ACCOUNT: '/admin/account',
  ADMIN_VIDEO_CALLS: '/admin/video-calls',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_MEDICATIONS: '/admin/medications',
  ADMIN_SALES: '/admin/sales',
  ADMIN_FORGOT_PASSWORD: '/admin/forgot-password',
  ADMIN_PHARMACY: '/admin/pharmacy',
  ADMIN_PHARMACY_FORWARD_PRESCRIPTION: '/admin/pharmacy/forward-prescription',
  ADMIN_DOSESPOT: '/admin/dosespot',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_FIRST_LOGIN_UPDATE: '/admin/update-password',
  ADMIN_MESSAGES_TEMPLATES: '/admin/messages/templates',

  // Provider Routes

  PROVIDER_HOME: '/provider',
  PROVIDER_VISIT: '/provider/visits',
  PROVIDER_MESSAGES: '/provider/messages',
  PROVIDER_PRESCRIPTION: '/provider/prescription',
  PROVIDER_NOTIFICATIONS: '/provider/notifications',
  PROVIDER_PROFILE: '/provider/profile',
  PROVIDER_FIRST_LOGIN_UPDATE: '/provider/update-password',
  PROVIDER_FORGOT_PASSWORD: '/provider/forgot-password',
  PROVIDER_PENDING_ENCOUNTERS: '/provider/pending-encounters',
  PROVIDER_APPOINTMENTS: '/provider/appointments',
  PROVIDER_APPROVED: '/provider/approved',
  PROVIDER_VIEW_ALL_PATIENTS: '/provider/patients',
  PROVIDER_SURVEY: '/provider/survey',

  // Patient Routes

  PATIENT_LOGIN: '/patient/login',
  PATIENT_FIRST_LOGIN_UPDATE: '/patient/update-password',
  PATIENT_HOME: '/patient',
  PATIENT_ORDERS: '/patient/orders',
  PATIENT_MESSAGES: '/patient/messages',
  PATIENT_FORMS: '/patient/forms',
  PATIENT_ACCOUNT: '/patient/account',
  PATIENT_CARE_PORTAL: '/patient/care-portal',
  PATIENT_FORGOT_PASSWORD: '/patient/forgot-password',
  PATIENT_SURVEY: '/patient/survey',
  PATIENT_REFILL: '/patient/refill',
  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_SURVEYS: '/patient/forms',
  PATIENT_PAYMENTS_SUBSCRIPTIONS: '/patient/payments-subscriptions',
  PATIENT_SUPPORT: '/patient/support',

  // General Routes

  RESET_PASSWORD: '/auth/reset-password',
  IMPERSONATE: '/impersonate',
  GENERAL_SURVEY: '/general-survey',
  REFILL_SURVEY: '/refill-survey',
  PRODUCT_SURVEY: '/product-survey',
  PATIENT_INTAKE: '/products/survey/weight_loss',
  LONGEVITY_PATIENT_INTAKE: '/products/survey/longevity',
  INTAKE_FORM: '/intake-form',
  // AFFILIATE_REGISTERATION: '/affiliate-registration', // Commented out - not in use
  PRODUCT_SUMMARY: '/products/summary',
  PRODUCT_SUMMARY_GOOGLE_MERCHANT: '/ad/product-summary',
  AD_503BONTRACK: '/ad/503bontrack',

  // Checkout Routes

  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
};

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  TOKEN_REFRESH: '/auth/refresh',
  SESSION: '/auth/session',
};

export const NON_SALE_PAGES = [
  ROUTES.PATIENT_LOGIN,
  ROUTES.PATIENT_FORGOT_PASSWORD,
  ROUTES.PROVIDER_LOGIN,
  ROUTES.PROVIDER_FORGOT_PASSWORD,
  ROUTES.ADMIN_LOGIN,
  ROUTES.ADMIN_FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.IMPERSONATE,
];

export const JOB_JOTFORM_SCRIPT_SRC = 'https://form.jotform.com/jsform/241684502634052';

export const JOB_JOTFORM_TITLE = 'Remote Application';

export const PROCESS_APIS = ['telegra', 'telepath', 'lumimeds'];

/**
 * ORDER STATUSES
 *
 * Color Coding (defined in styles/variables.scss and styles/badge.scss):
 * - Success/Positive (Green): Approved, Processing, Shipped, Out_for_Delivery, Delivered, Assigned
 * - Warning/Pending (Yellow): Pending, On_Hold
 * - Info (Blue): Drafted, Confirmed
 * - Error/Danger (Red): Failed, Cancelled, Error
 * - Neutral (Gray): Returned, Refunded
 */

export const ORDER_STATUSES_ADMIN = [
  { label: 'Paid', value: 'Pending' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Refunded', value: 'Refunded' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Submitted', value: 'Sent_To_Pharmacy' },
  { label: 'Not Paid', value: 'Drafted' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Declined', value: 'Declined' },
  { label: 'Reverted', value: 'Reverted' },
  { label: 'Rolled Back', value: 'Rolled_Back' },
  { label: 'On Hold', value: 'On_Hold' },
  { label: 'Needs VV', value: 'Needs_VV' },
  { label: 'Provider Issue', value: 'Provider_Issue' },
  { label: 'Pending Medical Intake', value: 'Pending_Medical_Intake' },
  { label: 'Refill', value: 'Refill' },
  { label: 'Error', value: 'Error' },
  { label: 'Requires Pending Intake Call', value: 'Requires_Pending_Intake_Call' },
  { label: 'Pending Unresponsive', value: 'Pending_Unresponsive' },
];

export const ORDER_STATUSES_PATIENT = [
  { label: 'Paid', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Refunded', value: 'Refunded' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Submitted', value: 'Sent_To_Pharmacy' },
  { label: 'Not Paid', value: 'Drafted' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'Approved', value: 'Prescription_Approved' },
  { label: 'Declined', value: 'Declined' },
  { label: 'Action Required', value: 'Action_Required' },
  { label: 'On Hold', value: 'On_Hold' },
  // { label: 'Needs VV', value: 'Needs_VV' },
  // { label: 'Provider Issue', value: 'Provider_Issue' },
  // { label: 'Intake Missing', value: 'Intake_Missing' },
  { label: 'Pending Medical Intake', value: 'Pending_Medical_Intake' },
  { label: 'Refill', value: 'Refill' },
  { label: 'Error', value: 'Error' },
  { label: 'Video Visit Needed', value: 'Video_Visit_Needed' },
];

export const ORDER_STATUSES = ORDER_STATUSES_ADMIN.map((status) => status.value);

export const ORDER_STATUSES_TABLE = ORDER_STATUSES_ADMIN.filter(
  (status) => !['Needs_VV', 'Provider_Issue', 'Intake_Missing'].includes(status.value)
).map((status) => status.value);

export const PATIENT_STATUSES = [
  'INVITED',
  'ACCEPTED',
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'BLOCKED',
  'APPROVED',
  'REJECTED',
  'PENDING_SUBMISSION',
  'UNRESPONSIVE',
  'DISPUTED',
];

/**
 * PROVIDER STATUSES
 *
 * Color Coding (defined in styles/variables.scss and styles/badge.scss):
 * - Success (Green): accepted, active, approved
 * - Info (Blue): invited
 * - Warning (Yellow): pending
 * - Neutral (Gray): inactive
 * - Error (Red): rejected, blocked
 */
export const PROVIDER_STATUSES = [
  'accepted',
  'invited',
  'active',
  'approved',
  'blocked',
  'pending',
  'inactive',
  'rejected',
  'suspended',
];

export const AGENT_STATUSES = ['active', 'inactive'];

export const MEDICATION_FILTERS = ['Created At', 'Description', 'Pharmacy Name', 'Product Name'];

export const MEDICATION_PRODUCTS_FILTERS = ['Active', 'Inactive'];

export const SUBSCRIPTION_FILTERS = ['orderCount', 'endDate', 'startDate', 'Customer'];

export const SUBSCRIPTION_STATUS_FILTERS = ['active', 'paused', 'canceled', 'past_due', 'cancel_scheduled'];

export const INVOICE_FILTERS = ['Paid', 'Past_Due'];

/**
 * REFILL STATUSES
 *
 * Color Coding (defined in styles/variables.scss and styles/badge.scss):
 * - 'open': Warning/Pending (Yellow) - Indicates a new refill request
 * - 'on_hold': Warning (Light Yellow) - Request temporarily paused
 * - 'approved': Success (Green) - Request has been approved
 * - 'rejected': Error (Red) - Request has been rejected
 */
export const REFILL_STATUSES = ['open', 'on_hold', 'approved', 'rejected'];

export const INPUT_TYPES = ['text', 'number', 'email', 'date', 'time', 'phone'];

export const MEDICAL_CONDITIONS = [
  'None',
  'Type 2 Diabetes or Insulin Resistance',
  'High Blood Pressure',
  'Thyroid issues',
  'PCOS (Polycystic Ovary Syndrome)',
  'Heart conditions',
  'Liver or Kidney disease',
  'Eating disorders',
  // 'Other',
];

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'lumimeds_admin_accessToken',
  REFRESH_TOKEN: 'lumimeds_admin_refreshToken',
};

export const genderAbbreviation = { male: 'M', female: 'F' };
export const genderFullForm = { M: 'Male', F: 'Female' };
export const genderFullFormRender = { male: 'Male', female: 'Female' };

export const PHARMACIES_ROUTES = {
  olympia: 'pharmacy/olympia/prescriptions',
  axtell: 'pharmacy/lifefile/create/prescriptions',
  'script rx': 'pharmacy/lifefile/create/prescriptions',
  'drug crafters': 'pharmacy/drugcrafter/prescriptions',
  'premier rx': 'pharmacy/premierrx/prescriptions',
  cre8: 'pharmacy/cre8/prescriptions',
  optiorx: 'pharmacy/optiorx/create-prescriptions',
  valiant: 'pharmacy/lifefile/create/prescriptions',
  beaker: 'pharmacy/lifefile/create/prescriptions',
  boothwyn: 'pharmacy/boothwyn/prescriptions',
  'first choice': 'pharmacy/lifefile/create/prescriptions',
};

export const PROVIDER_DEFAULT_CITY = 'LAS_VEGAS';

// Source parameter constants
export const GOOGLE_MERCHANT_SOURCE = 'google-merchant';

// Whitelisted ad routes that are allowed on the try subdomain
// Add new routes here to automatically allow them on the try subdomain
export const TRY_SUBDOMAIN_WHITELISTED_ROUTES = ['ad/starter-pack'];

/**
 * Gets the try subdomain from environment variable with fallback to 'try'
 * @returns The try subdomain value from NEXT_PUBLIC_TRY_SUBDOMAIN or 'try' as fallback
 */
export const getTrySubdomain = (): string => {
  return process.env.NEXT_PUBLIC_TRY_SUBDOMAIN || 'try';
};

/**
 * @deprecated Use useStates() hook from @/hooks/useStates instead
 * This will be removed after migration to dynamic states
 */
export const STATE_OPTIONS: OptionsOrGroups<OptionValue, GroupBase<OptionValue>> = STATES.map((title) => ({
  label: title,
  value: title,
}));

/**
 * Subscription Upgrade Constants
 * Used for displaying upgrade discount information in modals and banners
 */
export const SUBSCRIPTION_UPGRADE = {
  PERCENTAGE: '25%',
  PRICE: '99',
};
