# HubSpot Quick Setup Guide

## HubSpot Portal ID Setup

**Current Test ID:** 244175540 (for development/testing)  
**Client's ID:** To be provided by client

## 🚀 Quick Setup Steps

### 1. For Local Development

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244175540
```

### 2. For Production/Staging

Add this environment variable to your hosting platform:

**Variable Name:** `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`  
**Variable Value:** `CLIENT_HUBSPOT_PORTAL_ID` (to be provided by client)

#### Platform-specific instructions:

- **Vercel**: Project Settings → Environment Variables → Add New
- **Netlify**: Site Settings → Environment Variables → Add Variable
- **Other platforms**: Add to your deployment environment variables

### 3. Test the Implementation

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Open browser console** and look for:

   ```
   === HUBSPOT TRACKING SCRIPT STARTED ===
   HubSpot tracking script loaded successfully
   ```

3. **Check your HubSpot dashboard** for incoming traffic data

## ✅ What's Already Implemented

- ✅ HubSpot tracking script added to your website
- ✅ Automatic page view tracking on all pages
- ✅ Custom event tracking capabilities
- ✅ User identification functions
- ✅ Form submission tracking
- ✅ TypeScript support with proper types

## 🔧 Using HubSpot Tracking in Your Code

```typescript
import { hubspotTrack } from '@/components/HubSpotTracker';

// Track button clicks
hubspotTrack.trackEvent('button_click', {
  button_name: 'signup',
  page: 'homepage',
});

// Identify users when they log in
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

## 🎯 Next Steps

### For Development (Current)

1. **Use the test Portal ID** (244175540) for local development
2. **Test the implementation** to ensure everything works
3. **Verify tracking** in your HubSpot dashboard

### For Client (Production)

1. **Client provides their HubSpot Portal ID**
2. **Add the client's Portal ID** to production environment variables
3. **Deploy with client's Portal ID**
4. **Client checks their HubSpot dashboard** for incoming data
5. **Client sets up HubSpot workflows** based on website behavior

## 📊 Expected Results

Once implemented, you'll see in your HubSpot dashboard:

- Page views from your website
- User interactions and events
- Lead scoring based on website activity
- Conversion tracking for your forms

---

**Development Portal ID:** `244175540` (for testing)  
**Client Portal ID:** To be provided by client
