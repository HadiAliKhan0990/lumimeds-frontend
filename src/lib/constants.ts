export const GENERIC_PAYMENT_ERROR_MESSAGE = 'Your payment method has been declined.';
const CARD_DECLINE_ERROR_MESSAGE = 'Your card was declined. Please use a different card or contact your bank.';
const INSUFFICIENT_FUNDS_ERROR_MESSAGE = 'Insufficient funds. Please use another payment method.';
const EXPIRED_CARD_ERROR_MESSAGE = 'Your card has expired. Please use a valid card.';
const INVALID_CARD_NUMBER_ERROR_MESSAGE = 'The card number is invalid. Please check and try again.';
const INVALID_CVV_ERROR_MESSAGE = 'The security code (CVV) is invalid. Please check and try again.';
const FRAUDULENT_CARD_ERROR_MESSAGE = 'Your card was flagged as fraudulent. Please use another card.';
const SUSPICIOUS_CARD_ERROR_MESSAGE = 'Your card was flagged as suspicious. Please contact your bank.';
const LOST_CARD_ERROR_MESSAGE = 'This card has been reported as lost. Please use a different card.';
const THREE_D_SECURE_AUTHENTICATION_FAILED_ERROR_MESSAGE = '3D Secure authentication failed. Please try again.';
const PAYMENT_AUTHENTICATION_FAILED_ERROR_MESSAGE = 'Payment authentication failed. Please try again.';
const PAYMENT_PROCESSING_ERROR_MESSAGE = 'A payment processing error occurred. Please try again.';
const PAYMENT_REQUEST_TIMED_OUT_ERROR_MESSAGE = 'The payment request timed out. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Network error. Please check your connection and try again.';
const PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE = 'Your payment session expired. Please refresh and try again.';
const INVALID_EXPIRY_DATE_ERROR_MESSAGE = 'The expiration date is invalid. Please check and try again.';
const CARD_LIMIT_EXCEEDED_ERROR_MESSAGE = 'Card limit exceeded. Please use a different card or contact your bank.';
const AVS_MISMATCH_ERROR_MESSAGE = 'The billing address does not match your card. Please verify your address and try again.';
const ACCOUNT_CLOSED_ERROR_MESSAGE = 'This card account has been closed. Please use a different card.';
const CARD_BLOCKED_ERROR_MESSAGE = 'Your card has been blocked. Please contact your bank or use a different card.';
const CARD_TYPE_NOT_SUPPORTED_ERROR_MESSAGE = 'Your card does not support this type of purchase. Please use a different card.';
const INVALID_ACCOUNT_ERROR_MESSAGE = 'Invalid account. Please check your payment details and try again.';
const ZIPCODE_REQUIRED_ERROR_MESSAGE = 'Postal code is required. Please enter your billing address postal code and try again.';
const PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE = 'Payment method error. Please add a new payment method and try again.';
const KLARNA_DECLINED_ERROR_MESSAGE = 'Your payment was declined by Klarna. Please try a different payment method.';
const KLARNA_EXPIRED_ERROR_MESSAGE = 'Your Klarna checkout session expired. Please try again.';
const KLARNA_CANCELLED_ERROR_MESSAGE = 'Checkout was cancelled. Please try again when ready.';
const STRIPE_LINK_CLOSED_ERROR_MESSAGE = 'Your payment session was closed. Please try again.';
const RECURRING_PAYMENT_STOPPED_ERROR_MESSAGE = 'Recurring payments have been stopped for this card. Please update your payment method.';
const MERCHANT_SERVICE_ERROR_MESSAGE = 'A payment processing error occurred. Please try again or contact support.';
const REPEATED_ATTEMPTS_ERROR_MESSAGE = 'Too many payment attempts. Please wait a moment and try again, or use a different card.';
export const TIRZEPATIDE_DOSAGE_LABELS: Record<string, string> = {
  '6.67': '6.67 / 6.65 / 6.6',
  '8.9': '8.9 / 9',
  '11.12': '11.12 / 11',
  '13.35': '13.35 / 14',
  '15': '15 / 15.3'
};
export const PAYMENT_ERROR_MAP: Record<string, string> = {
  /** ------------------------
   * ISSUER DECLINES
   ------------------------ **/
  'card was declined': CARD_DECLINE_ERROR_MESSAGE,
  'card declined': CARD_DECLINE_ERROR_MESSAGE,
  'do not honor': CARD_DECLINE_ERROR_MESSAGE,
  'do_not_honor': CARD_DECLINE_ERROR_MESSAGE,
  'declined': CARD_DECLINE_ERROR_MESSAGE,
  'not permitted': CARD_DECLINE_ERROR_MESSAGE,
  'restricted card': CARD_DECLINE_ERROR_MESSAGE,
  'issuer': 'Your bank declined the payment. Please use a different card.',
  'your card was declined': CARD_DECLINE_ERROR_MESSAGE,
  'this transaction has been declined': CARD_DECLINE_ERROR_MESSAGE,
  'transaction has been declined': CARD_DECLINE_ERROR_MESSAGE,
  'the payment failed': CARD_DECLINE_ERROR_MESSAGE,
  'payment failed': CARD_DECLINE_ERROR_MESSAGE,

  /** ------------------------
   * INSUFFICIENT FUNDS
   ------------------------ **/
  'insufficient funds': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'insufficient': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'not enough funds': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'insufficient balance': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'low balance': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'card has insufficient funds': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'your card has insufficient funds': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'customer has insufficient funds': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'insufficient funds with the payment provider': INSUFFICIENT_FUNDS_ERROR_MESSAGE,

  /** ------------------------
   * EXPIRED CARD
   ------------------------ **/
  'card expired': EXPIRED_CARD_ERROR_MESSAGE,
  'expired card': EXPIRED_CARD_ERROR_MESSAGE,
  'card has expired': EXPIRED_CARD_ERROR_MESSAGE,
  'expired': EXPIRED_CARD_ERROR_MESSAGE,

  /** ------------------------
   * INVALID CARD NUMBER
   ------------------------ **/
  'invalid card number': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'invalid number': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'invalid card': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'incorrect number': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'card number': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'card number is incorrect': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'credit card number is invalid': INVALID_CARD_NUMBER_ERROR_MESSAGE,
  'your card number is incorrect': INVALID_CARD_NUMBER_ERROR_MESSAGE,

  /** ------------------------
   * INVALID CVV / CVC
   ------------------------ **/
  'invalid cvv': INVALID_CVV_ERROR_MESSAGE,
  'invalid cvc': INVALID_CVV_ERROR_MESSAGE,
  'security code': INVALID_CVV_ERROR_MESSAGE,
  'incorrect cvv': INVALID_CVV_ERROR_MESSAGE,
  'cvv': INVALID_CVV_ERROR_MESSAGE,
  'cvc': INVALID_CVV_ERROR_MESSAGE,
  'security code is invalid': INVALID_CVV_ERROR_MESSAGE,
  'card\'s security code': INVALID_CVV_ERROR_MESSAGE,

  /** ------------------------
   * INVALID EXPIRY DATE
   ------------------------ **/
  'invalid expiry': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'invalid expiration': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'expiry date': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'expiration date': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'invalid exp': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'invalid mm': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'invalid yy': INVALID_EXPIRY_DATE_ERROR_MESSAGE,
  'wrong exp': INVALID_EXPIRY_DATE_ERROR_MESSAGE,

  /** ------------------------
   * AUTHENTICATION / 3DS
   ------------------------ **/
  '3d secure': THREE_D_SECURE_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  '3ds': THREE_D_SECURE_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  'authentication failed': PAYMENT_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  'authentication': PAYMENT_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  'verification failed': 'Card verification failed. Please try again.',
  'challenge': PAYMENT_AUTHENTICATION_FAILED_ERROR_MESSAGE,

  /** ------------------------
   * FRAUD / RISK
   ------------------------ **/
  'fraud': FRAUDULENT_CARD_ERROR_MESSAGE,
  'fraudulent': FRAUDULENT_CARD_ERROR_MESSAGE,
  'fraudulent card': FRAUDULENT_CARD_ERROR_MESSAGE,
  'suspected': SUSPICIOUS_CARD_ERROR_MESSAGE,
  'risk': SUSPICIOUS_CARD_ERROR_MESSAGE,
  'suspected fraud': FRAUDULENT_CARD_ERROR_MESSAGE,

  /** ------------------------
   * LOST / STOLEN CARD
   ------------------------ **/
  'stolen': 'This card has been reported as stolen. Please use a different card.',
  'lost card': LOST_CARD_ERROR_MESSAGE,
  'pick up card': LOST_CARD_ERROR_MESSAGE,
  'pickup card': LOST_CARD_ERROR_MESSAGE,

  /** ------------------------
   * PROCESSING / GATEWAY / UNKNOWN
   ------------------------ **/
  'unable to process': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'processing error': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'error occurred': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'unexpected error': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'could not process': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'failed to process': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'invalid transaction': PAYMENT_PROCESSING_ERROR_MESSAGE,

  /** ------------------------
   * NETWORK ISSUES
   ------------------------ **/
  'network error': NETWORK_ERROR_MESSAGE,
  'connection error': NETWORK_ERROR_MESSAGE,
  'network failed': NETWORK_ERROR_MESSAGE,
  'connection failed': NETWORK_ERROR_MESSAGE,
  'timeout': PAYMENT_REQUEST_TIMED_OUT_ERROR_MESSAGE,
  'timed out': PAYMENT_REQUEST_TIMED_OUT_ERROR_MESSAGE,

  /** ------------------------
   * SESSION / TOKEN ISSUES
   ------------------------ **/
  'invalid token': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'secure token': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'expired token': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'session expired': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'session invalid': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'invalid session': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'token invalid': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,
  'token expired': PAYMENT_SESSION_EXPIRED_ERROR_MESSAGE,

  'limit exceeded': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'credit limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'spending limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'over limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'exceeds limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'exceeds amt lmt': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'exceeds withdrawal limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'amount limit': CARD_LIMIT_EXCEEDED_ERROR_MESSAGE,
  'repeated attempts': REPEATED_ATTEMPTS_ERROR_MESSAGE,
  'too frequently': REPEATED_ATTEMPTS_ERROR_MESSAGE,

  /** ------------------------
   * AVS (ADDRESS VERIFICATION) ERRORS
   ------------------------ **/
  'avs mismatch': AVS_MISMATCH_ERROR_MESSAGE,
  'avs rejected': AVS_MISMATCH_ERROR_MESSAGE,
  'address mismatch': AVS_MISMATCH_ERROR_MESSAGE,
  'billing address': AVS_MISMATCH_ERROR_MESSAGE,
  'address provided does not match': AVS_MISMATCH_ERROR_MESSAGE,
  'address does not match': AVS_MISMATCH_ERROR_MESSAGE,

  /** ------------------------
   * ACCOUNT CLOSED
   ------------------------ **/
  'account closed': ACCOUNT_CLOSED_ERROR_MESSAGE,
  'closed': ACCOUNT_CLOSED_ERROR_MESSAGE,
  'declined:closed': ACCOUNT_CLOSED_ERROR_MESSAGE,

  /** ------------------------
   * CARD BLOCKED
   ------------------------ **/
  'blocked': CARD_BLOCKED_ERROR_MESSAGE,
  'blocked, first used': CARD_BLOCKED_ERROR_MESSAGE,
  'declined:blocked': CARD_BLOCKED_ERROR_MESSAGE,
  'card blocked': CARD_BLOCKED_ERROR_MESSAGE,

  /** ------------------------
   * CARD TYPE NOT SUPPORTED
   ------------------------ **/
  'does not support': CARD_TYPE_NOT_SUPPORTED_ERROR_MESSAGE,
  'card does not support': CARD_TYPE_NOT_SUPPORTED_ERROR_MESSAGE,
  'type of purchase': CARD_TYPE_NOT_SUPPORTED_ERROR_MESSAGE,
  'not support this type': CARD_TYPE_NOT_SUPPORTED_ERROR_MESSAGE,

  /** ------------------------
   * INVALID ACCOUNT
   ------------------------ **/
  'invalid account': INVALID_ACCOUNT_ERROR_MESSAGE,

  /** ------------------------
   * ZIPCODE / POSTAL CODE REQUIRED
   ------------------------ **/
  'zipcode field is required': ZIPCODE_REQUIRED_ERROR_MESSAGE,
  'zipcode is required': ZIPCODE_REQUIRED_ERROR_MESSAGE,
  'postal code': ZIPCODE_REQUIRED_ERROR_MESSAGE,
  'zip code': ZIPCODE_REQUIRED_ERROR_MESSAGE,
  'zipcode required': ZIPCODE_REQUIRED_ERROR_MESSAGE,

  /** ------------------------
   * PAYMENT METHOD ATTACHMENT ERRORS
   ------------------------ **/
  'payment method': PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE,
  'previously used': PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE,
  'detached from': PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE,
  'not been set up for reuse': PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE,
  'may not be used again': PAYMENT_METHOD_ATTACHMENT_ERROR_MESSAGE,

  /** ------------------------
   * KLARNA ERRORS
   ------------------------ **/
  'klarna': KLARNA_DECLINED_ERROR_MESSAGE,
  'declined by klarna': KLARNA_DECLINED_ERROR_MESSAGE,
  'was declined by klarna': KLARNA_DECLINED_ERROR_MESSAGE,
  'klarna checkout was not completed': KLARNA_EXPIRED_ERROR_MESSAGE,
  'klarna checkout expired': KLARNA_EXPIRED_ERROR_MESSAGE,
  'cancelled checkout on klarna': KLARNA_CANCELLED_ERROR_MESSAGE,
  'customer cancelled checkout': KLARNA_CANCELLED_ERROR_MESSAGE,

  /** ------------------------
   * STRIPE LINK ERRORS
   ------------------------ **/
  'link account': STRIPE_LINK_CLOSED_ERROR_MESSAGE,
  'link account has been closed': STRIPE_LINK_CLOSED_ERROR_MESSAGE,
  'connection to the user\'s link': STRIPE_LINK_CLOSED_ERROR_MESSAGE,

  /** ------------------------
   * RECURRING PAYMENT ERRORS
   ------------------------ **/
  'recurring payments': RECURRING_PAYMENT_STOPPED_ERROR_MESSAGE,
  'stop of all recurring': RECURRING_PAYMENT_STOPPED_ERROR_MESSAGE,
  'customer requested stop': RECURRING_PAYMENT_STOPPED_ERROR_MESSAGE,

  /** ------------------------
   * MERCHANT SERVICE PROVIDER ERRORS
   ------------------------ **/
  'call merchant service provider': MERCHANT_SERVICE_ERROR_MESSAGE,
  'merchant service provider': MERCHANT_SERVICE_ERROR_MESSAGE,
  'error occurred during processing': MERCHANT_SERVICE_ERROR_MESSAGE,

  /** ------------------------
   * NMI SPECIFIC ERRORS
   ------------------------ **/
  'nmi authorization failed': CARD_DECLINE_ERROR_MESSAGE,
  'nmi api': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'unexpected error when calling nmi': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'declined:nsf': INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  'declined:9g': CARD_DECLINE_ERROR_MESSAGE,
  'contact card issuer': CARD_DECLINE_ERROR_MESSAGE,
  'declined - contact': CARD_DECLINE_ERROR_MESSAGE,

  /** ------------------------
   * APP ERRORS
   ------------------------ **/
  'app error': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'app error while charging': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'error while charging payment': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'unexpected error creating': PAYMENT_PROCESSING_ERROR_MESSAGE,

  /** ------------------------
   * INVALID AMOUNT ERRORS
   ------------------------ **/
  'invalid amount': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'calculated amount': PAYMENT_PROCESSING_ERROR_MESSAGE,
  'does not match the total': PAYMENT_PROCESSING_ERROR_MESSAGE,

  /** ------------------------
   * SENSITIVE / DEV-ONLY
   ------------------------ **/
  'test card': GENERIC_PAYMENT_ERROR_MESSAGE,
  'known test card': GENERIC_PAYMENT_ERROR_MESSAGE,
  'sandbox': GENERIC_PAYMENT_ERROR_MESSAGE,
  'debug': GENERIC_PAYMENT_ERROR_MESSAGE,
  'internal': GENERIC_PAYMENT_ERROR_MESSAGE,
  'developer': GENERIC_PAYMENT_ERROR_MESSAGE,
  'failed to start unified cc flow': GENERIC_PAYMENT_ERROR_MESSAGE,
  'failed to create_credit_card': GENERIC_PAYMENT_ERROR_MESSAGE,
};
