import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import FemaleAds from '@/components/Ads/Female';
import { fetchProducts } from '@/services/products';
import { fetchTrustpilotData } from '@/services/trustpilot';

export const revalidate = 0;

export default async function FemaleAdPage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, fetch all data and render the original female ads page
  const [data, trustpilotData] = await Promise.all([
    fetchProducts({
      keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
    }),
    fetchTrustpilotData(),
  ]);

  return <FemaleAds data={data} trustpilotData={trustpilotData} />;
}
