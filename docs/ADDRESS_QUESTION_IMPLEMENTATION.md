# Address Question Implementation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Dependencies](#dependencies)
5. [Implementation Details](#implementation-details)
6. [Data Flow](#data-flow)
7. [Integration Points](#integration-points)
8. [Considerations &-considerations)
9. [Testing](#testing)
10. [Future Improvements](#future-improvements)

---

## Overview

The Address Question feature allows the General Survey form to detect and render address-related questions with a custom Yes/No interface, similar to the Refill Survey Form Sidebar. When a user selects "Yes", an address form is displayed allowing them to enter or update billing and shipping addresses. The implementation supports prefilling addresses from existing order data.

### Recent Changes (v2.0)

- **Refactored Architecture**: `AddressForm` is now a controlled component
- **Simplified Props**: Uses `AddressData` type directly instead of managing answers
- **Better Separation**: Parent component (`AddressQuestionRenderer`) manages state
- **Improved Reusability**: Component can be used in different contexts more easily

### Key Features

- ✅ Automatic detection of address questions based on question text patterns
- ✅ Custom Yes/No radio button interface
- ✅ Dynamic address form rendering
- ✅ Address prefilling from order data
- ✅ Billing and shipping address support
- ✅ "Same as billing" checkbox functionality
- ✅ Proper data serialization for API submission

---

## Architecture

### Design Pattern

The implementation follows a **conditional rendering pattern** where:

1. The system detects if the current question is an address type question
2. If yes, it renders a custom `AddressQuestionRenderer` component
3. Otherwise, it falls back to the standard `SurveyForm` component

### State Management

- Uses React `useState` for local component state (non-Formik approach)
- `AddressQuestionRenderer` manages `AddressData` state using `useState`
- `AddressForm` is a controlled component - receives data via props
- Address data is stored in `AddressData` type structure
- On submission, address objects are serialized to JSON strings

### Type System

The implementation uses TypeScript with type assertions (`as any`) to handle the limitation that `PatientSurveyAnswerType.answer` only accepts `string | string[] | File`, but we need to store address objects temporarily.

---

## Components

### 1. `GeneralSurvey` Component

**Location:** `src/modules/landing/survey/GeneralSurvey/index.tsx`

**Responsibilities:**

- Main survey container component
- Manages question navigation and answer state
- Detects address questions using `isQuestionAddressType` memo
- Conditionally renders `AddressQuestionRenderer` or `SurveyForm`
- Handles form submission and address serialization

**Key Props:**

```typescript
interface Props {
  surveyId: string;
  surveyEmail: string;
  data: PatientSurveysResponse['data'];
  orderAddress?: Address; // Optional: Prefill address data
}
```

**Key Functions:**

- `isQuestionAddressType`: Memoized check for address question patterns
- `handleSubmit`: Serializes address objects to JSON strings before API submission

---

### 2. `AddressQuestionRenderer` Component

**Location:** `src/modules/landing/survey/GeneralSurvey/includes/AddressQuestionRenderer.tsx`

**Responsibilities:**

- Renders Yes/No radio buttons for address questions
- Manages `AddressData` state using `useState`
- Handles address option selection
- Conditionally renders `AddressForm` component when "Yes" is selected
- Manages integration with survey answers

**Key Props:**

```typescript
interface AddressQuestionRendererProps {
  question: SurveyQuestion;
  addressData: AddressData;
  setAddressData: (data: AddressData) => void;
}
```

**Key Logic:**

```typescript
const isYesSelected = selectedOption === 'yes';
```

When "Yes" is selected:

- Updates `addressData.selectedOption` to `'yes'`
- Renders `AddressForm` component
- AddressForm receives `addressData` and `setAddressData` props

When "No" is selected:

- Updates `addressData.selectedOption` to `'no'`
- Hides `AddressForm` component

---

### 3. `AddressForm` Component

**Location:** `src/components/PatientSurvey/AddressForm.tsx`

**Responsibilities:**

- Renders billing and shipping address input fields
- Controlled component that receives address data as props
- Handles field changes and updates parent state
- Handles "same as billing" checkbox logic

**Key Props:**

```typescript
interface Props {
  questionId: string;
  addressData: AddressData;
  setAddressData: (data: AddressData) => void;
}
```

**Key Features:**

- Uses `useStates` hook for US state dropdown
- Controlled component pattern (no internal state management)
- Automatic shipping address sync when "same as billing" is checked
- ZIP code input restriction (5 digits max, filters non-numeric characters)

**Component Pattern:**

- **Controlled Component**: Receives `addressData` as prop, calls `setAddressData` on changes
- Parent component (`AddressQuestionRenderer`) manages state and validation
- No direct integration with `answers` state - parent handles that

---

## Dependencies

### External Dependencies

1. **React Hooks**

   - `useState`: Component state management
   - `useEffect`: Side effects and initialization
   - `useMemo`: Performance optimization for address question detection

2. **React Icons**

   - `react-icons/fa`: `FaRegCheckCircle`, `FaRegCircle` for radio button UI

3. **Custom Hooks**
   - `useStates`: Fetches US states list for dropdown (`src/hooks/useStates.ts`)

### Internal Dependencies

1. **Type Definitions**

   - `Address` from `@/store/slices/ordersApiSlice`
   - `PatientSurveyAnswerType` from `@/lib/types`
   - `SurveyQuestion` from `@/store/slices/surveyQuestionSlice`

2. **Utilities**

   - `isEmpty` helper from `@/lib/helper` (used in submission filtering)

3. **API Integration**
   - `useSubmitGeneralSurveyMutation` from `@/store/slices/surveysApiSlice`

### Shared Components

- The `AddressForm` component is **shared** and can be reused in other survey contexts
- Uses the same address structure as `RefillSurveyFormSidebar` for consistency

---

## Implementation Details

### Address Question Detection

Address questions are detected using pattern matching on question text:

```typescript
const isQuestionAddressType = useMemo(() => {
  const currentQuestion = questions[questionIndex];
  if (!currentQuestion) return false;
  const text = currentQuestion?.questionText?.toLowerCase() || '';
  return (
    text.includes('update your new address') || text.includes('update your address') || text.includes('new address')
  );
}, [questions, questionIndex]);
```

**Patterns Detected:**

- "update your new address"
- "update your address"
- "new address"

**Note:** These patterns are case-insensitive.

---

### Address Data Structure

The `AddressData` type is defined in `src/types/generalSurvey.ts`:

```typescript
export type AddressData = {
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  sameAsBilling: boolean;
  selectedOption?: 'yes' | 'no';
};
```

Where `BillingAddress` and `ShippingAddress` are imported from `@/store/slices/ordersApiSlice`:

```typescript
interface BillingAddress {
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  city: string;
  region: string; // Default: "United States"
  state: string;
  zip: string; // Max 5 digits
}
```

---

### Data Flow

#### 1. Initialization Flow

```
Page Component (page.tsx)
  ↓ (passes orderAddress)
GeneralSurvey Component
  ↓ (detects address question)
AddressQuestionRenderer
  ↓ (if orderAddress exists)
Prefills AddressForm with orderAddress data
```

#### 2. User Interaction Flow

```
User sees address question
  ↓
User clicks "Yes"
  ↓
AddressQuestionRenderer updates addressData.selectedOption to 'yes'
  ↓
AddressForm component renders (receives addressData prop)
  ↓
User fills address fields
  ↓
AddressForm calls setAddressData on each change
  ↓
AddressQuestionRenderer receives updated addressData
  ↓
Parent component can update answers state or perform validation
```

#### 3. Submission Flow

```
User clicks "Submit Survey"
  ↓
handleSubmit filters empty answers
  ↓
For each answer:
  - If address question AND answer is object:
    → JSON.stringify(address object)
  - If File object:
    → Upload file and get URL
  - Otherwise:
    → Use answer as-is (string)
  ↓
Submit to API with serialized answers
```

---

## Integration Points

### 1. Page Component Integration

**File:** `src/app/general-survey/[id]/page.tsx`

```typescript
export default async function Page({ params, searchParams }: Readonly<Props>) {
  const { id } = await params;
  const { email = '', orderAddress } = await searchParams;
  const data = await fetchGeneralSurvey(id);

  return <GeneralSurvey surveyId={id} surveyEmail={email} data={data} orderAddress={orderAddress} />;
}
```

**Key Points:**

- `orderAddress` is extracted from URL search params
- Must be passed as prop to `GeneralSurvey`
- Type: `Address | undefined`

---

### 2. API Integration

**File:** `src/store/slices/surveysApiSlice.ts`

The submission endpoint expects answers as:

```typescript
{
  email: string;
  answers: Array<{
    questionId: string;
    answer: string; // Address objects are stringified
    isRequired: boolean;
  }>;
}
```

**Serialization:**

- Address objects are converted to JSON strings before submission
- Format: `JSON.stringify(addressData)`
- Backend receives: `"{\"billingAddress\":{...},\"shippingAddress\":{...}}"`

---

### 3. Type System Integration

**Current Approach:**

- `AddressData` type is defined separately in `@/types/generalSurvey`
- Uses `BillingAddress` and `ShippingAddress` types from `@/store/slices/ordersApiSlice`
- No type assertions needed in `AddressForm` component
- Parent component (`AddressQuestionRenderer`) handles integration with `answers` state if needed

**Type Structure:**

```typescript
// AddressData type
type AddressData = {
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  sameAsBilling: boolean;
  selectedOption?: 'yes' | 'no';
};
```

**Benefits:**

- Clean separation of concerns
- Type-safe address data structure
- Reusable AddressForm component
- Parent handles answer state integration

---

## ⚠️ Considerations

### 1. Type Safety

- **Current Limitation:** Type system doesn't natively support address objects in `PatientSurveyAnswerType`
- **Mitigation:** Type assertions with clear documentation
- **Future Improvement:** Consider extending `PatientSurveyAnswerType` to support address objects

### 2. State Management

- **Controlled Component Pattern:** `AddressForm` is now a controlled component
- **State Location:** `AddressQuestionRenderer` manages `AddressData` state
- **Impact:** Simpler component, better reusability, parent handles integration
- **Consideration:** Parent component must manage state and validation logic

### 3. Address Question Detection

- **Pattern-Based:** Relies on text matching, not question type or metadata
- **Risk:** If question text changes, detection may fail
- **Mitigation:** Consider adding explicit question metadata/flag in backend

### 4. Prefilling Logic

- **Conditional:** Only prefills if `orderAddress` prop is provided
- **Behavior:** If user selects "No" then "Yes" again, prefills again
- **Consideration:** May want to preserve user-entered data if they navigate back

### 5. Validation

- **Current:** Basic required field validation
- **Missing:** Format validation (ZIP code format, email format if applicable)
- **Future:** Consider adding comprehensive validation schema

### 6. Shared Component Usage

- **AddressForm** is designed to be reusable
- **Current Usage:** GeneralSurvey only
- **Potential:** Could be used in other survey contexts
- **Consideration:** Ensure props interface remains flexible

### 7. Browser Compatibility

- **Window Closing:** Uses `globalThis.window` for SSR compatibility
- **Note:** Window closing behavior may vary by browser security settings

---

## Testing

### Unit Tests to Consider

1. **AddressQuestionRenderer**

   - Test Yes/No option selection
   - Test address form rendering when "Yes" selected
   - Test address data initialization

2. **AddressForm**

   - Test field updates
   - Test "same as billing" checkbox
   - Test validation logic
   - Test prefilling from orderAddress

3. **GeneralSurvey Integration**
   - Test address question detection
   - Test conditional rendering
   - Test submission serialization

### Manual Testing Checklist

- [ ] Address question is detected correctly
- [ ] Yes/No buttons work correctly
- [ ] Address form appears when "Yes" selected
- [ ] Address form prefills from orderAddress
- [ ] All address fields are editable
- [ ] "Same as billing" checkbox works
- [ ] Validation prevents submission with incomplete addresses
- [ ] Address data serializes correctly on submission
- [ ] Navigation (Next/Previous) works correctly
- [ ] Form state persists when navigating between questions

---

## Future Improvements

### 1. Type System Enhancement

```typescript
// Proposed: Extend PatientSurveyAnswerType
export type PatientSurveyAnswerType = {
  questionId?: string;
  answer?: string | string[] | File | AddressFormData; // Add AddressFormData
  isValid?: boolean;
  otherText?: string;
  isRequired?: boolean | null;
};
```

### 2. Question Metadata

Add explicit flag in question data:

```typescript
interface SurveyQuestion {
  // ... existing fields
  isAddressQuestion?: boolean; // Explicit flag instead of text matching
}
```

### 3. Formik Migration

Consider migrating to Formik for:

- Schema-based validation
- Better form state management
- Consistency with RefillSurveyFormSidebar

### 4. Enhanced Validation

- ZIP code format validation
- State code validation
- Required field highlighting
- Error messages per field

### 5. Address Autocomplete

- Integrate address autocomplete API (e.g., Google Places)
- Improve user experience
- Reduce input errors

### 6. Address History

- Save user-entered addresses
- Allow selection from previous addresses
- Improve UX for repeat users

### 7. Internationalization

- Support international addresses
- Country/region selection
- Postal code format variations

---

## Code Examples

### Adding a New Address Question Pattern

To add a new pattern for detecting address questions:

```typescript
// In GeneralSurvey/index.tsx
const isQuestionAddressType = useMemo(() => {
  const currentQuestion = questions[questionIndex];
  if (!currentQuestion) return false;
  const text = currentQuestion?.questionText?.toLowerCase() || '';
  return (
    text.includes('update your new address') ||
    text.includes('update your address') ||
    text.includes('new address') ||
    text.includes('your new pattern here') // Add new pattern
  );
}, [questions, questionIndex]);
```

### Using AddressForm in Another Component

```typescript
import { AddressForm } from '@/components/PatientSurvey/AddressForm';
import { AddressData } from '@/types/generalSurvey';

function MyComponent() {
  const [addressData, setAddressData] = useState<AddressData>({
    billingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      street2: '',
      city: '',
      region: 'United States',
      state: '',
      zip: '',
    },
    shippingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      street2: '',
      city: '',
      region: 'United States',
      state: '',
      zip: '',
    },
    sameAsBilling: false,
    selectedOption: 'yes',
  });

  return <AddressForm questionId='my-question-id' addressData={addressData} setAddressData={setAddressData} />;
}
```

### Customizing Address Validation

```typescript
// In AddressForm.tsx, modify validateAddress function
const validateAddress = (data: AddressFormData): boolean => {
  const billing = data.billingAddress;
  const shipping = data.sameAsBilling ? data.billingAddress : data.shippingAddress;

  // Add custom validation rules
  const isValidZip = (zip: string) => /^\d{5}$/.test(zip);
  const isValidState = (state: string) => stateNames.includes(state);

  return !!(
    billing.firstName &&
    billing.lastName &&
    billing.street &&
    billing.city &&
    isValidState(billing.state) &&
    isValidZip(billing.zip) &&
    // ... shipping validation
  );
};
```

---

## Related Documentation

- [RefillSurveyFormSidebar Implementation](../src/components/Dashboard/orders/RefillSurveyFormSidebar/README.md) (if exists)
- [Survey API Documentation](../docs/API.md)
- [Type Definitions](../src/lib/types.ts)

---

## Support & Questions

For questions or issues related to this implementation:

1. Check this documentation first
2. Review the code comments in the implementation files
3. Consult with the team lead or original implementer
4. Create an issue in the project tracker with:
   - Description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant code snippets

---

**Last Updated:** [Current Date]  
**Maintained By:** Development Team  
**Version:** 1.0.0
