import { PropsWithChildren } from 'react';
import { AdminWrapper } from '@/components/Dashboard/admin/AdminWrapper';
import { getAuth } from '@/lib/tokens';
import { getAdminProfile } from '@/services/admin';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: Readonly<PropsWithChildren>) {
  const { accessToken } = await getAuth();

  if (accessToken) {
    const adminProfile = await getAdminProfile();

    if (adminProfile) {
      return <AdminWrapper adminProfile={adminProfile}>{children}</AdminWrapper>;
    }
  }
  return children;
}
