# Quick Reference: Configuration System

## Import and Use Config

```typescript
import { config } from '@/config';
```

## Common Usage

### Site & API

```typescript
config.site.url; // Site URL
config.api.baseUrl; // API base URL
```

### Trustpilot

```typescript
config.trustpilot.businessUnitId; // Business unit ID
config.trustpilot.reviewUrl; // Review page URL
config.trustpilot.scriptUrl; // Widget script URL
```

### Analytics

```typescript
config.analytics.facebookPixelId; // Facebook Pixel
config.analytics.googleAnalyticsId; // Google Analytics
config.analytics.hotjarId; // Hotjar
config.analytics.gtmId; // Google Tag Manager
config.analytics.microsoftUetId; // Microsoft UET
```

### Firebase

```typescript
config.firebase.apiKey; // Firebase API key
config.firebase.projectId; // Firebase project ID
```

### Environment

```typescript
config.env.isDevelopment; // true in development
config.env.isProduction; // true in production
config.indexing.allowIndexing; // SEO indexing control
```

## Translations

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('trustpilot');
t('title'); // "Trusted by Thousands"
t('linkText'); // "Trustpilot"
t('viewAllReviews'); // "View all reviews"
```

## Environment Variables

All config values can be overridden with environment variables.
See `docs/CONFIG_SETUP.md` for complete list.

### Quick Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://api-staging.lumimeds.com/api
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id
```

## Documentation

- 📖 **Full Guide**: `docs/CONFIG_SETUP.md`
- 📋 **Summary**: `docs/CONFIG_IMPLEMENTATION_SUMMARY.md`
- 🔧 **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- 🌟 **Trustpilot**: `docs/TRUSTPILOT_SETUP.md`
