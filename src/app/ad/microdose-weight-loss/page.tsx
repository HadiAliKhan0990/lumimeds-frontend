import MicrodoseWeightLossPage from '@/components/Ads/Microdose-weight-loss';
import type { Metadata } from 'next';
import { fetchProducts } from '@/services/products';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Microdose Weight Loss Plans | LumiMeds',
    description:
      'Achieve your weight loss goals with LumiMeds’ microdose plans. Get personalized GLP-1/GIP injections that minimize side effects while maximizing results.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/microdose-weight-loss',
    },
    openGraph: {
      title: 'Microdose Weight Loss Plans | LumiMeds',
      description:
        'Achieve your weight loss goals with LumiMeds’ microdose plans. Get personalized GLP-1/GIP injections that minimize side effects while maximizing results.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/microdose-weight-loss',
    },
  };
}

export default async function Page() {
  const [data] = await Promise.all([
    fetchProducts({
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
    }),
  ]);

  // Check if any products are available - redirect immediately if no products
  const hasGLP1GIPProducts = data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasGLP1Products = data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasProducts = hasGLP1GIPProducts || hasGLP1Products;
  const isLandingPageInactive = true;

  if (isLandingPageInactive || !hasProducts) {
    redirect('/');
  }

  return <MicrodoseWeightLossPage data={data} />;
}
