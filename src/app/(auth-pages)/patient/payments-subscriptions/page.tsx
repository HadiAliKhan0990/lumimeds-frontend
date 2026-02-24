import PaymentsSubscriptions from '@/components/Dashboard/patient/subscriptions';
import { getPaymentMethods } from '@/services/paymentMethod';
import { getPatientsSubscriptions } from '@/services/subscriptions';

export const revalidate = 0;

export default async function Page() {
  const [paymentMethods, subscriptions] = await Promise.all([getPaymentMethods(), getPatientsSubscriptions()]);

  return <PaymentsSubscriptions paymentMethods={paymentMethods} subscriptions={subscriptions} />;
}
