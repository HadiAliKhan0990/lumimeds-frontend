import { redirect } from 'next/navigation';
import Revitalized1Month from '@/components/Ads/Revitalize1Month';
import { fetchProducts } from '@/services/products';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
  });

  // pick 1-month product from 503B olympia plans if available
  const products = data?.olympiaPlans?.products || [];

  if (!products.length) {
    redirect('/');
  }

  const oneMonth = products.find((p) => p.durationText?.toLowerCase().includes('1-month'));

  if (!oneMonth) {
    redirect('/');
  }

  return <Revitalized1Month featuredProduct={oneMonth} />;
}
