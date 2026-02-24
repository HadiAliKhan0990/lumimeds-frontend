import { redirect } from 'next/navigation';
import { fetchProducts } from '@/services/products';
import { PlanType } from '@/types/medications';
import type { Metadata } from 'next';
import GoogleShopping from './GoogleShopping';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GLP-1 GIP Starter Pack | LumiMeds for Weight Loss',
    description:
      'Start your weight loss journey with LumiMeds’ GLP-1/GIP starter pack. Enjoy 3-month supply, expert support, and convenient home delivery to boost results.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/starter-pack',
    },
    openGraph: {
      title: 'GLP-1 GIP Starter Pack | LumiMeds for Weight Loss',
      description:
        'Start your weight loss journey with LumiMeds’ GLP-1/GIP starter pack. Enjoy 3-month supply, expert support, and convenient home delivery to boost results.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/starter-pack',
    },
  };
}

export default async function Page() {
  const data = await fetchProducts({
    keys: [
      {
        name: 'glp_1_gip_plans',
        categories: ['weight_loss_glp_1_gip_injection_one_time'],
        planTypeSort: PlanType.ONE_TIME,
        sortOrder: 'DESC',
      },
    ],
  });

  // Check if GLP-1/GIP products are available
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  // Redirect to home page if no products are available
  if (!hasGLP1GIPProducts) {
    /*
      To avoid infinite redirect loop, we redirect to the home page of the current environment instead of a simple /
      (/ will trigger middleware which would redirect back to the try subdomain and so on...)
    */
    let url = '';
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      url = `http://localhost:3000`;
    } else if (process.env.NEXT_PUBLIC_ENV === 'staging') {
      url = `https://staging.lumimeds.com`;
    } else {
      url = `https://lumimeds.com`;
    }
    url += '/';
    redirect(url);
  }

  // Get the first product for the MonthProduct component
  // After the redirect guard, products array is guaranteed to have at least one element
  const firstProduct = data.glp_1_gip_plans!.products[0];

  
  return <GoogleShopping product={firstProduct} />;
}
