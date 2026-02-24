import Dashboard from '@/modules/protected/patient/dashboard';
import { getPatientsSubscriptions } from '@/services/subscriptions';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export default async function Page() {
  const subscriptions = await getPatientsSubscriptions();
  return <Dashboard subscriptions={subscriptions} />;
}
