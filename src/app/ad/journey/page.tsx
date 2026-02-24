import { redirect } from 'next/navigation';
import JourneyCTA from '@/components/Ads/JourneyCTA';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GLP-1 and GLP-1 GIP Weight Loss Plans With Clear Monthly Options | Lumimeds',
    description:
      'Start your weight care program with simple plan choices. You get access to Compounded Semaglutide or Tirzepatide through licensed providers. Pick a monthly plan or a three month supply that supports your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/journey',
    },
    openGraph: {
      title: 'GLP-1 and GLP-1 GIP Weight Loss Plans With Clear Monthly Options | Lumimeds',
      description:
        'Start your weight care program with simple plan choices. You get access to Compounded Semaglutide or Tirzepatide through licensed providers. Pick a monthly plan or a three month supply that supports your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/journey',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
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

  // Check if any products are available in either category
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasAnyProducts = hasGLP1Products || hasGLP1GIPProducts;

  // Redirect to home page if no products are available
  if (!hasAnyProducts) {
    redirect('/');
  }

  return <JourneyCTA productsData={data} />;
}
