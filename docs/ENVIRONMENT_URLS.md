# Environment-Based URL Configuration

This document explains how to configure environment-based URLs for sitemap and robots.txt.

## The Problem

Previously, sitemap and robots.txt were using `request.nextUrl.origin` which resulted in:

- **Development:** `http://localhost:3000`
- **Production:** Should be `https://www.lumimeds.com`

## The Solution

We now use the `NEXT_PUBLIC_SITE_URL` environment variable to set the correct base URL for each environment.

## Environment Variables Setup

### Development (.env.local)

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ALLOW_INDEXING=false
```

### Staging (.env.staging)

```bash
NEXT_PUBLIC_SITE_URL=https://staging.lumimeds.com
NEXT_PUBLIC_ALLOW_INDEXING=false
```

### Production (.env.production)

```bash
NEXT_PUBLIC_SITE_URL=https://www.lumimeds.com
NEXT_PUBLIC_ALLOW_INDEXING=true
```

## Files Updated

### 1. Sitemap (`app/lumimed-sitemap.xml/route.ts`)

```typescript
// Before
const baseUrl = request.nextUrl.origin;

// After
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
```

### 2. Robots.txt (`app/robots.txt/route.ts`)

```typescript
// Before
Sitemap: ${request.nextUrl.origin}/lumimed-sitemap.xml

// After
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
Sitemap: ${baseUrl}/lumimed-sitemap.xml
```

## Benefits

1. **Environment-Specific URLs**: Each environment uses its correct domain
2. **SEO-Friendly**: Production sitemap shows correct production URLs
3. **Fallback Support**: Falls back to request origin if env var not set
4. **Consistent**: Same pattern used across sitemap and robots.txt

## Testing

1. **Check sitemap**: Visit `/lumimed-sitemap.xml` to see URLs
2. **Check robots.txt**: Visit `/robots.txt` to see sitemap URL
3. **Environment**: Verify correct domain is used in each environment

## Deployment

- **Development**: Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- **Staging**: Set `NEXT_PUBLIC_SITE_URL=https://staging.lumimeds.com`
- **Production**: Set `NEXT_PUBLIC_SITE_URL=https://www.lumimeds.com`

This ensures your sitemap and robots.txt always use the correct domain for each environment.
