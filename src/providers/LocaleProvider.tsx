'use client';

import { NextIntlClientProvider } from 'next-intl';
import { PropsWithChildren, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface LocaleProviderProps extends PropsWithChildren {
  defaultMessages: Record<string, string>;
  defaultLocale: string;
}

export function LocaleProvider({ children, defaultMessages, defaultLocale }: Readonly<LocaleProviderProps>) {
  const pathname = usePathname();
  const [messages, setMessages] = useState(defaultMessages);
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    // Detect locale from pathname
    let detectedLocale = defaultLocale;

    // Check for locale prefix in pathname (e.g., /es/...)
    const localeRegex = /^\/(en|es)(\/|$)/;
    const localeMatch = localeRegex.exec(pathname);
    if (localeMatch) {
      detectedLocale = localeMatch[1];
    }

    // Only update if locale changed
    if (detectedLocale === locale) {
      return;
    }

    setLocale(detectedLocale);

    // Fetch messages for the detected locale
    if (detectedLocale === defaultLocale) {
      setMessages(defaultMessages);
    } else {
      // Dynamically import the messages
      import(`../../messages/${detectedLocale}.json`)
        .then((module) => {
          setMessages(module.default);
        })
        .catch((error) => {
          console.error(`Failed to load messages for locale: ${detectedLocale}`, error);
          // Fallback to default messages
          setMessages(defaultMessages);
        });
    }
  }, [pathname, locale, defaultLocale, defaultMessages]);

  return (
    <NextIntlClientProvider messages={messages} timeZone='America/New_York' locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
