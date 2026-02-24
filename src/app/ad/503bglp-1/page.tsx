import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import Bglp1 from '@/components/Ads/503-bglp-1';
import { fetchProducts } from '@/services/products';

export const revalidate = 0;

export default async function GlpOnePage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, render the original Olympia GLP-1 page
  const data = await fetchProducts({
    keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
  });

  return <Bglp1 data={data} />;
}
