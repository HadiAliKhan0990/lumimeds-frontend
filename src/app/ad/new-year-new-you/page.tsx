import NewYearNewYouPage from '@/components/Ads/NewYearNewYou';
import type { Metadata } from 'next';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Year Weight Loss Plans | LumiMeds',
    description:
      'Start your weight loss journey with LumiMeds this New Year. Get personalized GLP‑1 and NAD+ plans, expert support, and a fresh start with transparent pricing.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/new-year-new-you',
    },
    openGraph: {
      title: 'New Year Weight Loss Plans | LumiMeds',
      description:
        'Start your weight loss journey with LumiMeds this New Year. Get personalized GLP‑1 and NAD+ plans, expert support, and a fresh start with transparent pricing.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/new-year-new-you',
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

  return <NewYearNewYouPage data={data} />;
}
