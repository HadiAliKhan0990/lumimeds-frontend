# Hotjar Tracking Implementation

This document describes the comprehensive Hotjar tracking implementation for the LumiMeds application.

## Overview

The Hotjar tracking system tracks the entire user journey from landing to checkout completion (or abandonment), providing valuable insights into user behavior and conversion optimization opportunities.

## Key Features

- **Landing Page Tracking**: Automatically captures and persists the original landing page throughout the user's session
- **Page View Tracking**: Tracks all page views with contextual information
- **Button Click Tracking**: Tracks "Get Started" and other important button clicks
- **Survey Progress Tracking**: Tracks survey start, progress, completion, and abandonment
- **Checkout Flow Tracking**: Tracks checkout initiation, payment info entry, and completion
- **Session Context**: All events include session ID, landing page info, and flow type

## Architecture

### Core Components

1. **`helpers/hotjarTracking.ts`**: Central helper module with all tracking functions
2. **`components/HotjarTracker.tsx`**: Client-side component for automatic tracking
3. **`modules/home/RootLayoutScripts.tsx`**: Hotjar initialization script
4. **`app/layout.tsx`**: Root layout that includes the HotjarTracker component

### Data Persistence

- **Session Storage**: Used to store landing page information throughout the session
  - `hotjar_landing_page`: The URL path where user first landed
  - `hotjar_landing_page_type`: Type of landing page (landing, ad_landing_page, main_website, etc.)
  - `hotjar_landing_timestamp`: Timestamp of first page load
  - `hotjar_session_id`: Unique session identifier
  - `hotjar_last_page`: Last visited page

## Automatic Tracking

### 1. Landing Page Detection

The system automatically detects when a user first arrives at the site and stores:

- Landing page URL
- Landing page type (home, ad, etc.)
- Referrer information
- Timestamp

```typescript
// Automatically initialized on first page load
initializeLandingPage();
```

### 2. Page View Tracking

Every page navigation is automatically tracked with:

- Page name and path
- Page type (landing, survey, checkout, etc.)
- Landing page context
- Flow parameter (if present)
- All URL parameters

```typescript
// Automatically called on every route change
trackPageView();
```

### 3. Button Click Tracking

Buttons with `data-tracking-id` attributes are automatically tracked:

```html
<!-- Example: Get Started button -->
<button data-tracking-id="get-started-hero">Get Started</button>

<!-- Example: Survey button -->
<button data-tracking-id="survey-weight-loss">Take Survey</button>

<!-- Example: Product selection -->
<button data-tracking-id="product-olympia-plan">Select Plan</button>
```

The system automatically detects and tracks clicks on buttons with tracking IDs starting with:

- `get-started-*`
- `survey-*`
- `product-*`

### 4. Survey Progress Tracking

Survey tracking is automatically integrated into the `PatientIntakeSurvey` component:

- **Survey Start**: Tracked when survey questions are loaded
- **Progress**: Tracked on every step change
- **Completion**: Tracked when survey is submitted
- **Abandonment**: Tracked when user leaves survey page or closes browser

```typescript
// Automatically tracked in survey component
trackSurveyStart('patient_intake_survey', category);
trackSurveyStep('patient_intake_survey', currentStep, stepName, totalSteps);
trackSurveyComplete('patient_intake_survey', totalSteps);
trackSurveyAbandoned('patient_intake_survey', currentStep, reason);
```

### 5. Checkout Flow Tracking

Checkout tracking is automatically integrated:

- **Checkout Initiated**: Tracked when checkout page loads
- **Checkout Completed**: Tracked on successful payment

```typescript
// Automatically tracked in checkout components
trackCheckoutInitiated([productId], totalValue);
trackCheckoutCompleted([productId], totalValue);
```

## Manual Tracking

### Custom Events

You can track custom events anywhere in the application:

```typescript
import { trackCustomEvent } from '@/helpers/hotjarTracking';

// Track a custom event
trackCustomEvent('button_clicked', {
  buttonName: 'Special Offer',
  offerType: 'discount',
});
```

### Button Clicks

For buttons not automatically tracked:

```typescript
import { trackButtonClick } from '@/helpers/hotjarTracking';

function handleClick() {
  trackButtonClick({
    buttonId: 'custom-button',
    buttonText: 'Click Me',
    destination: '/special-page',
  });
}
```

### Page Views

For custom page view tracking:

```typescript
import { trackPageView } from '@/helpers/hotjarTracking';

trackPageView({
  pageName: 'Custom Page',
  pagePath: '/custom-page',
  pageType: 'main_website',
  customData: 'value',
});
```

## Event Types

### Page View Events

- `page_view`: General page view with all context

### Button Click Events

- `button_click`: General button click
- `get_started_click`: Specific "Get Started" button clicks

### Survey Events

- `survey_started`: Survey initiation
- `survey_progress`: Survey step progress
- `survey_completed`: Survey completion
- `survey_abandoned`: Survey abandonment

### Checkout Events

- `checkout_initiated`: Checkout flow started
- `checkout_payment_info`: Payment information entered
- `checkout_completed`: Purchase completed

## Event Data Structure

All events include:

```typescript
{
  // Event identification
  eventName: string,

  // Page context
  pageName: string,
  pagePath: string,
  pageType: string,

  // Session context
  sessionId: string,
  landingPage: string,
  landingPageType: string,

  // User journey
  flow: string, // 'product_first' or 'survey_first'

  // Timestamp
  timestamp: number,

  // Additional custom data
  ...customData
}
```

## Usage Examples

### Example 1: Track Custom Button Click

```typescript
'use client';

import { trackButtonClick } from '@/helpers/hotjarTracking';

export default function CustomButton() {
  const handleClick = () => {
    trackButtonClick({
      buttonId: 'pricing-cta',
      buttonText: 'View Pricing',
      destination: '/pricing',
    });

    // Your navigation logic
    router.push('/pricing');
  };

  return <button onClick={handleClick}>View Pricing</button>;
}
```

### Example 2: Track Form Submission

```typescript
import { trackCustomEvent } from '@/helpers/hotjarTracking';

async function handleSubmit(formData) {
  try {
    // Submit form
    await submitForm(formData);

    // Track success
    trackCustomEvent('form_submitted', {
      formType: 'contact',
      success: true,
    });
  } catch (error) {
    // Track error
    trackCustomEvent('form_submitted', {
      formType: 'contact',
      success: false,
      error: error.message,
    });
  }
}
```

### Example 3: Track Modal Open

```typescript
import { trackCustomEvent } from '@/helpers/hotjarTracking';

function openModal() {
  trackCustomEvent('modal_opened', {
    modalType: 'appointment_booking',
  });

  setModalOpen(true);
}
```

## Flow Types

The system tracks two main user flows:

1. **Survey First (SFA)**: User takes survey → sees products → checkout
2. **Product First (PFA)**: User selects product → takes survey → checkout

Flow is determined by the `flow` URL parameter:

- `flow=sfa` → Survey First
- `flow=pfa` → Product First
- Default: Survey First

## Landing Page Types

Automatically detected based on pathname:

- `landing`: Homepage (`/`)
- `ad_landing_page`: Ad campaign pages (`/ad/*`)
- `survey`: Survey pages (`/survey/*`, `/general-survey/*`, `/intake-form`)
- `product_selection`: Product pages (`/products/*`)
- `checkout`: Checkout pages (`/checkout/*`)
- `checkout_success`: Checkout success page
- `main_website`: Other pages

## Debugging

### Console Logging

All tracking functions log to console with prefix `🔥 Hotjar`:

```javascript
// Example console output
🔥 Hotjar - Landing page initialized: {
  landingPage: '/ad/weight-loss',
  landingPageType: 'ad_landing_page',
  pageName: 'weight-loss',
  flow: 'survey_first',
  referrer: 'https://google.com'
}

🔥 Hotjar - Button click tracked: {
  trackingId: 'get-started-hero',
  buttonText: 'Get Started',
  pageType: 'ad_landing_page',
  pageName: 'weight-loss',
  flowType: 'survey_first'
}
```

### Verify Tracking

To verify tracking is working:

1. Open browser console
2. Navigate through the site
3. Look for `🔥 Hotjar` log messages
4. Check Hotjar dashboard for events

### Clear Session Data

To test fresh landing page detection:

```javascript
// In browser console
import { clearLandingPageInfo } from '@/helpers/hotjarTracking';
clearLandingPageInfo();
```

Or manually:

```javascript
sessionStorage.removeItem('hotjar_landing_page');
sessionStorage.removeItem('hotjar_landing_page_type');
sessionStorage.removeItem('hotjar_landing_timestamp');
sessionStorage.removeItem('hotjar_session_id');
```

## Best Practices

1. **Always use `data-tracking-id` for important buttons**: This ensures automatic tracking

   ```html
   <button data-tracking-id="get-started-[location]">Get Started</button>
   ```

2. **Use descriptive tracking IDs**: Make them easy to find in analytics

   ```html
   ✅ data-tracking-id="get-started-hero-section" ❌ data-tracking-id="btn1"
   ```

3. **Track important user actions**: Don't overtrack, focus on conversion-critical events

4. **Include context**: Always provide relevant context in custom events

   ```typescript
   trackCustomEvent('video_played', {
     videoTitle: 'How It Works',
     videoDuration: 120,
     location: 'hero-section',
   });
   ```

5. **Test in staging**: Always verify tracking in staging before deploying

## Troubleshooting

### Issue: Events not showing in Hotjar

**Solutions:**

1. Check browser console for `🔥 Hotjar` messages
2. Verify Hotjar script is loaded (check Network tab)
3. Ensure `window.hj` is defined
4. Check Hotjar ID is correct (6548722)

### Issue: Landing page not persisting

**Solutions:**

1. Check sessionStorage is enabled
2. Verify `initializeLandingPage()` is called
3. Check browser console for initialization message

### Issue: Button clicks not tracked

**Solutions:**

1. Ensure button has `data-tracking-id` attribute
2. Check button ID starts with `get-started-`, `survey-`, or `product-`
3. Verify HotjarTracker component is mounted
4. Check browser console for tracking messages

## Analytics Insights

With this tracking system, you can analyze:

1. **Conversion Funnels**:

   - Landing → Survey Start → Survey Complete → Checkout → Purchase
   - Landing → Product Selection → Checkout → Purchase

2. **Drop-off Points**:

   - Which survey questions cause abandonment
   - Where in checkout users leave
   - Which landing pages have highest drop-off

3. **User Behavior**:

   - Most effective landing pages
   - Most clicked "Get Started" buttons
   - Survey completion rates by source

4. **A/B Testing**:
   - Compare flows (SFA vs PFA)
   - Compare landing pages
   - Test button placements

## Support

For issues or questions about Hotjar tracking:

1. Check this documentation
2. Check browser console for error messages
3. Review Hotjar dashboard
4. Contact development team

---

**Last Updated**: October 2024
**Hotjar Site ID**: 6548722
**Version**: 1.0
