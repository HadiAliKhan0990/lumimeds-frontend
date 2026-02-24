import MedSpa1Page from '@/components/Ads/med-spa1';
import { fetchProducts } from '@/services/products';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time', 'weight_loss_glp_1_gip_injection_recurring'],
      },
      {
        name: 'glp_1_plans',
        categories: ['weight_loss_glp_1_injection_recurring'],
      },
    ],
  });

  // Check if any products are available
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasAnyProducts = hasGLP1Products || hasGLP1GIPProducts;

  // Redirect to home page if no products are available
  if (!hasAnyProducts) {
    redirect('/');
  }

  return <MedSpa1Page data={data} />;
}
