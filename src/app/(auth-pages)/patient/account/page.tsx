import Account from '@/components/Dashboard/patient/account';
import { getPaymentMethods } from '@/services/paymentMethod';
import { getPatientsSubscriptions } from '@/services/subscriptions';
import { AccountTabsType } from '@/types/account';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    tab?: AccountTabsType;
  }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const [{ tab }, paymentMethods, subscriptions] = await Promise.all([
    searchParams,
    getPaymentMethods(),
    getPatientsSubscriptions(),
  ]);
  return <Account subscriptions={subscriptions} tab={tab} paymentMethods={paymentMethods} />;
}
