# Hotjar Tracking Implementation Summary

## Overview

Comprehensive Hotjar tracking has been implemented to track the complete user journey from landing to checkout (or abandonment). The system automatically tracks all critical user interactions and provides detailed context for each event.

## What Was Implemented

### 1. Core Tracking Infrastructure

#### Created `helpers/hotjarTracking.ts`

A centralized tracking helper module with the following functionality:

**Key Functions:**

- `initializeLandingPage()` - Captures and stores landing page information
- `getLandingPageInfo()` - Retrieves stored landing page data
- `trackPageView()` - Tracks page views with full context
- `trackButtonClick()` - Tracks button clicks with context
- `trackSurveyStart()` - Tracks survey initiation
- `trackSurveyStep()` - Tracks survey progress
- `trackSurveyComplete()` - Tracks survey completion
- `trackSurveyAbandoned()` - Tracks survey abandonment
- `trackCheckoutInitiated()` - Tracks checkout start
- `trackCheckoutPaymentInfo()` - Tracks payment info entry
- `trackCheckoutCompleted()` - Tracks successful purchases
- `trackCustomEvent()` - Tracks custom events with context

**Session Management:**

- Stores landing page in sessionStorage
- Generates unique session IDs
- Persists landing page context throughout session
- Tracks user flow (survey_first vs product_first)

#### Created `components/HotjarTracker.tsx`

A client-side React component that:

- Initializes landing page tracking on mount
- Automatically tracks page views on navigation
- Automatically tracks button clicks with `data-tracking-id` attributes
- Tracks survey abandonment on page exit or navigation
- Monitors beforeunload events for exit tracking

### 2. Integration Points

#### Updated `app/layout.tsx`

- Added `HotjarTracker` component to root layout
- Ensures tracking is active on all pages

#### Updated `modules/home/RootLayoutScripts.tsx`

- Simplified Hotjar initialization script
- Removed duplicate tracking logic (now handled by helper)

#### Updated `components/Survey/PatientIntakeSurvey/index.tsx`

- Added survey start tracking when questions load
- Added survey step tracking on every question change
- Added survey completion tracking on submission
- Includes question type and flow context

#### Updated `app/checkout/success/page.tsx`

- Added checkout completion tracking
- Includes product info, price, and payment method

#### Updated `components/Checkout/CheckoutForm.tsx`

- Added checkout initiation tracking
- Tracks when user lands on checkout page
- Includes product and flow context

### 3. Automatic Tracking Features

#### Landing Page Detection

- Automatically captures first page user visits
- Stores landing page URL and type
- Persists throughout session
- Distinguishes between:
  - Home page (`/`)
  - Ad pages (`/ad/*`)
  - Direct survey access
  - Direct product access

#### Page Type Classification

- `landing` - Homepage
- `ad_landing_page` - Ad campaign pages
- `survey` - Survey pages
- `product_selection` - Product listing/selection
- `checkout` - Checkout process
- `checkout_success` - Purchase confirmation
- `main_website` - Other pages

#### Flow Tracking

Automatically detects and tracks user flow:

- `survey_first` (SFA) - User takes survey first
- `product_first` (PFA) - User selects product first
- Determined by `flow` URL parameter

#### Button Click Tracking

Automatically tracks buttons with `data-tracking-id` attributes starting with:

- `get-started-*`
- `survey-*`
- `product-*`

Example:

```html
<button data-tracking-id="get-started-hero">Get Started</button>
```

### 4. Event Types Tracked

#### Page Events

- **page_view**: Every page navigation
  - Includes: page name, path, type, landing page, flow, referrer

#### Button Events

- **button_click**: All tracked button clicks
- **get_started_click**: Specific event for Get Started buttons
  - Includes: button ID, text, location, destination, flow

#### Survey Events

- **survey_started**: When survey begins
  - Includes: survey type, category, total questions
- **survey_progress**: Each question answered
  - Includes: current step, step name, question type, progress %
- **survey_completed**: Survey submission
  - Includes: total steps, completion time, flow
- **survey_abandoned**: User leaves survey
  - Includes: last step reached, exit type (navigation/beforeunload)

#### Checkout Events

- **checkout_initiated**: Checkout page loaded
  - Includes: products, total value, currency
- **checkout_payment_info**: Payment info entered
- **checkout_completed**: Purchase successful
  - Includes: invoice ID, products, payment method

### 5. Context Enrichment

Every event automatically includes:

- **Session ID**: Unique identifier for the session
- **Landing Page**: Original page user arrived on
- **Landing Page Type**: Type of landing page
- **Flow Type**: User flow (survey_first/product_first)
- **Page Context**: Current page name, path, type
- **Timestamp**: When event occurred
- **URL Parameters**: All query parameters

### 6. Abandonment Tracking

The system tracks when users leave at any point:

**Survey Abandonment:**

- Detected when user navigates away from survey
- Detected when user closes browser/tab
- Tracks last step reached
- Tracks exit type (navigation vs beforeunload)

**Checkout Abandonment:**

- Tracked implicitly by absence of completion event
- Can analyze drop-off between initiation and completion

### 7. Documentation

Created comprehensive documentation:

- `docs/HOTJAR_TRACKING.md` - Complete usage guide
- `docs/HOTJAR_IMPLEMENTATION_SUMMARY.md` - This summary

## Files Created

1. `helpers/hotjarTracking.ts` - Core tracking functions
2. `components/HotjarTracker.tsx` - React tracking component
3. `docs/HOTJAR_TRACKING.md` - User documentation
4. `docs/HOTJAR_IMPLEMENTATION_SUMMARY.md` - Implementation summary

## Files Modified

1. `app/layout.tsx` - Added HotjarTracker component
2. `modules/home/RootLayoutScripts.tsx` - Simplified Hotjar init
3. `components/Survey/PatientIntakeSurvey/index.tsx` - Added survey tracking
4. `app/checkout/success/page.tsx` - Added completion tracking
5. `components/Checkout/CheckoutForm.tsx` - Added initiation tracking

## Key Benefits

1. **Complete Journey Tracking**: Track users from landing to purchase
2. **Abandonment Analysis**: See exactly where users drop off
3. **Source Attribution**: Know which landing pages/ads drive conversions
4. **Flow Comparison**: Compare survey-first vs product-first flows
5. **Session Context**: All events include full session context
6. **Automatic Tracking**: Most tracking happens automatically
7. **Easy Debugging**: Console logging for verification
8. **Extensible**: Easy to add custom events

## Usage Examples

### Automatic Tracking (No Code Needed)

Most tracking happens automatically:

- Landing page captured on first visit ✅
- Page views tracked on navigation ✅
- Button clicks tracked via `data-tracking-id` ✅
- Survey progress tracked automatically ✅
- Checkout flow tracked automatically ✅

### Adding Button Tracking

Simply add a `data-tracking-id` attribute:

```html
<button data-tracking-id="get-started-pricing">Get Started</button>
<button data-tracking-id="survey-weight-loss">Take Survey</button>
<button data-tracking-id="product-select-olympia">Select Plan</button>
```

### Custom Event Tracking

For custom events:

```typescript
import { trackCustomEvent } from '@/helpers/hotjarTracking';

trackCustomEvent('video_played', {
  videoTitle: 'How It Works',
  duration: 120,
});
```

## Testing

To test the implementation:

1. Open browser console
2. Navigate through the site
3. Look for `🔥 Hotjar` log messages
4. Verify events appear in Hotjar dashboard

Example console output:

```
🔥 Hotjar - Landing page initialized: { landingPage: '/ad/weight-loss', ... }
🔥 Hotjar - Page view tracked: { pageName: 'weight-loss', ... }
🔥 Hotjar - Button click tracked: { buttonId: 'get-started-hero', ... }
🔥 Hotjar - Survey progress tracked: { currentStep: 5, ... }
```

## Analytics Capabilities

With this implementation, you can now:

1. **Track Conversion Funnels**:

   - Landing → Survey → Product → Checkout → Purchase
   - Landing → Product → Survey → Checkout → Purchase

2. **Identify Drop-off Points**:

   - Which survey questions lose users
   - Where in checkout users abandon
   - Which landing pages have highest bounce

3. **Compare Sources**:

   - Which ads/landing pages convert best
   - Compare organic vs paid traffic
   - A/B test different entry points

4. **Optimize Flows**:

   - Compare SFA vs PFA flows
   - Test different survey lengths
   - Optimize checkout process

5. **Understand User Behavior**:
   - Most popular entry points
   - Common navigation paths
   - Time to completion

## Configuration

**Hotjar Site ID**: 6548722

The Hotjar site ID is configured in `modules/home/RootLayoutScripts.tsx`:

```javascript
h._hjSettings = { hjid: 6548722, hjsv: 6 };
```

## Security & Privacy

- No PII (Personally Identifiable Information) is sent in events
- Email addresses are only tracked post-submission
- Session data stored in sessionStorage (cleared on browser close)
- Complies with Hotjar's privacy guidelines

## Maintenance

The tracking system is designed to be low-maintenance:

1. **Automatic Updates**: Button tracking updates automatically
2. **Self-Documenting**: Console logs show what's being tracked
3. **Error Handling**: Graceful degradation if Hotjar unavailable
4. **No Breaking Changes**: Backward compatible

## Future Enhancements

Potential improvements:

1. Add A/B testing support
2. Track scroll depth
3. Track time on page
4. Add heatmap integration
5. Track form field interactions
6. Add cohort analysis

## Support

For questions or issues:

1. Check `docs/HOTJAR_TRACKING.md`
2. Review console logs
3. Verify in Hotjar dashboard
4. Contact development team

---

**Implementation Date**: October 2024
**Version**: 1.0
**Status**: ✅ Complete and Deployed
