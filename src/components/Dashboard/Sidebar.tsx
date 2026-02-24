'use client';

import SidebarShortLogo from '@/assets/logo-sidebar.png';
import SidebarLongLogo from '@/assets/logo-footer.png';
import Image from 'next/image';
import SidebarButton from './SidebarButton';
import { useEffect, useMemo, useRef, useTransition } from 'react';
import { ADMIN_SIDEBAR_ITEMS, DOCTOR_SIDEBAR_ITEMS } from './constants';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, persistor } from '@/store';
import { setSidebarOpen } from '@/store/slices/generalSlice';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { IoClose } from 'react-icons/io5';
import { NotificationBadge } from './NotificationBadge';
import { useSafeNotifications } from '@/hooks/useSafeNotifications';
import { removeAuthCookiesClient } from '@/services/auth';
import { ROUTES } from '@/constants';
import '@/styles/sidebar-styles.scss';
import { DelayMount } from '../Animations/DelayMount';
import { CircularProgress } from '../elements';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const ref = useRef(null);

  const [isLoggingOut, startTransition] = useTransition();

  const isOpen = useSelector((state: RootState) => state.general.isSidebarOpen);
  const user = useSelector((state: RootState) => state.user);

  const { unreadCount, pendingEncountersCount, appointmentsCount, approvedCount, chatUnreadCount } =
    useSafeNotifications();

  const handleLogout = () => {
    startTransition(async () => {
      await removeAuthCookiesClient();
      await persistor.purge();
      dispatch({ type: 'RESET' });
      router.refresh();
      const loginRoute = pathname.startsWith('/admin') ? ROUTES.ADMIN_LOGIN : ROUTES.PROVIDER_LOGIN;
      router.push(loginRoute);
    });
  };

  useOutsideClick({
    ref,
    handler() {
      dispatch(setSidebarOpen(false));
    },
  });

  const sidebarItems = useMemo(() => {
    if (pathname.startsWith('/admin')) {
      const isSuperAdmin = Boolean(user?.isSuperAdmin);
      const items = isSuperAdmin ? ADMIN_SIDEBAR_ITEMS : ADMIN_SIDEBAR_ITEMS.filter((item) => item.title !== 'Logs');
      return items;
    } else if (pathname.startsWith('/provider')) {
      return DOCTOR_SIDEBAR_ITEMS;
    }
    return [];
  }, [pathname, user?.isSuperAdmin]);

  useEffect(() => {
    dispatch(setSidebarOpen(false));
  }, [pathname]);

  useEffect(() => {
    // added the logic to prevent the background scroll when the sidebar is open and vice versa
    // used tailwind custom class name to prevent the background scroll and vice versa
    if (isOpen) {
      document.documentElement.classList.add('!tw-overflow-hidden');
    } else document.documentElement.classList.remove('!tw-overflow-hidden');
  }, [isOpen]);

  return (
    <div ref={ref} id='sidebar' className={`sidebar py-4 ${isOpen ? 'active' : ''}`}>
      <IoClose
        size={25}
        className='cursor-pointer bouncing-effect text-white flex-shrink-0 d-lg-none position-absolute tw-mt-1 tw-mr-1 top-0 end-0'
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      <div className={'tw-my-4 tw-flex tw-justify-center tw-items-center'}>
        <Image
          src={SidebarLongLogo}
          alt='Lumimeds Logo'
          className={`large-logo ${isOpen ? '' : 'tw-d-none'} tw-flex-grow`}
        />
        <Image className={`small-logo ${isOpen ? 'tw-d-none' : ''}`} src={SidebarShortLogo} alt='Lumimeds Logo' />
      </div>
      {/* added tw-h-[calc(100lvh-7rem)] class name to restrict the side bar viewport */}
      <div
        className={`sidebar-buttons hide-scroll tw-h-[calc(100lvh-8rem)] tw-flex tw-pt-4 tw-flex-col tw-overflow-auto`}
      >
        {sidebarItems.map(({ icon, title, route, isLogout }) => {
          const isNotifications = title === 'Notifications';
          const isPending = title === 'Pending';
          const isAppointments = title === 'Appointments';
          const isApproved = title === 'Approved';
          const isChat = title === 'Chat';

          // Get the count for each nav item
          const getBadgeCount = () => {
            if (isNotifications) return unreadCount;
            if (isPending) return pendingEncountersCount;
            if (isAppointments) return appointmentsCount;
            if (isApproved) return approvedCount;
            if (isChat) return chatUnreadCount;
            return 0;
          };

          const badgeCount = getBadgeCount();
          const showBadge = badgeCount > 0;
          const itemKey = `${title}-${route}`;

          // Handle logout button specially
          if (isLogout) {
            return isOpen ? (
              <DelayMount key={itemKey}>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`sidebar-button text-decoration-none d-flex justify-content-center items-center gap-4 tw-relative tw-text-danger hover:tw-opacity-80 ${
                    isLoggingOut ? 'tw-opacity-50 tw-pointer-events-none' : ''
                  }`}
                >
                  <div className='tw-flex tw-items-center tw-gap-4 tw-flex-grow'>
                    <div className='tw-relative'>{isLoggingOut ? <CircularProgress /> : icon}</div>
                    <span className='tw-text-danger'>{title}</span>
                  </div>
                </button>
              </DelayMount>
            ) : (
              <button
                key={itemKey}
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`sidebar-button text-decoration-none d-flex justify-content-center items-center gap-4 tw-text-danger hover:tw-opacity-80 ${
                  isLoggingOut ? 'tw-opacity-50 tw-pointer-events-none' : ''
                }`}
              >
                <div className='tw-flex tw-flex-col tw-items-center tw-gap-2 tw-flex-grow'>
                  <div className='tw-relative'>{isLoggingOut ? <CircularProgress /> : icon}</div>
                  <span className='tw-text-xs tw-text-danger'>{title}</span>
                </div>
              </button>
            );
          }

          return isOpen ? (
            <DelayMount key={itemKey}>
              <SidebarButton className={`${pathname === route ? 'active' : ''} tw-relative`} route={route}>
                <div className='tw-flex tw-items-center tw-gap-4 tw-flex-grow'>
                  <div className='tw-relative'>
                    {icon}
                    {showBadge && (
                      <div className='tw-absolute tw-top-1 tw-right-2'>
                        <NotificationBadge count={badgeCount} isOpen={isOpen} />
                      </div>
                    )}
                  </div>

                  <span>{title}</span>
                </div>
              </SidebarButton>
            </DelayMount>
          ) : (
            <div key={itemKey}>
              <SidebarButton className={`${pathname === route ? 'active' : ''} `} route={route}>
                <div className='tw-flex tw-flex-col tw-items-center tw-gap-2 tw-flex-grow'>
                  <div className='tw-relative'>
                    {icon}
                    {showBadge && (
                      <div className='tw-absolute -tw-top-1 -tw-right-6'>
                        <NotificationBadge count={badgeCount} isOpen={isOpen} />
                      </div>
                    )}
                  </div>
                  <span className='tw-text-xs tw-text-white'>{title}</span>
                </div>
              </SidebarButton>
            </div>
          );
        })}
        {/* Spacer to ensure last button is always accessible on iOS devices */}
        <div className='tw-h-8 tw-flex-shrink-0' aria-hidden='true' />
      </div>
    </div>
  );
}
