import { HowToStartHero } from '@/components/Ads/HowToStart/includes/HowToStartHero/index';
import { TestimonialsHowToStart } from '@/components/Ads/HowToStart/includes/TestimonialsHowToStart/index';
import ProductCards from '@/components/Ads/HowToStart/includes/ProductCards';
import PaymentFlexibility from '@/components/Ads/sustainable-weight-loss/includes/PaymentFlexibility';
import { redirect } from 'next/navigation';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';
import styles from '@/components/Ads/HowToStart/responsive.module.scss';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GLP-1 Weight Loss Support With Clear Plans and Fast Access | Lumimeds',
    description:
      'Get clear GLP-1 weight loss plans with support and simple pricing. Choose Semaglutide or Tirzepatide and start your guided journey with trusted care.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/redefined',
    },
    openGraph: {
      title: 'GLP-1 Weight Loss Support With Clear Plans and Fast Access | Lumimeds',
      description:
        'Get clear GLP-1 weight loss plans with support and simple pricing. Choose Semaglutide or Tirzepatide and start your guided journey with trusted care.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/redefined',
    },
  };
}

export default async function RedefinedPage() {
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
    ],
  });

  // Check if any products are available - redirect immediately if no products
  const hasProducts =
    (data?.glp_1_plans?.products && data.glp_1_plans.products.length > 0) ||
    (data?.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0);

  if (!hasProducts) {
    redirect('/');
  }

  return (
    <div className={`${styles.howToStartPageContainer} pt-6-custom`}>
      <HowToStartHero />
      <div className={styles.betweenProductsAndReviews}>
        <ProductCards data={data} />
      </div>
      <PaymentFlexibility plain backgroundColor='#CCCCCC' />
      <TestimonialsHowToStart />
    </div>
  );
}
