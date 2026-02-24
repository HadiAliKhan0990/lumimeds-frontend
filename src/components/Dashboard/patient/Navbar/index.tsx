'use client';

import Logo from '@/assets/logo.svg';
import Link from 'next/link';
import Image from 'next/image';
import PackageIcon from '@/components/Icon/PackageIcon';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Collapse } from 'react-bootstrap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoMdMenu } from 'react-icons/io';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useSelector } from 'react-redux';
import { MdHome, MdOutlineForum, MdOutlinePayment, MdSupportAgent, MdOutlineCalendarMonth } from 'react-icons/md';
import { AiOutlineForm } from 'react-icons/ai';
import { Hospital } from '@/components/Icon/Hospital';
import { useGetPatientUnreadCountQuery } from '@/store/slices/patientChatApiSlice';
import { RootState } from '@/store';
import { PatientAvatar } from './includes/PatientAvatar';
import { shouldShowCalendlyFeature, shouldHideCalendlyFeature } from '@/helpers/featureFlags';

export const Navbar = () => {
  const ref = useRef(null);
  const lastScrollY = useRef(0);

  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  useGetPatientUnreadCountQuery();

  const profile = useSelector((state: RootState) => state.patientProfile);
  const { activeSubscriptions } = profile || {};

  const totalPendingSurveys = useSelector((state: RootState) => state.patientSurveys.globalPending.meta?.total || 0);

  const unreadCountData = useSelector((state: RootState) => state.patientChat.unreadCountData);

  const { totalUnreadCount = 0 } = unreadCountData || {};

  const isCarePortalVisible = useMemo(() => {
    return activeSubscriptions?.some(
      (subscription) => subscription.subscriptionType === 'one_time' && subscription.status !== 'canceled'
    );
  }, [activeSubscriptions]);

  const showCalendly = shouldShowCalendlyFeature(profile?.email);
  const hideCalendly = shouldHideCalendlyFeature(profile?.email);

  const NAVLINKS = [
    { title: 'Home', icon: MdHome, href: ROUTES.PATIENT_HOME },
    { title: 'Orders / Refills', icon: PackageIcon, href: ROUTES.PATIENT_ORDERS },
    { title: 'Subscriptions', icon: MdOutlinePayment, href: ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS },
    ...(showCalendly
      ? [{ title: 'Appointments', icon: MdOutlineCalendarMonth, href: ROUTES.PATIENT_APPOINTMENTS }]
      : []),
    { title: 'Messages', icon: MdOutlineForum, href: ROUTES.PATIENT_MESSAGES },
    { title: 'Support', icon: MdSupportAgent, href: ROUTES.PATIENT_SUPPORT },
    { title: 'Tasks', icon: AiOutlineForm, href: ROUTES.PATIENT_SURVEYS },
    ...(isCarePortalVisible && hideCalendly
      ? [{ title: 'Care Portal', icon: Hospital, href: ROUTES.PATIENT_CARE_PORTAL }]
      : []),
  ];

  function handleClose() {
    setOpen(false);
  }

  useOutsideClick({
    ref,
    handler: handleClose,
  });

  useEffect(() => {
    handleClose();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={ref}
      className={`navbar navbar-expand-xl patient-dashboard__navbar top-0 py-3 py-xl-2 start-0 end-0 bg-light${
        showNavbar ? '' : ' navbar--hidden'
      }`}
    >
      <div className='position-relative navbar-container px-4 w-100 d-flex align-items-center justify-content-xl-center mx-auto'>
        <Link href={ROUTES.PATIENT_HOME}>
          <Image src={Logo} className='patient-dashboard__navbar__logo patient-nav-logo' quality={100} alt='LumiMeds' />
        </Link>

        <div className='d-flex align-items-center gap-4 ms-auto'>
          <IoMdMenu
            className='text-black cursor-pointer flex-shrink-0 d-xl-none'
            size={24}
            onClick={() => setOpen(!open)}
          />
          <PatientAvatar className='d-xl-none' />
        </div>
        <Collapse in={open}>
          <div className='navbar-collapse p-2 px-xl-0 ms-xl-2 ps-xl-4 z-3'>
            <ul onClick={() => setOpen(false)} className='navbar-nav me-auto gap-2 gap-xl-4'>
              {NAVLINKS.map((link) => (
                <li key={link.title} className='nav-item'>
                  <Link
                    className={`nav-link tw-select-none d-flex align-items-center gap-3 ${
                      pathname === link.href ? 'active' : ''
                    }`}
                    href={link.href}
                  >
                    <link.icon className='nav-link-icon' />
                    <span className='position-relative'>
                      {link.title}
                      {totalUnreadCount > 0 && link.title === 'Messages' && (
                        <span className='position-absolute badge rounded-pill bg-danger unread_counter'>
                          {totalUnreadCount}
                          <span className='visually-hidden'>unread messages</span>
                        </span>
                      )}
                      {totalPendingSurveys > 0 && link.title === 'Tasks' && (
                        <span className='position-absolute badge rounded-pill bg-danger unread_counter'>
                          {totalPendingSurveys}
                          <span className='visually-hidden'>pending surveys</span>
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <PatientAvatar className='d-none ms-4 d-xl-block' />
          </div>
        </Collapse>
      </div>
    </nav>
  );
};
