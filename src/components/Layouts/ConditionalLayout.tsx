'use client';

import Navbar from '@/components/Navbar';
import BaseLayout from '@/components/Layouts/BaseLayout';
import Footer from '@/components/Footer';
import NextTopLoader from 'nextjs-toploader';
import Modal from '@/components/Dashboard/modals';
import { Topbar as GoogleShoppingTopbar } from '@/components/Ads/GoogleShopping/includes/Topbar';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { isPublicRoute } from '@/lib/helper';
import { JOB_JOTFORM_SCRIPT_SRC, JOB_JOTFORM_TITLE, ROUTES } from '@/constants';
import { PropsWithChildren, Suspense, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FooterProvider } from '@/contexts/FooterContext';
import { BannerAwareWrapper } from '@/components/banners/includes/BannerAwareWrapper';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';

export default function ConditionalLayout({ children }: Readonly<PropsWithChildren>) {
  const pathname = usePathname();
    const { isGoogleMerchant, isTrySubdomain } = useGoogleMerchantConfig();

  const isPortalPage =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/provider') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/impersonate');

  const hideNavAndFooter =
    pathname.includes(ROUTES.PROVIDER_SURVEY) ||
    pathname.includes(ROUTES.PATIENT_INTAKE) ||
    pathname.includes(ROUTES.GENERAL_SURVEY) ||
    pathname.includes(ROUTES.INTAKE_FORM) ||
    pathname.includes(ROUTES.REFILL_SURVEY) ||
    pathname.includes(ROUTES.LONGEVITY_PATIENT_INTAKE) ||
    (isTrySubdomain && (
      pathname.includes('/ad/google-shopping') ||
      pathname.includes('/ad/starter-pack')
    )) ||
    (isGoogleMerchant && (
      pathname.includes('/ad/product-summary')
    ));

  const isGoogleShoppingPage = pathname.includes('/ad/starter-pack');

  useEffect(() => {
    if (pathname !== ROUTES.CAREER_JOBS) {
      document.querySelector(`script[src="${JOB_JOTFORM_SCRIPT_SRC}"]`)?.remove();
      document.querySelector(`iframe[title="${JOB_JOTFORM_TITLE}"]`)?.remove();
    }
  }, [pathname]);

  return (
    <Provider store={store}>
      <FooterProvider>
        <ThemeProvider>
          <NextTopLoader color={'#3060fe'} showSpinner={false} />

          {!isPortalPage || isPublicRoute(pathname) ? (
            <>
              {isGoogleShoppingPage && <GoogleShoppingTopbar />}

              {!hideNavAndFooter && <Navbar isBanner={isGoogleShoppingPage} />}
              <BaseLayout>
                <Suspense
                  fallback={
                    <div
                      className={
                        'd-flex flex-column flex-grow-1 bg-light ' + (hideNavAndFooter ? 'tw-pt-6 md:tw-pt-16' : '')
                      }
                    >
                      {children}
                    </div>
                  }
                >
                  <BannerAwareWrapper hideNavAndFooter={hideNavAndFooter} pathname={pathname} isGoogleShoppingPage={isGoogleShoppingPage}>
                    {children}
                  </BannerAwareWrapper>
                </Suspense>
              </BaseLayout>
              {!isPublicRoute(pathname) && !hideNavAndFooter && pathname !== ROUTES.CAREER_JOBS && <Footer />}
            </>
          ) : (
            children
          )}
        </ThemeProvider>
      </FooterProvider>

      <Modal />
    </Provider>
  );
}
