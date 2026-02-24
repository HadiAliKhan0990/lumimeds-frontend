import OrdersPageContent from '@/modules/protected/patient/orders';

interface Props {
  searchParams: Promise<{ tab: string }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { tab } = await searchParams;
  return <OrdersPageContent tabParam={tab || 'Orders'} />;
}
