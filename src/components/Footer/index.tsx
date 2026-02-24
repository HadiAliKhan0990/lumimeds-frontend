'use client';

import LogoFooter from '@/assets/logo-footer.png';
import LogoDefault from '@/assets/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import ClockIcon from '@/assets/clock-outline.svg';
import './styles.css';
import { ROUTES } from '@/constants';
import { FaPhone, FaEnvelope, FaLocationDot, FaSquareFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useFooter } from '@/contexts/FooterContext';

export default function Footer() {
  const { theme } = useTheme();

  const { variant } = useFooter();

  const t = useTranslations('footer');

  const isLight = theme === 'light';
  const isThanksgiving = theme === 'thanksgiving';
  const isDark = theme === 'dark';
  const isBlackFriday = theme === 'black-friday-sale';

  const isDosingGuide = variant === 'dosing-guide';

  const Logo = isLight || isDosingGuide || isBlackFriday ? LogoDefault : LogoFooter;

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer
      className={`footer ${isLight ? 'footer-light' : ''} ${isDark ? 'footer-dark' : ''} ${
        isThanksgiving ? 'footer-thanksgiving' : ''
      } ${isBlackFriday ? 'footer-black-friday-sale' : ''} ${isDosingGuide ? 'footer-dosing-guide' : ''}`}
    >
      {/* main Container  */}
      <div className='container'>
        <div className='footer-top container footer-top-padding'>
          {/* Content Container */}
          <div className='row g-4'>
            {/* <!-- start footer column --> */}
            <div className='col-lg-4 me-auto'>
              <Image alt='' className='d-block d-lg-none mb-5 footer-logo-mobile' src={Logo} />

              <Image alt='' className='d-none d-lg-block mb-5 footer-logo-desktop' src={Logo} />
              <p className='text-small m-0'>
                <br />
                {t('disclaimer')}
              </p>
            </div>
            <div className='col-lg-3'>
              <p className='mb-2 footer-section-title'>{t('getInTouch')}</p>
              <div className='d-flex flex-column gap-3'>
                <div className='d-flex align-items-center gap-2'>
                  <FaPhone />
                  <a href={`tel:${t('phone')}`} className='footer-link'>
                    {t('phone')}
                  </a>
                </div>
                <div className='d-flex align-items-center gap-2'>
                  <FaEnvelope />
                  <a href={`mailto:${t('email')}`} className='footer-link'>
                    {t('email')}
                  </a>
                </div>
                <div className='d-flex align-items-center gap-2'>
                  <FaLocationDot />
                  <span>{t('address')}</span>
                </div>
                <div className='d-flex align-items-start gap-2'>
                  <Image src={ClockIcon} alt='Clock' width={18} height={18} style={{ marginTop: '2px' }} />
                  <div>
                    <span className='service-hours-title'>{t('serviceHours')}</span>
                    <div className='d-flex flex-column'>
                      <span>{t('serviceHoursWeekdays')}</span>
                      <span className='tw-text-nowrap'>{t('serviceHoursWeekends')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 text-start'>
              <p className='mb-2 footer-section-title'>{t('quickLinks')}</p>
              <div className='text-white d-flex flex-column gap-3'>
                <Link href={ROUTES.MEMBERSHIP_TERMS} className='footer-link'>
                  {t('membershipTerms')}
                </Link>
                {/* <a
                  href='https://form.jotform.com/252569422886470'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-link'
                >
                  General Inquires
                </a> */}
                <a
                  href='https://form.jotform.com/252221252772046'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-link'
                >
                  {t('pharmacyPartnerships')}
                </a>
                <Link href={ROUTES.CAREER_JOBS} className='footer-link'>
                  {t('careers')}
                </Link>
                <Link href={ROUTES.FAQS} className='footer-link'>
                  {t('faq')}
                </Link>
                <Link href={ROUTES.TERMS_OF_USE} className='footer-link'>
                  {t('termsOfUse')}
                </Link>
                <Link href={ROUTES.PRIVACY_POLICY} className='footer-link'>
                  {t('privacyPolicy')}
                </Link>

                {/* Commented out - affiliate registration page not in use */}
                {/* <Link href={ROUTES.AFFILIATE_REGISTERATION} className='footer-link'>
                  {t('affiliates')}
                </Link> */}
              </div>
            </div>
          </div>
        </div>
        <div className='container'>
          <span className='text-small'>{t('warrantyDisclaimer')}</span>
        </div>
        <div className='footer-bottom border-top footer-bottom-padding'>
          <div className='row align-items-lg-center footer-bottom-row-gap'>
            <div className='d-lg-none'>&#169; Copyright {currentYear} LumiMeds</div>
            <div className='d-flex d-lg-none footer-social-row'>
              <a
                href='https://www.facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-social-link'
                aria-label='Facebook'
              >
                <FaSquareFacebook className='footer-social-icon' />
              </a>
              <a
                href='https://www.instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-social-link'
                aria-label='Instagram'
              >
                <FaInstagram className='footer-social-icon' />
              </a>
              <a
                href='https://www.tiktok.com'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-social-link'
                aria-label='TikTok'
              >
                <FaTiktok className='footer-social-icon' />
              </a>
            </div>
            <div className='d-none d-lg-flex justify-content-lg-between'>
              <p>&#169; Copyright {currentYear} LumiMeds</p>
              <div className='d-flex footer-social-row'>
                <a
                  href='https://www.facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-social-link'
                  aria-label='Facebook'
                >
                  <FaSquareFacebook className='footer-social-icon' />
                </a>
                <a
                  href='https://www.instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-social-link'
                  aria-label='Instagram'
                >
                  <FaInstagram className='footer-social-icon' />
                </a>
                <a
                  href='https://www.tiktok.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='footer-social-link'
                  aria-label='TikTok'
                >
                  <FaTiktok className='footer-social-icon' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
