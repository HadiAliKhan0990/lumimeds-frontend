import { redirect } from 'next/navigation';
import HowToStartAd from '@/components/Ads/HowToStart';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'How To Start GLP-1 GIP Weight Loss Treatment With Simple Steps | Lumimeds',
    description:
      'Start your program with a clear path. You see the steps for getting access to Compounded Tirzepatide through licensed providers. Review the plan, place your order, and receive steady support through your treatment.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/how-to-start',
    },
    openGraph: {
      title: 'How To Start GLP-1 GIP Weight Loss Treatment With Simple Steps | Lumimeds',
      description:
        'Start your program with a clear path. You see the steps for getting access to Compounded Tirzepatide through licensed providers. Review the plan, place your order, and receive steady support through your treatment.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/how-to-start',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.ONE_TIME,
        sortOrder: 'DESC',
      },
    ],
  });

  // Check if GLP-1/GIP products are available
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  // Redirect to home page if no products are available
  if (!hasGLP1GIPProducts) {
    redirect('/');
  }

  return <HowToStartAd data={data} />;
}
