import { redirect } from 'next/navigation';
import SemAd from '@/components/Ads/Sem';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Semaglutide Weight Loss Plans With Clear Pricing and Guided Support | Lumimeds',
    description:
      'Start a Semaglutide weight loss plan with simple pricing and licensed support. Choose monthly or 3 month options and follow a guided path that fits your goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/sem',
    },
    openGraph: {
      title: 'Semaglutide Weight Loss Plans With Clear Pricing and Guided Support | Lumimeds',
      description:
        'Start a Semaglutide weight loss plan with simple pricing and licensed support. Choose monthly or 3 month options and follow a guided path that fits your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/sem',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      { name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] },
      { name: 'glp_1_gip_plans', categories: ['weight_loss_glp_1_gip_injection_one_time'] },
      { name: 'glp_1_plans', categories: ['weight_loss_glp_1_injection_recurring'] },
    ],
  });

  const hasProducts = data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0;

  if (!hasProducts) {
    redirect('/');
  }

  return <SemAd data={data} />;
}
