import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import FeelFreeAdPageComponent from '@/components/Ads/FeelFree';
import { fetchProducts } from '@/services/products';
import { fetchTrustpilotData } from '@/services/trustpilot';
import { PlanType } from '@/types/medications';

export const revalidate = 0;

export default async function FeelFreeAdPage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, fetch all data and render the original feel free ad page
  const [data, trustpilotData] = await Promise.all([
    fetchProducts({
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
    }),
    fetchTrustpilotData(),
  ]);

  return <FeelFreeAdPageComponent data={data} trustpilotData={trustpilotData} />;
}
