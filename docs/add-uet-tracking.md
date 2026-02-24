# Microsoft UET Tracking Implementation Guide

## ✅ Completed Components

The following components now have Microsoft UET tracking implemented:

1. **AddToCart Events:**

   - ✅ `components/Home/ProductsPlans/index.tsx`

2. **InitiateCheckout Events:**

   - ✅ `components/Survey/PatientIntakeSurvey/includes/QuestionairreForm.tsx`

3. **Purchase Events:**

   - ✅ `components/Checkout/CheckoutForm.tsx`
   - ✅ `app/checkout/success/page.tsx`

4. **Lead Events:**
   - ✅ `components/Survey/PatientIntakeSurvey/includes/QuestionairreForm.tsx`

## 🔄 Remaining Components to Update

The following components need Microsoft UET AddToCart tracking added:

### High Priority Components:

1. `components/Ads/science/includes/PlanCard.tsx`
2. `components/Ads/easy-weight-loss/includes/ProductCards/index.tsx`
3. `components/Ads/WeightLossTreatment/includes/PlanCard/index.tsx`
4. `components/Ads/WeightLossTreatment/includes/OtpPlansSection/index.tsx`
5. `components/Ads/StayOnTrackHero/index.tsx`
6. `components/ProductsSummary/includes/BottomPopup.tsx`
7. `components/Products/ProductModal/index.tsx`
8. `components/Ads/Sustained/index.tsx`
9. `components/Ads/Sustained/includes/PlanCard.tsx`
10. `components/Ads/glp1-gip-treatment/index.tsx`
11. `components/Ads/glp1-gip-treatment/includes/PlanCard.tsx`
12. `components/Home/SpecialOffer/includes/OlympiaCard.tsx`
13. `components/Products/Single/ProductOptions.tsx`
14. `components/Products/ProductsList/index.tsx`
15. `components/Home/WellsProduct/index.tsx`
16. `components/Home/SpecialOffer2/includes/OlympiaCard2.tsx`
17. `components/Cards/OneTimePurchaseCard.tsx`

## 📝 Implementation Pattern

For each component, add the following:

### 1. Import Statement:

```typescript
import { trackUETConversion } from '@/helpers/uetTracking';
```

### 2. Add UET Tracking After trackAddToCart:

```typescript
// Microsoft UET AddToCart tracking
trackUETConversion({
  event: 'AddToCart',
  revenue: p.startingAmount, // or appropriate value
  currency: 'USD',
  productId: p.categoryIds[0], // or appropriate ID
  productName: p.displayName || '', // or appropriate name
  category: 'product',
});
```

## 🎯 Event Summary

Microsoft UET now tracks these 4 events (matching Facebook Pixel):

1. **AddToCart** - When users select products
2. **InitiateCheckout** - When survey is completed
3. **Purchase** - When checkout is completed
4. **Lead** - When intake form is submitted

## ✅ Testing

Use the test page at `/test-uet` to verify all events are working correctly.
