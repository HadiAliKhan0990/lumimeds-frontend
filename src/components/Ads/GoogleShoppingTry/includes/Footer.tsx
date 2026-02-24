'use client';

import Link from 'next/link';
import { IoCall, IoMail } from 'react-icons/io5';
import Image from 'next/image';
import LegitScriptIcon from '@/assets/ads/google-shopping/legit_script.svg';
import LegitScriptColorfulIcon from '@/assets/ads/google-shopping/legit_script_colorful.svg';
import TrustpilotStarRating from '@/components/StarRating/TrustpilotStarRating';
import { ROUTES } from '@/constants';
import { useMemo } from 'react';
import FacebookSvg from '@/components/Ads/GoogleShoppingTry/includes/FacebookSvg';
import InstagramSvg from '@/components/Ads/GoogleShoppingTry/includes/InstagramSvg';
import YoutubeSvg from '@/components/Ads/GoogleShoppingTry/includes/YoutubeSvg';
import LogoSvg from '@/components/Ads/GoogleShoppingTry/includes/Logo';
import { usePathname } from 'next/navigation';

interface GoogleShoppingTryFooterProps {
  variant?: 'light' | 'dark';
  logoColor?: string;
}
export default function GoogleShoppingTryFooter({ variant = 'light', logoColor = '#fff' }: GoogleShoppingTryFooterProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const pathname = usePathname();

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/products', label: 'Products' },
    { href: '/blog', label: 'Blog' },
    { href: ROUTES.FAQS, label: 'FAQs' },
    { href: '/contact', label: 'Contact' },
    { href: ROUTES.TERMS_OF_USE, label: 'Legal' },
  ];

  const socialLinks = [
    {
      href: 'https://www.facebook.com',
      icon: () => <FacebookSvg fillColor={variant === 'light' ? '#4685F4' : '#fff'} />,
      label: 'Facebook',
    },
    {
      href: 'https://www.instagram.com',
      icon: () => <InstagramSvg fillColor={variant === 'light' ? '#4685F4' : '#fff'} />,
      label: 'Instagram',
    },
    {
      href: 'https://www.youtube.com',
      icon: () => <YoutubeSvg fillColor={variant === 'light' ? '#4685F4' : '#fff'} />,
      label: 'YouTube',
    },
  ];

  const disclaimerText =
    "All the information on this website is published in good faith and for general information purposes only. LumiMeds™ does not make any warranties about the completeness, reliability and accuracy of this information. LumiMeds™ is a patient management platform that works with independent physicians and practitioners who provide services utilizing our platform. LumiMeds does not directly provide medical or pharmacy services and payment does not guarantee the writing or dispensing of a prescription.";

  const textVariant = {
    light: 'tw-text-black',
    dark: 'tw-text-white',
  }
  const footerBg = {
    light: `tw-bg-[#fff] ${textVariant[variant]}`,
    dark: `tw-bg-[#222A3F] ${textVariant[variant]}`
  };
  const trustpilotTextColor = {
    light: 'tw-text-[#4685f4]',
    dark: 'tw-text-white',
  }
  let trustpilotStarColor = '#00b67a';
  let trustpilotStarBgColor = '#00b67a';
  if (pathname.includes('/ad/starter-pack')) {
    trustpilotStarColor = '#000';
    trustpilotStarBgColor = '#fff';
  }
  else if (pathname.includes('/ad/product-summary')) {
    trustpilotStarColor = '#fff';
    trustpilotStarBgColor = '#4685f4';
  }

  const isStarterPage = pathname.includes('/ad/starter-pack');
  const isProductSummaryPage = pathname.includes('/ad/product-summary');

  if (isStarterPage) {
    return (
      <footer className={`${footerBg[variant]} tw-w-full`}>
        <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8 tw-py-8 md:tw-py-12 lg:tw-py-16'>
          <div className='tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 lg:tw-gap-12'>
            <div className='tw-col-span-2 lg:tw-col-span-1 tw-order-1'>
              <Link href='/' className='tw-flex tw-items-center tw-no-underline mb-4'>
                <LogoSvg fillColor={logoColor} />
              </Link>
              <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90'>
                {disclaimerText}
              </p>
            </div>
  
            <div className='tw-col-span-1 lg:tw-col-span-1 tw-order-2'>
              <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Quick Links</h3>
              <div className='tw-flex tw-flex-col tw-gap-3 md:tw-gap-4'>
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${textVariant[variant]} tw-font-lato tw-text-sm md:tw-text-base tw-no-underline tw-transition-colors tw-duration-200 hover:tw-opacity-80`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
  
            <div className='tw-col-span-1 tw-order-3'>
              <div className='xcxcx'>
                <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Social</h3>
                <div className='tw-flex tw-gap-8 tw-mb-6'>
                  {socialLinks.map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={`tw-transition-opacity tw-duration-200 hover:tw-opacity-80 ${variant === 'light' ? 'tw-text-blue-500' : 'tw-text-white'}`}
                      aria-label={label}
                    >
                      <Icon />
                    </Link>
                  ))}
                </div>
    
              </div>
              <div className='tw-block lg:tw-hidden lg:tw-col-span-1 tw-order-3'>
                <div className='tw-flex tw-items-center tw-justify-start tw-mb-4'>
                  <Image
                    src={variant === 'light' ? LegitScriptColorfulIcon : LegitScriptIcon}
                    alt='LegitScript'
                    className='tw-w-[105px] md:tw-w-32 tw-h-auto'
                    width={105}
                    height={32}
                  />
                </div>
              
                <div className='tw-flex tw-flex-col tw-gap-2 tw-items-start'>
                  <div className=''>
                    <span className={`tw-font-lato tw-text-base md:tw-text-lg tw-inline-block tw-w-full tw-text-center ${trustpilotTextColor[variant]}`}>Excellent</span>
                    <div className='tw-flex tw-items-center'>
                      <TrustpilotStarRating
                        rating={4.6}
                        starColor={trustpilotStarColor}
                        starBgColor={trustpilotStarBgColor}
                      />
                    </div>
                    <div className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-mt-1'>
                      <span className={`tw-text-lg ${trustpilotTextColor[variant]}`}>★</span>
                      <span className={`tw-font-lato tw-text-sm md:tw-text-base ${trustpilotTextColor[variant]}`}>Trustpilot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {isStarterPage && (
              <div className='tw-col-span-2 lg:tw-col-span-1 tw-order-3'>
                <div className={`tw-bg-opacity-10 tw-border-2 tw-border-white tw-rounded-lg tw-p-4 md:tw-p-5 tw-mb-6 ${variant === 'light' ? 'tw-bg-[#afccff]' : 'tw-bg-[#222A3F]'}`}>
                  <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-3'>
                    Contact Us
                  </h3>
                  <a
                    href='tel:+14159680890'
                    className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80 tw-mb-4'
                  >
                    <IoCall className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                    <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>(415) 968-0890</span>
                  </a>
                  <a
                    href='mailto:info@lumimeds.com'
                    className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80'
                  >
                    <IoMail className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                    <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>help@lumimeds.com</span>
                  </a>
                </div>
  
                <div className='tw-hidden lg:tw-block'>
                  <div className='tw-flex tw-items-center tw-justify-center tw-mb-4'>
                    <Image
                      src={variant === 'light' ? LegitScriptColorfulIcon : LegitScriptIcon}
                      alt='LegitScript'
                      className='tw-w-[105px] md:tw-w-32 tw-h-auto'
                      width={105}
                      height={32}
                    />
                  </div>
                
                  <div className='tw-flex tw-flex-col tw-gap-2 tw-items-center'>
                    <span className={`tw-font-lato tw-text-base md:tw-text-lg ${trustpilotTextColor[variant]}`}>Excellent</span>
                    <div className='tw-flex tw-items-center'>
                      <TrustpilotStarRating
                        rating={4.6}
                        starColor={trustpilotStarColor}
                        starBgColor={trustpilotStarBgColor}
                      />
                    </div>
                    <div className='tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-justify-center'>
                      <span className={`tw-text-lg ${trustpilotTextColor[variant]}`}>★</span>
                      <span className={`tw-font-lato tw-text-sm md:tw-text-base ${trustpilotTextColor[variant]}`}>Trustpilot</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  
        <div>
          <div className='tw-border-t tw-border-white tw-border-opacity-20 tw-pt-6 tw-pb-6'>
            <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8'>
              <p className='tw-font-lato tw-text-sm md:tw-text-base tw-text-center tw-opacity-80'>
                © {currentYear} LumiMeds | All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  if (isProductSummaryPage) {
    return (
      <footer className={`${footerBg[variant]} tw-w-full`}>
        <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8 tw-py-8 md:tw-py-12 lg:tw-py-16'>
          <div className='tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 lg:tw-gap-12'>
            <div className='tw-col-span-2 lg:tw-col-span-1 tw-order-1'>
              <Link href='/' className='tw-flex tw-items-center tw-no-underline lg:mb-4'>
                <LogoSvg fillColor={logoColor} />
              </Link>
              <p className='tw-hidden lg:tw-block tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90'>
                {disclaimerText}
              </p>
            </div>

            <div className='tw-block lg:tw-hidden tw-col-span-2 tw-order-2'>
              <div className={`tw-bg-opacity-10 tw-border-2 tw-border-white tw-rounded-lg tw-p-4 md:tw-p-5 tw-mb-6 ${variant === 'light' ? 'tw-bg-[#afccff]' : 'tw-bg-[#222A3F]'}`}>
                  <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-3'>
                    Contact Us
                  </h3>
                  <a
                    href='tel:+14159680890'
                    className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80 tw-mb-4'
                  >
                    <IoCall className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                    <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>(415) 968-0890</span>
                  </a>
                  <a
                    href='mailto:info@lumimeds.com'
                    className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80'
                  >
                    <IoMail className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                    <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>help@lumimeds.com</span>
                  </a>
                </div>
                <div className='lg:tw-col-span-1 tw-order-4'>
                  <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>
                    Service Hours:
                  </h3>
                  <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90 tw-m-0'>Mon–Fri: 7 AM–7 PM PST</p>
                  <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90 tw-m-0'>Sat–Sun: 8 AM–4 PM PST</p>
                </div>
            </div>
  
            <div className='tw-col-span-1 lg:tw-col-span-1 tw-order-2'>
              <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Quick Links</h3>
              <div className='tw-flex tw-flex-col tw-gap-3 md:tw-gap-4'>
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${textVariant[variant]} tw-font-lato tw-text-sm md:tw-text-base tw-no-underline tw-transition-colors tw-duration-200 hover:tw-opacity-80`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
  
            <div className='tw-hidden lg:tw-block tw-col-span-1 tw-order-3'>
              <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Social</h3>
              <div className='tw-flex tw-gap-4 tw-mb-6'>
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`tw-transition-opacity tw-duration-200 hover:tw-opacity-80 ${variant === 'light' ? 'tw-text-blue-500' : 'tw-text-white'}`}
                    aria-label={label}
                  >
                    <Icon />
                  </Link>
                ))}
              </div>

              <div className={`tw-hidden lg:tw-block tw-bg-opacity-10 tw-border-2 tw-border-white tw-rounded-lg tw-p-4 md:tw-p-5 tw-mb-6 ${variant === 'light' ? 'tw-bg-[#afccff]' : 'tw-bg-[#222A3F]'}`}>
                <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-3'>
                  Contact Us
                </h3>
                <a
                  href='tel:+14159680890'
                  className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80 tw-mb-4'
                >
                  <IoCall className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                  <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>(415) 968-0890</span>
                </a>
                <a
                  href='mailto:info@lumimeds.com'
                  className='tw-flex tw-items-center tw-gap-2 tw-no-underline tw-transition-opacity tw-duration-200 hover:tw-opacity-80'
                >
                  <IoMail className={`tw-w-5 tw-h-5 ${textVariant[variant]}`} />
                  <span className={`tw-font-lato tw-text-sm md:tw-text-base ${textVariant[variant]}`}>help@lumimeds.com</span>
                </a>
              </div>
              <div className='lg:tw-col-span-1 tw-order-4'>
                <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>
                  Service Hours:
                </h3>
                <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90 tw-m-0'>Mon–Fri: 7 AM–7 PM PST</p>
                <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90 tw-m-0'>Sat–Sun: 8 AM–4 PM PST</p>
              </div>

            </div>
            
            <div className='lg:tw-col-span-1 tw-order-3'>
                <div className='tw-flex tw-items-center tw-justify-center tw-mb-8'>
                  <Image
                    src={variant === 'light' ? LegitScriptColorfulIcon : LegitScriptIcon}
                    alt='LegitScript'
                    className='tw-w-[105px] md:tw-w-32 tw-h-auto'
                    width={105}
                    height={32}
                  />
                </div>
              
                <div className='tw-flex tw-flex-col tw-gap-2 tw-items-center'>
                  <span className={`tw-font-lato tw-text-base md:tw-text-lg ${trustpilotTextColor[variant]}`}>Excellent</span>
                  <div className='tw-flex tw-items-center'>
                    <TrustpilotStarRating
                      rating={4.6}
                      starColor={trustpilotStarColor}
                      starBgColor={trustpilotStarBgColor}
                    />
                  </div>
                  <div className='tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-justify-center'>
                    <span className={`tw-text-lg ${trustpilotTextColor[variant]}`}>★</span>
                    <span className={`tw-font-lato tw-text-sm md:tw-text-base ${trustpilotTextColor[variant]}`}>Trustpilot</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
  
        <div>
          <div className={`tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8`}>
            <p className='lg:tw-hidden tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90'>
              {disclaimerText}
            </p>
            <p>
              LumiMeds™ does not make any warranties about  the completeness, reliability and accuracy of this information.  LumiMeds™ is a patient management platform that works with independent  physicians and practitioners who provide services utilizing our  platform. LumiMeds does not directly provide medical or pharmacy  services and payment does not guarantee the writing or dispensing of a  prescription.
            </p>
          </div>

          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center lg:tw-hidden'>
            <div className='tw-flex tw-gap-4'>
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`tw-transition-opacity tw-duration-200 hover:tw-opacity-80 ${variant === 'light' ? 'tw-text-blue-500' : 'tw-text-white'}`}
                  aria-label={label}
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          <div className='tw-border-t tw-border-white tw-border-opacity-20 tw-pt-6 tw-pb-6'>
            <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8'>
              <p className='tw-font-lato tw-text-sm md:tw-text-base tw-text-center tw-opacity-80'>
                © {currentYear} LumiMeds | All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`${footerBg[variant]} tw-w-full`}>
      <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8 tw-py-8 md:tw-py-12 lg:tw-py-16'>
        <div className='tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 lg:tw-gap-12'>
          <div className='tw-col-span-2 lg:tw-col-span-1 tw-order-1'>
            <Link href='/' className='tw-flex tw-items-center tw-no-underline mb-4'>
              <LogoSvg fillColor={logoColor} />
            </Link>
            <p className='tw-font-lato tw-text-sm md:tw-text-base tw-leading-relaxed tw-opacity-90'>
              {disclaimerText}
            </p>
          </div>

          <div className='tw-col-span-1 lg:tw-col-span-1 tw-order-2'>
            <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Quick Links</h3>
            <div className='tw-flex tw-flex-col tw-gap-3 md:tw-gap-4'>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${textVariant[variant]} tw-font-lato tw-text-sm md:tw-text-base tw-no-underline tw-transition-colors tw-duration-200 hover:tw-opacity-80`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className='tw-col-span-1 tw-order-3'>
            <h3 className='tw-font-lato tw-font-bold tw-text-base md:tw-text-lg tw-mb-4'>Social</h3>
            <div className='tw-flex tw-gap-4 tw-mb-6'>
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`tw-transition-opacity tw-duration-200 hover:tw-opacity-80 ${variant === 'light' ? 'tw-text-blue-500' : 'tw-text-white'}`}
                  aria-label={label}
                >
                  <Icon />
                </Link>
              ))}
            </div>

            <div className='tw-block lg:tw-hidden lg:tw-col-span-1 tw-order-3'>
              <div className='tw-flex tw-items-center tw-justify-center tw-mb-4'>
                <Image
                  src={variant === 'light' ? LegitScriptColorfulIcon : LegitScriptIcon}
                  alt='LegitScript'
                  className='tw-w-[105px] md:tw-w-32 tw-h-auto'
                  width={105}
                  height={32}
                />
              </div>
            
              <div className='tw-flex tw-flex-col tw-gap-2 tw-items-center'>
                <span className={`tw-font-lato tw-text-base md:tw-text-lg ${trustpilotTextColor[variant]}`}>Excellent</span>
                <div className='tw-flex tw-items-center'>
                  <TrustpilotStarRating
                    rating={4.6}
                    starColor={trustpilotStarColor}
                    starBgColor={trustpilotStarBgColor}
                  />
                </div>
                <div className='tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-justify-center'>
                  <span className={`tw-text-lg ${trustpilotTextColor[variant]}`}>★</span>
                  <span className={`tw-font-lato tw-text-sm md:tw-text-base ${trustpilotTextColor[variant]}`}>Trustpilot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className={`tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8`}>
          <p>
            LumiMeds™ does not make any warranties about  the completeness, reliability and accuracy of this information.  LumiMeds™ is a patient management platform that works with independent  physicians and practitioners who provide services utilizing our  platform. LumiMeds does not directly provide medical or pharmacy  services and payment does not guarantee the writing or dispensing of a  prescription.
          </p>
        </div>

        <div className='tw-border-t tw-border-white tw-border-opacity-20 tw-pt-6 tw-pb-6'>
          <div className='tw-container tw-mx-auto tw-px-4 md:tw-px-6 lg:tw-px-8'>
            <p className='tw-font-lato tw-text-sm md:tw-text-base tw-text-center tw-opacity-80'>
              © {currentYear} LumiMeds | All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
