# Client HubSpot Setup Instructions

## For the Client: How to Set Up HubSpot Tracking

### Step 1: Get Your HubSpot Portal ID

1. **Log into your HubSpot account**
2. **Click the Settings gear icon** (top right corner)
3. **Navigate to**: Account Setup → Account Defaults
4. **Find your Portal ID** (it's a number like 12345678)
5. **Copy this number** and provide it to your developer

### Step 2: Provide Your Portal ID

Send your HubSpot Portal ID to your developer so they can:

- Add it to the production environment variables
- Deploy the tracking code with your Portal ID
- Test the implementation on your live website

### Step 3: Verify HubSpot Tracking

After deployment, you should see in your HubSpot dashboard:

- **Page views** from your website
- **User interactions** and events
- **Lead scoring** based on website activity
- **Conversion tracking** for your forms

### Step 4: Set Up HubSpot Workflows (Optional)

Once tracking is active, you can:

1. **Create lead scoring** based on page visits and interactions
2. **Set up automated follow-ups** for high-value actions
3. **Monitor conversion rates** and optimize based on data
4. **Create targeted campaigns** based on website behavior

## What's Already Implemented

Your website now includes:

- ✅ **Automatic page view tracking** on all pages
- ✅ **Custom event tracking** for user interactions
- ✅ **User identification** for logged-in users
- ✅ **Form submission tracking** for contact forms
- ✅ **TypeScript support** with proper type definitions

## Technical Details

- **Environment Variable**: `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- **Implementation**: Integrated with existing tracking systems
- **Performance**: Loads asynchronously to not impact page speed
- **Compatibility**: Works alongside Facebook Pixel, Google Tag Manager, etc.

## Support

If you have any questions about HubSpot tracking:

1. **Check your HubSpot dashboard** for incoming data
2. **Contact your developer** if tracking isn't working
3. **Refer to HubSpot documentation** for advanced features
4. **Test on different pages** to verify tracking is working

---

**Note**: The tracking code is already implemented and ready. You just need to provide your HubSpot Portal ID to complete the setup.
