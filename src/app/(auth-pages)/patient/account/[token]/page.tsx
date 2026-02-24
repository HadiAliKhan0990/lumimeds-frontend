import { CreatePaymentMethod } from '@/components/Dashboard/patient/account/includes/CreatePaymentMethod';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CheckoutPage({ params }: Readonly<Props>) {
  const { token } = await params;
  return <CreatePaymentMethod token={token} />;
}
