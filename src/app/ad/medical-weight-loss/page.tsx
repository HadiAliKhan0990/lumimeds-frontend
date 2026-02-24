import MedicalWeightLossPage from "@/components/Ads/medical-weight-loss";
import { fetchProducts } from "@/services/products";
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Medical Weight Loss Support With Clear GLP-1 Plans | Lumimeds',
    description:
      'Get doctor guided GLP-1 weight loss care with clear pricing. Choose starter or monthly treatment plans that support your long term progress.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/medical-weight-loss',
    },
    openGraph: {
      title: 'Medical Weight Loss Support With Clear GLP-1 Plans | Lumimeds',
      description:
        'Get doctor guided GLP-1 weight loss care with clear pricing. Choose starter or monthly treatment plans that support your long term progress.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/medical-weight-loss',
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
        name: 'glp_1_plans', categories: ['weight_loss_glp_1_injection_recurring'] ,
      }
    ],
  });

  // Redirect only if neither GLP-1 GIP nor GLP-1 products are available
  const hasGip = (data?.glp_1_gip_plans?.products?.length ?? 0) > 0;
  const hasGlp = (data?.glp_1_plans?.products?.length ?? 0) > 0;

  if (!hasGip && !hasGlp) {
    redirect('/');
  }

  return <MedicalWeightLossPage data={data}/>;
}
