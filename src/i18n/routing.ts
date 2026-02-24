import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The locale prefix for URLs
  localePrefix: 'always', // Always show locale in URL (e.g., /en/about, /es/about)

  // Optional: Pathname that redirects to default locale when no locale is in path
  pathnames: {
    '/': '/',
    '/ad/med-spa1': '/ad/med-spa1',
    '/ad/med-spa2': '/ad/med-spa2',
    '/ad/med-spa3': '/ad/med-spa3',
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
