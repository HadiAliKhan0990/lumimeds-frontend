import { redirect } from 'next/navigation';
import Revitalized2Month from '@/components/Ads/Revitalize2Month';
import { fetchProducts } from '@/services/products';

export const revalidate = 0;

export default async function Page() {
  const data = await fetchProducts({
    keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
  });

  // pick 2-month product from 503B olympia plans if available
  const products = data?.olympiaPlans?.products || [];

  if (!products.length) {
    redirect('/');
  }

  const twoMonth = products.find((p) => p.durationText?.toLowerCase().includes('2-month'));

  if (!twoMonth) {
    redirect('/');
  }

  return <Revitalized2Month featuredProduct={twoMonth} />;
}
