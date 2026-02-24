import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import Olympia503bchoice from '@/components/Ads/503bChoice';
import { fetchProducts } from '@/services/products';

export const revalidate = 0;

export default async function ChoicePage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, render the original Olympia choice page
  const data = await fetchProducts({
    keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
  });

  return <Olympia503bchoice data={data} />;
}
