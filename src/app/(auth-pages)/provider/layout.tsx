import { PropsWithChildren } from 'react';
import ProviderWrapper from '@/components/Dashboard/provider/ProviderWrapper';
import { NotificationProvider } from '@/components/Notifications';
import { getAuth } from '@/lib/tokens';
import { getProviderProfile } from '@/services/provider';

export default async function ProviderLayout({ children }: Readonly<PropsWithChildren>) {
  const { accessToken } = await getAuth();
  const providerProfile = accessToken ? await getProviderProfile() : undefined;
  return (
    <ProviderWrapper providerProfile={providerProfile} accessToken={accessToken}>
      <NotificationProvider accessToken={accessToken}>{children}</NotificationProvider>
    </ProviderWrapper>
  );
}
