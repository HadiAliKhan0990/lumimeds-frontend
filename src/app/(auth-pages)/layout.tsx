'use client';

import { PropsWithChildren } from 'react';
import styles from './layout.module.css';
import Sidebar from '@/components/Dashboard/Sidebar';
import Popup from '@/components/Dashboard/admin/Popup';
import DashboardWrapper from '@/components/Dashboard/DashboardWrapper';
import { usePathname } from 'next/navigation';
import { isPublicRoute } from '@/lib/helper';
import { ROUTES } from '@/constants';

export default function AdminLayout({ children }: Readonly<PropsWithChildren>) {
  const pathname = usePathname();

  if (isPublicRoute(pathname) || pathname.startsWith('/patient') || pathname.includes(ROUTES.ADMIN_FIRST_LOGIN_UPDATE) || pathname.includes(ROUTES.PROVIDER_UPDATE_PASSWORD))
    return children;

  return (
    <DashboardWrapper>
      <div className={'position-relative'}>
        <Sidebar />
        <div className={`min-vh-100 ${styles.children}`}>{children}</div>
        <Popup />
      </div>
    </DashboardWrapper>
  );
}
