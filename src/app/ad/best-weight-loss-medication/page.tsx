import { redirect } from 'next/navigation';
import BestWeightLossMedication from '@/components/Ads/BestWeightLossMedication';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Best Weight Loss Medication | GLP-1 & GIP Treatment Plans | Lumimeds',
    description:
      'Explore the best weight-loss medication options, including GLP-1 and GIP treatments. Compare plans, pricing, and benefits to find the right fit for your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/best-weight-loss-medication',
    },
    openGraph: {
      title: 'Best Weight Loss Medication | GLP-1 & GIP Treatment Plans | Lumimeds',
      description:
        'Explore the best weight-loss medication options, including GLP-1 and GIP treatments. Compare plans, pricing, and benefits to find the right fit for your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/best-weight-loss-medication',
    },
  };
}

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

  // Check if any products are available - redirect immediately if no products
  const hasGLP1GIPProducts = data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasGLP1Products = data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasProducts = hasGLP1GIPProducts || hasGLP1Products;

  if (!hasProducts) {
    redirect('/');
  }

  return <BestWeightLossMedication data={data} />;
}
