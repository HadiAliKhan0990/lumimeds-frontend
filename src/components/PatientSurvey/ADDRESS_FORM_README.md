# AddressForm Component - Quick Reference

## Overview

Reusable address form component for survey forms. Handles billing and shipping address input with validation. The component is now a controlled component that receives address data as props.

## Usage

```typescript
import { AddressForm } from '@/components/PatientSurvey/AddressForm';
import { AddressData } from '@/types/generalSurvey';

const [addressData, setAddressData] = useState<AddressData>({
  billingAddress: {
    /* ... */
  },
  shippingAddress: {
    /* ... */
  },
  sameAsBilling: false,
  selectedOption: 'yes',
});

<AddressForm questionId='question-123' addressData={addressData} setAddressData={setAddressData} />;
```

## Props

| Prop             | Type                          | Required | Description                                                   |
| ---------------- | ----------------------------- | -------- | ------------------------------------------------------------- |
| `questionId`     | `string`                      | Yes      | Unique identifier for the question                            |
| `addressData`    | `AddressData`                 | Yes      | Address data object containing billing and shipping addresses |
| `setAddressData` | `(data: AddressData) => void` | Yes      | Function to update address data                               |

## Data Structure

The component uses the `AddressData` type from `@/types/generalSurvey`:

```typescript
type AddressData = {
  billingAddress: BillingAddress;
  shippingAddress: ShippingAddress;
  sameAsBilling: boolean;
  selectedOption?: 'yes' | 'no';
};
```

Where `BillingAddress` and `ShippingAddress` have the structure:

```typescript
{
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

## Features

- ✅ Billing and shipping address fields
- ✅ "Same as billing" checkbox functionality
- ✅ US states dropdown (via `useStates` hook)
- ✅ Controlled component pattern
- ✅ ZIP code input restriction (5 digits)
- ✅ Automatic shipping address sync when "same as billing" is checked

## Dependencies

- `useStates` hook - Fetches US states list (`src/hooks/useStates.ts`)
- `AddressData` - Type definition from `@/types/generalSurvey`
- `BillingAddress`, `ShippingAddress` - Type definitions from `@/store/slices/ordersApiSlice`

## Component Pattern

This is a **controlled component** - it doesn't manage its own state. The parent component is responsible for:

- Managing the `addressData` state
- Handling validation
- Integrating with survey answers
- Submission logic

## Field Updates

The component calls `setAddressData` on every field change, allowing the parent to:

- Update validation status
- Store in survey answers
- Perform any necessary side effects

## Notes

- Component is now simpler and more reusable
- Parent component handles integration with survey answer state
- No direct answer state management in this component
- ZIP code automatically filters non-numeric characters

## See Also

- [Full Documentation](../../../../docs/ADDRESS_QUESTION_IMPLEMENTATION.md)
- [GeneralSurvey Implementation](../../../modules/landing/survey/GeneralSurvey/index.tsx)
- [AddressQuestionRenderer](../../../modules/landing/survey/GeneralSurvey/includes/AddressQuestionRenderer.tsx)
