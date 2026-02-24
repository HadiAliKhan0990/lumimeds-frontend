import { redirect } from 'next/navigation';
import { checkOlympiaProductsAvailable } from '@/lib/checkOlympiaProducts';
import MaleAds from '@/components/Ads/Male';
import { fetchProducts } from '@/services/products';
import { fetchTrustpilotData } from '@/services/trustpilot';

export const revalidate = 0;

export default async function MaleAdPage() {
  // Check if Olympia products are available
  const hasOlympiaProducts = await checkOlympiaProductsAvailable();

  if (!hasOlympiaProducts) {
    redirect('/');
  }

  // If products are available, fetch all data and render the original male ads page
  const [data, trustpilotData] = await Promise.all([
    fetchProducts({
      keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
    }),
    fetchTrustpilotData(),
  ]);

  return <MaleAds data={data} trustpilotData={trustpilotData} />;
}
