import Home from '@/components/Home';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

// Update this metadata based on your Excel file
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Medical Weight Loss & Health Plans | LumiMeds',
    description:
      "Personalized medical weight loss and wellness plans online. Get expert evaluation, transparent pricing, and monthly support for real results.",
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com',
    },
    openGraph: {
      title: 'Medical Weight Loss & Health Plans | LumiMeds',
      description:
        "Personalized medical weight loss and wellness plans online. Get expert evaluation, transparent pricing, and monthly support for real results.",
      type: 'website',
      url: 'https://www.lumimeds.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Medical Weight Loss & Health Plans | LumiMeds',
      description:
        "Personalized medical weight loss and wellness plans online. Get expert evaluation, transparent pricing, and monthly support for real results.",
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      { name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] },
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.RECURRING,
      },
      {
        name: 'glp_1_plans',
        categories: ['weight_loss_glp_1_injection_recurring'],
      },
      {
        name: 'nad_plans',
        categories: ['longevity_nad_injection_recurring'],
      },
    ],
  });

  return <Home data={data} />;
}
