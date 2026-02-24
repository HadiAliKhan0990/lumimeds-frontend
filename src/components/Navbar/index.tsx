'use client';

import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import SaleBanners from '@/components/banners/SaleBanners';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Collapse } from 'react-bootstrap';
import { IoCall } from 'react-icons/io5';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { FaRegUser } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useSubdomain } from '@/hooks/useSubdomain';
import { getTrySubdomain, NON_SALE_PAGES, ROUTES } from '@/constants';
import priceIdsData from '@/data/priceIds.json';


import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import { useTrySubdomainDetection } from '@/hooks/useTrySubdomainDetection';
import '@/styles/landing/navbar.css';

interface Props {
  isBanner?: boolean;
}

export default function Navbar({ isBanner }: Readonly<Props>) {
  const ref = useRef(null);
  const lastScrollY = useRef(0);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations('header');

  const { theme } = useTheme();
  const { windowWidth } = useWindowWidth();
  const subdomain = useSubdomain();
  const { isFlashSaleActive, isGeneralSaleActive } = useBannerVisibility();

  // Starter priceId based on environment - don't show banner on checkout with this
  const starterPriceId = process.env.NEXT_PUBLIC_ENV === 'production'
    ? priceIdsData?.production?.glp1_gip_3m_starter
    : priceIdsData?.staging?.glp1_gip_3m_starter;
  // Check if on checkout page with starter priceId
  const isCheckoutPage = pathname.startsWith(ROUTES.CHECKOUT);
  const priceId = searchParams.get('priceId');
  const isStarterCheckout = isCheckoutPage && priceId === starterPriceId; //its hotfix and can be removed after it has served its purpose

  // Check if banner should show (not on login pages, not on starter checkout, and sale is active)
  const hasBanner = !NON_SALE_PAGES.includes(pathname) && !isStarterCheckout && (isFlashSaleActive || isGeneralSaleActive);

  // Use custom hook for try subdomain detection (handles both server-side and client-side)
  const isTrySubdomain = useTrySubdomainDetection();

  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser, surveyCategory } = checkout || {};

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If on try subdomain, redirect to main domain
    const trySubdomain = getTrySubdomain();
    if (subdomain === trySubdomain && typeof window !== 'undefined') {
      e.preventDefault();
      const hostname = window.location.hostname;
      let mainDomain: string;

      if (hostname === 'try.localhost' || hostname.endsWith('.localhost')) {
        const port = window.location.port || '3000';
        mainDomain = `http://localhost:${port}`;
      } else {
        // Use NEXT_PUBLIC_SITE_URL from environment variable
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (baseUrl) {
          try {
            const url = new URL(baseUrl);
            mainDomain = `${url.protocol}//${url.host}`;
          } catch {
            // If baseUrl is invalid, fallback to removing try subdomain from current origin
            mainDomain = window.location.origin.replace(/^https?:\/\/try(-staging)?\./, 'https://');
          }
        } else {
          // Fallback: remove try subdomain from current origin
          mainDomain = window.location.origin.replace(/^https?:\/\/try(-staging)?\./, 'https://');
        }
      }

      window.location.href = mainDomain + '/';
    }
  };

  function handleClose() {
    setOpen(false);
  }

  const handleScroll = () => {
    if (typeof window === 'undefined') return;

    const currentScrollY = window.scrollY;

    setIsScrolled(currentScrollY > 50);

    if (currentScrollY < 50) {
      setShowNavbar(true);
    } else if (currentScrollY > lastScrollY.current) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }

    lastScrollY.current = currentScrollY;
  };

  const handleGetStarted = async () => {
    if (pathname.startsWith('/ad')) {
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product: selectedProduct,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
        surveyCategory,
      });
      return;
    }

    // Otherwise, route to /products
    startTransition(() => router.push('/products'));
  };

  useOutsideClick({
    ref,
    handler: handleClose,
  });

  useEffect(() => {
    handleClose();
  }, [pathname]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSeasonalTheme = theme === 'thanksgiving';
  const isChristmasTheme = theme === 'christmas';
  // const isHomePage = pathname === '/';
  const isDarkLike = theme === 'dark' || isSeasonalTheme;
  const navBackgroundClass = theme === 'dark' ? 'bg-black' : isSeasonalTheme ? 'tw-bg-[#BA785A]' : 'bg-light';
  const collapseBackgroundClass =
    isDarkLike && windowWidth < 992 ? (theme === 'dark' ? 'bg-dark' : 'tw-bg-[#BA785A]') : '';
  const textColorClass = isDarkLike ? ' text-white' : '';

  const isStarterPackPage = pathname.includes('/ad/starter-pack');

  return (
    <nav
      ref={ref}
      className={`${navBackgroundClass} navbar navbar-expand-lg flex-column !tw-pt-0 ${
        hasBanner ? 'lg:tw-fixed tw-relative' : 'position-fixed'
      } ${showNavbar ? '' : ' navbar--hidden'} ${isBanner && !isScrolled ? 'lg:!tw-top-14 !tw-top-10' : ''} ${
        isChristmasTheme ? 'navbar-christmas' : ''
      } ${isStarterPackPage ? 'lg:!tw-mt-[-58px] sm:!tw-mt-[-40px] tw-mt-[-40px]' : ''}`}
    >
      {/* Sale Banner - above navbar content (hidden on login pages and starter checkout) */}
      {!NON_SALE_PAGES.includes(pathname) && !isStarterCheckout && <SaleBanners showTopBanner />}

      <div className='container nav-header-container position-relative py-3 flex-nowrap navbar-for-mobile gap-1'>
        <div className='d-flex flex-column d-lg-flex d-none'>
          <a
            href='tel:+14159680890'
            className={
              (isDarkLike ? 'text-white ' : 'text-dark ') +
              'question-num d-lg-flex d-none align-items-center gap-2 fw-bold text-decoration-none'
            }
          >
            <IoCall size={16} />
            (415) 968-0890
          </a>
          {/* <span className='availablity-desc'>
            <span className='fw-bold'>Mon–Fri:</span> 7 AM–7 PM PST | <span className='fw-bold'>Sat–Sun:</span> 8 AM–4
            PM PST
          </span> */}
        </div>
        <div className='d-flex flex-column align-items-start d-lg-none'>
          <Link href='/' className='logo-link' onClick={handleHomeClick}>
            <Image src={Logo} quality={100} alt='LumiMeds' className={isDarkLike ? 'tw-brightness-0 tw-invert' : ''} />
          </Link>
          {/* <div className='availablity-desc' style={{ fontSize: '12px', marginTop: '8px', whiteSpace: 'nowrap' }}>
            <div>
              <span className='fw-bold'>Mon–Fri:</span> 7 AM–7 PM PST
            </div>
            <div>
              <span className='fw-bold'>Sat–Sun:</span> 8 AM–4 PM PST
            </div>
          </div> */}
        </div>
        <Link href='/' className='logo-link d-none d-lg-block' onClick={handleHomeClick}>
          <Image src={Logo} quality={100} alt='LumiMeds' className={isDarkLike ? 'tw-brightness-0 tw-invert' : ''} />
        </Link>
        <Collapse in={open}>
          <div
            className={`navbar-collapse navbar-resp align-items-center flex-grow-0 ${collapseBackgroundClass}`}
            id='navbarNav'
          >
            <div className='navbar-nav gap-lg-4 align-items-lg-center'>
              {!isTrySubdomain && (
                <>
                  <Link href='/products' className={'nav-link text-base p-lg-0' + textColorClass}>
                    {t('medications')}
                  </Link>
                  <Link href='/faqs' className={'nav-link text-base p-lg-0' + textColorClass}>
                    FAQs
                  </Link>
                </>
              )}
              <button
                onClick={handleGetStarted}
                disabled={isPending}
                className={'nav-link text-base w-100 p-lg-0' + textColorClass}
                data-tracking-id='get-started-navbar'
              >
                {t('getStarted')}
              </button>
              {!isTrySubdomain && (
                <>
                  <Link
                    href='/patient/login'
                    className={'nav-link text-base p-lg-0 d-none d-lg-block' + textColorClass}
                  >
                    <FaRegUser />
                  </Link>
                  <Link
                    href='/patient/login'
                    className={'nav-link text-base p-lg-0 d-block d-lg-none' + textColorClass}
                  >
                    {t('login')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </Collapse>

        <div className='d-flex d-lg-none align-items-center justify-content-end w-100'>
          <div className='d-flex flex-column align-items-start contact-q'>
            <span className={`fw-medium text-lg${textColorClass}`}>{t('questions')}</span>
            <a
              href='tel:+14159680890'
              className={
                (theme === 'dark' ? 'text-white ' : 'text-dark ') +
                'question-num d-flex align-items-center gap-2 fw-bold text-decoration-none'
              }
            >
              (415) 968-0890
            </a>
          </div>
          <div className='d-lg-none'>
            <input type='checkbox' id='checkbox' hidden checked={open} onChange={(e) => setOpen(e.target.checked)} />
            <label htmlFor='checkbox' className='toggle'>
              <div className={`bars ${isDarkLike ? 'bg-white' : ''}`} id='bar1' />
              <div className={`bars ${isDarkLike ? 'bg-white' : ''}`} id='bar2' />
              <div className={`bars ${isDarkLike ? 'bg-white' : ''}`} id='bar3' />
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
}
