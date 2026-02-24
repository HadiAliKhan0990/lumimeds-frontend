# Quick Start Guide - New Translation System

## 🚀 How to Test

### 1. Start Development Server

```bash
pnpm dev
```

### 2. Visit the Localized Pages

- **English:** http://localhost:3000/en/ad/med-spa3
- **Spanish:** http://localhost:3000/es/ad/med-spa3

## 📝 Translation Usage

### In Components:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('medSpa3');

  return <h1>{t('hero.title.medSpaPrices')}</h1>;
}
```

### Available Translation Keys:

```
medSpa3.hero.title.medSpaPrices
medSpa3.hero.title.gotYou
medSpa3.hero.title.stressed
medSpa3.hero.description.line1
medSpa3.hero.description.line2
medSpa3.analytics.success
medSpa3.analytics.journeys
medSpa3.analytics.online
medSpa3.products.glp1Gip.title
medSpa3.products.glp1Gip.subtitle
medSpa3.products.glp1.title
medSpa3.products.glp1.subtitle
medSpa3.products.glp1.valueBadge
medSpa3.buttonText
medSpa3.priceMonthSuffix
medSpa3.badges.starter
medSpa3.badges.bestValue
medSpa3.badges.monthly
medSpa3.noProductsMessage
```

## 🌍 Adding a New Language

### 1. Create translation file:

```bash
# Create messages/fr.json for French
```

### 2. Add locale to routing:

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['en', 'es', 'fr'], // Add 'fr'
  defaultLocale: 'en',
  //...
});
```

### 3. Route will automatically work:

- `/fr/ad/med-spa3`

## 📁 Key Files

### Translation Files:

- `messages/en.json` - English
- `messages/es.json` - Spanish

### Configuration:

- `src/i18n/routing.ts` - Routing config
- `src/i18n/request.ts` - Server config
- `next.config.ts` - next-intl plugin

### Localized Pages:

- `src/app/[locale]/ad/med-spa3/page.tsx`
- `src/app/[locale]/layout.tsx`

## ✅ Verification Commands

```bash
# TypeScript check
npx tsc --noEmit --skipLibCheck

# Build without lint
npx next build --no-lint

# Lint check
npx next lint

# Start dev server
pnpm dev
```

## 🎯 What Changed

### Before:

- `.jsx` files with no type safety
- Root directory structure
- No translation system
- Single language only

### After:

- `.tsx` files with full TypeScript
- `src/` directory structure
- `next-intl` for i18n
- `/en/` and `/es/` routes
- Proper type safety throughout

## 🔗 Routes

| URL               | Language              | Status                   |
| ----------------- | --------------------- | ------------------------ |
| `/en/ad/med-spa3` | English               | ✅ Working               |
| `/es/ad/med-spa3` | Spanish               | ✅ Working               |
| `/ad/med-spa3`    | (redirects to locale) | ✅ Handled by middleware |

## 💡 Tips

1. **Always use `t()` function** for user-facing text
2. **Assets** are in `src/assets/` - import with `@/assets/...`
3. **Public files** stay in `/public/` - reference with `/filename.jpg`
4. **Add new locales** in `src/i18n/routing.ts` and create message file
5. **TypeScript** is fully configured - VS Code will show errors

---

**Migration Status:** ✅ COMPLETE AND VERIFIED
