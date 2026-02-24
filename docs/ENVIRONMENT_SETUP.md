# Environment Variables Setup Guide

## Required Environment Variables

You need to add the following environment variables:

1. `NEXT_PUBLIC_SITE_URL` - to fix the sitemap URLs
2. `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` - for HubSpot tracking functionality
3. `NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES` - allowed S3 bucket hostnames for secure file URL validation (comma-separated)

## Environment Variable Configuration

### For Local Development (.env.local)

```bash
# Site URL for local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# API URL (already configured)
NEXT_PUBLIC_API_URL=https://api-staging.lumimeds.com/api

# HubSpot Portal ID for tracking
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244175540

# Allowed S3 bucket hostnames for file URL validation (comma-separated)
# Used by useSignedFileUrl hook for secure S3 URL validation
NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES=

# Indexing control (false for local development)
NEXT_PUBLIC_ALLOW_INDEXING=false

# Node environment
NODE_ENV=development
```

### For Staging Environment

```bash
# Site URL for staging
NEXT_PUBLIC_SITE_URL=https://staging.lumimeds.com

# API URL (already configured)
NEXT_PUBLIC_API_URL=https://api-staging.lumimeds.com/api

# HubSpot Portal ID for tracking
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244175540

# Allowed S3 bucket hostnames for file URL validation (comma-separated)
# Used by useSignedFileUrl hook for secure S3 URL validation
NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES=

# Indexing control (false for staging)
NEXT_PUBLIC_ALLOW_INDEXING=false

# Product Summary page indexing control (false for staging)
ALLOW_PRODUCT_SUMMARY_INDEXING=false

# Node environment
NODE_ENV=production
```

### For Production Environment

```bash
# Site URL for production
NEXT_PUBLIC_SITE_URL=https://lumimeds.com

# API URL (your production API URL)
NEXT_PUBLIC_API_URL=https://api.lumimeds.com/api

# HubSpot Portal ID for tracking
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=244175540

# Allowed S3 bucket hostnames for file URL validation (comma-separated)
# Used by useSignedFileUrl hook for secure S3 URL validation
NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES=

# Indexing control (true for production)
NEXT_PUBLIC_ALLOW_INDEXING=true

# Product Summary page indexing control (true for production)
ALLOW_PRODUCT_SUMMARY_INDEXING=true

# Node environment
NODE_ENV=production
```

## S3 URL Validation Setup

### Allowed S3 Hostnames

The `NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES` environment variable is used by the `useSignedFileUrl` hook to securely validate S3 file URLs. This prevents unauthorized file access and path traversal attacks.

**Format**: Comma-separated list of allowed S3 bucket hostnames
**Example**: `example.s3.us-east-2.amazonaws.com,example.s3.us-east-2.amazonaws.com`

### Security Features

- **Domain Validation**: Only URLs from allowed S3 buckets are accepted
- **Path Traversal Protection**: Prevents `../` and other path traversal attacks
- **HTTPS Only**: Only HTTPS URLs are allowed
- **Key Sanitization**: All file keys are sanitized before API requests

### Default Values

If the environment variable is not set, the system falls back to:

- `lumi-stag.s3.us-east-2.amazonaws.com`
- `lumimeds-prod.s3.us-east-2.amazonaws.com`

**Note**: It's recommended to set this variable explicitly in all environments for better security control.

## HubSpot Setup

### Getting Your HubSpot Portal ID

1. **Log into your HubSpot account**
2. **Navigate to Settings** (gear icon in the top right)
3. **Go to Account Setup → Account Defaults**
4. **Find your Portal ID** (it's a number like 12345678)
5. **Add it to your environment variables** as `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`

### HubSpot Tracking Features

The HubSpot tracking implementation includes:

- **Automatic page view tracking** on all pages
- **Custom event tracking** for user interactions
- **User identification** for logged-in users
- **Form submission tracking** for contact forms
- **TypeScript support** with proper type definitions

### Using HubSpot Tracking in Code

```typescript
import { hubspotTrack } from '@/components/HubSpotTracker';

// Track custom events
hubspotTrack.trackEvent('button_click', { button_name: 'signup' });

// Identify users
hubspotTrack.identify('user@example.com', { name: 'John Doe' });

// Track form submissions
hubspotTrack.trackFormSubmission('contact_form', { source: 'homepage' });
```

## How to Add Environment Variables

### Option 1: Create .env.local file

Create a file named `.env.local` in your project root with the local development variables above.

### Option 2: Add to your hosting platform

- **Vercel**: Go to Project Settings → Environment Variables
- **Netlify**: Go to Site Settings → Environment Variables
- **Other platforms**: Add to your deployment environment

### Option 3: Add to your deployment configuration

Add the environment variables to your deployment pipeline or container configuration.

## Testing

After setting the environment variables:

1. **Local Development**: Visit `http://localhost:3000/debug-env`
2. **Staging**: Visit `https://staging.lumimeds.com/debug-env`
3. **Production**: Visit `https://lumimeds.com/debug-env`

Check that `NEXT_PUBLIC_SITE_URL` shows the correct domain for each environment.

## Expected Results

### Staging Sitemap

- URL: `https://staging.lumimeds.com/lumimed-sitemap.xml`
- Should show: `https://staging.lumimeds.com/` in all URLs

### Production Sitemap

- URL: `https://lumimeds.com/lumimed-sitemap.xml`
- Should show: `https://lumimeds.com/` in all URLs

## Current Issue

Your sitemap is showing `https://localhost:3000/` because `NEXT_PUBLIC_SITE_URL` is not set in your staging environment.

**Solution**: Add `NEXT_PUBLIC_SITE_URL=https://staging.lumimeds.com` to your staging environment variables.
