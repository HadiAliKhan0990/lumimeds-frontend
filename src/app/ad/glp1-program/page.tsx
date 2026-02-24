import Glp1ProgramPage from '@/components/Ads/glp1-program';
import { fetchProducts } from '@/services/products';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GLP-1 and GLP-1 GIP Weight Loss Plans With Clear Monthly Pricing | Lumimeds',
    description:
      'Start your program with clear pricing and simple monthly plans. You get access to Compounded GLP-1 or GLP-1 GIP treatment through licensed providers. Choose a starter option or a value plan that fits your needs.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/glp1-program',
    },
    openGraph: {
      title: 'GLP-1 and GLP-1 GIP Weight Loss Plans With Clear Monthly Pricing | Lumimeds',
      description:
        'Start your program with clear pricing and simple monthly plans. You get access to Compounded GLP-1 or GLP-1 GIP treatment through licensed providers. Choose a starter option or a value plan that fits your needs.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/glp1-program',
    },
  };
}

export default async function OTPPage() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time', 'weight_loss_glp_1_gip_injection_recurring'],
      },
      {
        name: 'glp_1_plans',
        categories: ['weight_loss_glp_1_injection_recurring'],
      },
    ],
  });

  // Redirect only if neither GLP-1 GIP nor GLP-1 products are available
  const hasGip = (data?.glp_1_gip_plans?.products?.length ?? 0) > 0;
  const hasGlp = (data?.glp_1_plans?.products?.length ?? 0) > 0;

  if (!hasGip && !hasGlp) {
    redirect('/');
  }

  return <Glp1ProgramPage data={data} />;
}
