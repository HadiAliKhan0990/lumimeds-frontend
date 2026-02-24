import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import ShortcutAd from '@/components/Ads/Shortcut/index';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';

export const revalidate = 0;

export default async function ShortcutPage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, fetch all data and render the original shortcut page
  const data = await fetchProducts({
    keys: [
      { name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] },
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.RECURRING,
      },
      {
        name: 'glp_1_plans',
        categories: ['weight_loss_glp_1_injection_recurring'],
      },
    ],
  });

  return <ShortcutAd data={data} />;
}
