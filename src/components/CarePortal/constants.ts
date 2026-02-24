import PERSONAL_DETAILS from '@/assets/care-portal/personal-details.png';
import QUESTIONNAIRE from '@/assets/care-portal/questionnaire.png';
import SHOP_NOW from '@/assets/care-portal/shop-now.png';
import STORE from '@/assets/care-portal/store.png';
import GENERAL_INTAKE from '@/assets/care-portal/general-intake.png';
import PATIENT_CHART from '@/assets/care-portal/patient-chart.png';
import ORDER_INFO from '@/assets/care-portal/order-info.png';
import FORMULATORY from '@/assets/care-portal/formulatory.png';
import PRESCRIBE_PHYSICIAN from '@/assets/care-portal/prescribe-physician.png';

export const signUpSteps = [
  {
    title: 'Create Your Account',
    description:
      'To get started, head over to our sign‑up page and choose your email and password to register your new account.',
    cta: {
      text: 'Go to Sign‑Up Page',
      href: 'https://lumimeds.telepath.clinic/signup/',
    },
  },
  {
    title: 'Tell Us About Yourself',
    description: 'Help us get to know you by completing your profile information such as:',
    details: [
      'Full Name: Enter your first and last name as it appears on your ID.',
      'Date of Birth: Use the calendar picker to avoid typos.',
      "Email Address: This is where we'll send important updates.",
      'Password: Choose a strong password (8+ characters with a mix of letters and numbers).',
    ],
    image: {
      src: PERSONAL_DETAILS,
      alt: 'personal details',
      width: 1409,
      height: 868,
    },
  },
  {
    title: 'Complete Personal Questions',
    description:
      'Fill out the personal questions that follow. These may include details like your name, contact information, or preferences—ensure accuracy for a smooth process.',
    image: {
      src: QUESTIONNAIRE,
      alt: 'Personal Questions',
      width: 1387,
      height: 804,
    },
  },
  {
    title: 'Start Shopping',
    description: `Tap the "Shop Now" button to browse our full selection of products. If this is your first time ordering, take your time to explore - we've made sure the process is simple and straightforward.`,
    image: {
      src: SHOP_NOW,
      alt: 'Shopping',
      width: 1403,
      height: 612,
    },
  },
  {
    title: 'Select Your Dosage',
    description: `Choose the option that best matches your needs. Dosage recommendations may vary based on factors like symptom severity or medical advice—pick the one you’re most comfortable with. If unsure, refer to your prescription or consult the product description for guidance.`,
    image: {
      src: STORE,
      alt: 'Dosage',
      width: 1074,
      height: 756,
    },
  },
  {
    title: 'Confirm Your Selection',
    description: `Once you've made your choices, click the "Submit" button to proceed. This will save your preferences and take you to the next step in the process. Double-check your selections before submitting to ensure everything is exactly as you want it.`,
  },
  {
    title: 'Complete Your Intake Form',
    description: `Fill out the short medical questionnaire that appears next. This helps us ensure you get the right products for your needs. All information is kept confidential and secure.`,
  },
  {
    title: 'Proceed to Checkout',
    description: `Once you've completed the form, click "Continue Checkout" to review your order and payment options. This will take you to the final steps where you can confirm your details and complete your purchase securely.`,
  },
  {
    title: 'Complete Your Additional Health Details',
    description: `You'll now see a second intake form to help us better understand your needs. This builds on your previous answers to ensure we recommend the most suitable products for you. The form is completely confidential and typically takes just a few minutes to complete.`,
    image: {
      src: GENERAL_INTAKE,
      alt: 'Additional Health Details',
      width: 1004,
      height: 816,
    },
  },
  {
    title: 'Final Review Before Submission',
    description: `Before you submit, take a quick moment to double-check that every required field has been filled in. The system won’t be able to process your form if anything is missing—but don’t worry, it will highlight any blank sections for you to complete.`,
  },
  {
    title: 'Complete Your Order',
    description: `You're almost done! Click "Submit" to finalize your details and complete the checkout process. This will securely process your information and take you to your order page, where you can review your order summary and payment details.`,
  },
];

export const doctorAssignmentSteps = [
  {
    title: 'Access Patient Information',
    description:
      'Start by clicking "Patient Chart" to open the complete medical profile. This gives you a full overview of the patient\'s history, current medications, and previous orders—everything you need to make informed decisions before assigning their case.',
    image: {
      src: PATIENT_CHART,
      alt: 'Patient Chart',
      width: 857,
      height: 438,
    },
  },
  {
    title: 'Verify Prescribing Eligibility',
    description:
      "Before proceeding, confirm the patient's State location displayed in their chart. This ensures the assigned doctor holds an active license to prescribe in that state, keeping everything compliant and avoiding prescription delays.",
  },
  {
    title: 'Review Patient Health Profile',
    description: `Click "View General Intake Response" to access the patient's completed health questionnaire.`,
  },
  {
    title: 'Verify Patient Information',
    description: `Carefully review the intake form to ensure all required health details are provided. Complete information helps you make safe, informed prescribing decisions. <br/> If any sections are missing, click "Send Message" to securely request the needed details from the patient. The system will guide you through this quick process. <br/> If everything looks complete, you're ready to move forward with confidence.`,
  },
  {
    title: 'Access Order Information',
    description: `Click "View Order Details" to see the full prescription request, including medication preferences and dosage specifics. This gives you everything needed to evaluate and process the order accurately.`,
    image: {
      src: ORDER_INFO,
      alt: 'Access Order Information',
      width: 851,
      height: 411,
    },
  },
  {
    title: 'Add Formulary Details',
    description: `Click into the Order Notes section to enter the prescribed formulary information. This ensures accurate medication processing and helps avoid potential errors during fulfillment.`,
    image: {
      src: FORMULATORY,
      alt: 'Formulary Details',
      width: 845,
      height: 125,
    },
  },
  {
    title: 'Standardized Prescription Entry',
    description: `Please format your order using this clear structure: <br/> 👉 PHARMACY - DOSAGE - FORMULARY <br/> <em>(Example: Boothwyn - 0.22mg/weekly - Semaglutide 2.5 mg/mL / Glycine 5 mg/mL / Methylcobalamin 5 mg/mL (0.4 mL) Inj Solution w Admin Kit)</em>`,
  },
  {
    title: 'Assign to Prescribing Physician',
    description: `Click "Assign Staff" to select the licensed doctor who will review and approve this prescription. The system will automatically show only providers licensed in the patient's state for compliant prescribing.`,
    image: {
      src: PRESCRIBE_PHYSICIAN,
      alt: 'Prescribing Physician',
      width: 843,
      height: 118,
    },
  },
];
