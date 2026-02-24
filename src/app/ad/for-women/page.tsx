import ForWomenAd from '@/components/Ads/ForWomen';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Weight Loss Injections for Women, Simple Plans That Work | Lumimeds',
    description:
      'Start your weight loss journey with GLP-1 and GLP-1/GIP injections made for women. Get clear guidance, medical support, and fast access to monthly or multi-month plans. Safe treatment. No hidden steps.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/for-women',
    },
    openGraph: {
      title: 'Weight Loss Injections for Women, Simple Plans That Work | Lumimeds',
      description:
        'Start your weight loss journey with GLP-1 and GLP-1/GIP injections made for women. Get clear guidance, medical support, and fast access to monthly or multi-month plans. Safe treatment. No hidden steps.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/for-women',
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
    ],
  });

  if (!data?.glp_1_gip_plans || data.glp_1_gip_plans?.products?.length === 0) {
    redirect('/');
  }

  return <ForWomenAd data={data} />;
}
