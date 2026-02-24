import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import { Metadata } from 'next';
import ProductsList from '@/components/Products/ProductsList';
import './styles.css';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Premium Weight Loss & Wellness Plans | LumiMeds',
    description:
      'Explore LumiMeds’ weight loss and wellness plans, including GLP‑1 and NAD+ injections. Get customized treatment, expert support, and transparent pricing to reach your health goals.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/products',
    },
    openGraph: {
      title: 'Premium Weight Loss & Wellness Plans | LumiMeds',
      description:
        'Explore LumiMeds’ weight loss and wellness plans, including GLP‑1 and NAD+ injections. Get customized treatment, expert support, and transparent pricing to reach your health goals.',
      type: 'website',
      url: 'https://www.lumimeds.com/products',
    },
  };
}

export default async function ProductsListPage() {
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
      {
        name: 'nad_plans',
        categories: ['longevity_nad_injection_recurring'],
        planTypeSort: PlanType.RECURRING,
      },
    ],
  });
  return <ProductsList data={data} />;
}
