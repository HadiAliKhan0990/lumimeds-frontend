# GeneralSurvey Component - Address Question Feature

## Quick Start

The GeneralSurvey component now supports address questions with automatic detection and custom rendering.

## How It Works

1. **Detection**: Automatically detects address questions by matching question text patterns
2. **Rendering**: Shows Yes/No radio buttons instead of standard form fields
3. **Address Form**: Displays full address form when "Yes" is selected
4. **Prefilling**: Automatically prefills address if `orderAddress` prop is provided

## Address Question Patterns

The component detects questions containing:

- "update your new address"
- "update your address"
- "new address"

(Case-insensitive)

## Props

```typescript
interface Props {
  surveyId: string;
  surveyEmail: string;
  data: PatientSurveysResponse['data'];
  orderAddress?: Address; // NEW: Optional address prefilling
}
```

## Usage Example

```typescript
// In page.tsx
<GeneralSurvey
  surveyId={id}
  surveyEmail={email}
  data={data}
  orderAddress={orderAddress} // Pass from searchParams
/>
```

## Key Components

- **GeneralSurvey**: Main component with address question detection
- **AddressQuestionRenderer**: Renders Yes/No interface (internal)
- **AddressForm**: Full address form component

## Data Flow

1. User sees address question → Yes/No buttons appear
2. User clicks "Yes" → Address form appears
3. User fills form → Data stored in answers state
4. User submits → Address object serialized to JSON string
5. API receives → Stringified address data

## Important Notes

- Address objects are temporarily stored in `answers` state (type assertion required)
- On submission, addresses are converted to JSON strings
- Prefilling only works if `orderAddress` prop is provided
- Validation prevents submission with incomplete addresses

## Troubleshooting

**Address form not appearing?**

- Check if question text matches detection patterns
- Verify `isQuestionAddressType` is returning `true`
- Check browser console for errors

**Address not prefilling?**

- Ensure `orderAddress` prop is passed correctly
- Verify `orderAddress` structure matches expected format
- Check that `orderAddress` is not `undefined`

**Submission errors?**

- Verify address object is being stringified correctly
- Check API expects stringified address format
- Ensure all required fields are filled

## See Also

- [Full Documentation](../../../../docs/ADDRESS_QUESTION_IMPLEMENTATION.md)
- [AddressForm Component](../../../components/PatientSurvey/ADDRESS_FORM_README.md)
