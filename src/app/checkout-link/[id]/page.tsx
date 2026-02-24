import ProductCheckoutForm from '@/components/Checkout/ProductCheckoutForm';
import { ROUTES } from '@/constants';
import { getCheckoutDataById } from '@/services/checkout';
import { redirect } from 'next/navigation';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;
  const data = await getCheckoutDataById(id);

  if (!data.token) {
    redirect(ROUTES.HOME);
  }

  return <ProductCheckoutForm checkoutData={data} />;
}
