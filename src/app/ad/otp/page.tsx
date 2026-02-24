import Otp from '@/components/Ads/otp';
import { redirect } from 'next/navigation';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Personalized Weight Loss With GLP-1 Plans for Your Goals | Lumimeds',
    description:
      'Get personalized GLP-1 weight loss plans with clear pricing and guided support. Choose Semaglutide or Tirzepatide plans that match your goals.',
    robots: 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/otp',
    },
    openGraph: {
      title: 'Personalized Weight Loss With GLP-1 Plans for Your Goals | Lumimeds',
      description:
        'Get personalized GLP-1 weight loss plans with clear pricing and guided support. Choose Semaglutide or Tirzepatide plans that match your goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/otp',
    },
  };
}

export default async function OTPPage() {
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
        planTypeSort: PlanType.RECURRING,
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

  return <Otp data={data} />;
}
