# HubSpot Tracking Implementation Guide

## Overview

This document explains how HubSpot tracking has been implemented in the LumiMeds website and how to configure it for your environment.

## What's Been Implemented

### 1. HubSpot Tracking Script

- **Location**: `src/components/HubSpotTracker.tsx`
- **Integration**: Added to `src/components/RootLayoutScripts.tsx`
- **Features**:
  - Automatic page view tracking
  - Custom event tracking
  - User identification
  - Form submission tracking
  - TypeScript support

### 2. Environment Configuration

- **Variable**: `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- **Documentation**: Updated `docs/ENVIRONMENT_SETUP.md`
- **Required**: Yes, for tracking to work

### 3. TypeScript Support

- **Types**: Proper TypeScript declarations for HubSpot tracking
- **Helper Functions**: Pre-built functions for common tracking scenarios
- **Error Handling**: Graceful fallbacks when HubSpot is not available

## Setup Instructions

### Step 1: Get Your HubSpot Portal ID

1. **Log into your HubSpot account**
2. **Click the Settings gear icon** (top right corner)
3. **Navigate to**: Account Setup → Account Defaults
4. **Find your Portal ID** (it's a number like 12345678)
5. **Copy this number** - you'll need it for the next step

### Step 2: Add Environment Variable

#### For Local Development

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244175540
```

#### For Production/Staging

Add the environment variable to your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other platforms**: Add to your deployment environment

### Step 3: Verify Implementation

1. **Start your development server**: `npm run dev`
2. **Open browser console** and look for HubSpot tracking logs
3. **Check HubSpot dashboard** for incoming traffic data

## How It Works

### Automatic Tracking

The HubSpot tracking script automatically:

- Tracks page views on all pages
- Loads asynchronously to not impact page performance
- Handles errors gracefully if HubSpot is unavailable

### Manual Tracking

You can also track custom events in your code:

```typescript
import { hubspotTrack } from '@/components/HubSpotTracker';

// Track button clicks
hubspotTrack.trackEvent('button_click', {
  button_name: 'signup',
  page: 'homepage',
});

// Identify users
hubspotTrack.identify('user@example.com', {
  name: 'John Doe',
  plan: 'premium',
});

// Track form submissions
hubspotTrack.trackFormSubmission('contact_form', {
  source: 'homepage',
  form_type: 'inquiry',
});
```

## Integration with Existing Systems

### HubSpot API Integration

The website already has HubSpot API integration for:

- Contact creation (`src/store/slices/hubspotApiSlice.ts`)
- Email consent tracking
- Patient data synchronization

The tracking implementation complements this by:

- Providing website behavior analytics
- Tracking user journeys
- Enabling lead scoring based on website activity

### Other Tracking Systems

HubSpot tracking works alongside existing tracking:

- **Facebook Pixel**: For social media advertising
- **Google Tag Manager**: For comprehensive analytics
- **Reddit & LinkedIn**: For platform-specific tracking

## Testing

### Local Testing

1. **Set up environment variable** with your Portal ID
2. **Start development server**: `npm run dev`
3. **Open browser console** and navigate through pages
4. **Look for HubSpot tracking logs** in console
5. **Check HubSpot dashboard** for incoming data

### Production Testing

1. **Deploy with environment variable** set
2. **Visit your live website**
3. **Check HubSpot dashboard** for real-time data
4. **Verify tracking events** are being recorded

## Troubleshooting

### Common Issues

#### 1. HubSpot Not Loading

**Symptoms**: No HubSpot tracking logs in console
**Solution**:

- Verify `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` is set correctly
- Check that the Portal ID is valid
- Ensure environment variable is available in browser

#### 2. Tracking Events Not Appearing

**Symptoms**: Page views tracked but custom events missing
**Solution**:

- Check that `hubspotTrack` functions are called correctly
- Verify HubSpot script has loaded before calling tracking functions
- Check browser console for JavaScript errors

#### 3. Duplicate Tracking

**Symptoms**: Multiple tracking calls for same events
**Solution**:

- Ensure HubSpot script is only loaded once
- Check for multiple instances of HubSpotTracker component
- Verify environment variable is not duplicated

### Debug Mode

Enable debug logging by checking browser console for:

- `=== HUBSPOT TRACKING SCRIPT STARTED ===`
- `HubSpot tracking script loaded successfully`
- Any error messages related to HubSpot

## Advanced Configuration

### Custom Event Tracking

You can track any custom events by importing the helper functions:

```typescript
import { hubspotTrack } from '@/components/HubSpotTracker';

// Track e-commerce events
hubspotTrack.trackEvent('purchase', {
  value: 99.99,
  currency: 'USD',
  product: 'GLP-1 Plan',
});

// Track user engagement
hubspotTrack.trackEvent('video_play', {
  video_title: 'How GLP-1 Works',
  duration: 120,
});
```

### User Identification

Identify users for better lead tracking:

```typescript
// When user logs in
hubspotTrack.identify('user@example.com', {
  first_name: 'John',
  last_name: 'Doe',
  plan_type: 'premium',
  signup_date: '2024-01-15',
});
```

## Support

If you encounter issues with HubSpot tracking:

1. **Check the browser console** for error messages
2. **Verify environment variables** are set correctly
3. **Test with a simple page** to isolate issues
4. **Contact HubSpot support** if tracking data isn't appearing in dashboard

## Next Steps

After implementing HubSpot tracking:

1. **Set up HubSpot workflows** based on website behavior
2. **Create lead scoring** based on page visits and interactions
3. **Set up automated follow-ups** for high-value actions
4. **Monitor conversion rates** and optimize based on data

---

**Note**: This implementation follows HubSpot's official tracking code guidelines and is optimized for Next.js applications with TypeScript support.
