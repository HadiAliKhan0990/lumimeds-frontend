import { redirect } from 'next/navigation';
import GlowUp from '@/components/Ads/GlowUp';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { fetchTrustpilotData } from '@/services/trustpilot';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Compounded Semaglutide Weight Loss Plans for Women | Lumimeds',
    description:
      'Start your treatment with Compounded Semaglutide. You get steady support, simple pricing, and clear plans that match your goals. Choose a monthly option or a three month supply with guided care.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/glow-up',
    },
    openGraph: {
      title: 'Compounded Semaglutide Weight Loss Plans for Women | Lumimeds',
      description:
        'Start your treatment with Compounded Semaglutide. You get steady support, simple pricing, and clear plans that match your goals. Choose a monthly option or a three month supply with guided care.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/glow-up',
    },
  };
}

export default async function GlowsUpPage() {
  const [data, trustpilotData] = await Promise.all([
    fetchProducts({
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
      ],
    }),
    fetchTrustpilotData(),
  ]);

  // Check if any products are available in any category
  const hasOlympiaProducts = data.olympiaPlans?.products && data.olympiaPlans.products.length > 0;
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const hasAnyProducts = hasOlympiaProducts || hasGLP1Products || hasGLP1GIPProducts;

  // Redirect to home page if no products are available
  if (!hasAnyProducts) {
    redirect('/');
  }

  return <GlowUp data={data} trustpilotData={trustpilotData} />;
}
