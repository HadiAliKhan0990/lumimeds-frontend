import MedSpaPage from "@/components/Ads/med-spa";
import { fetchProducts } from "@/services/products";
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Weight Loss Plans Without Med Spa Markups With Clear Pricing | Lumimeds',
    description:
      'Choose a weight care plan with clear pricing. You get access to Compounded GLP 1 and GLP-1 GIP treatment through licensed providers. Order your plan online without med spa markups or hidden fees.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/med-spa',
    },
    openGraph: {
      title: 'Weight Loss Plans Without Med Spa Markups With Clear Pricing | Lumimeds',
      description:
        'Choose a weight care plan with clear pricing. You get access to Compounded GLP 1 and GLP-1 GIP treatment through licensed providers. Order your plan online without med spa markups or hidden fees.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/med-spa',
    },
  };
}

export default async function Page() {

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

	return <MedSpaPage data={data}/>;
}


