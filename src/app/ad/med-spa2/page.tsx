import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Weight Loss Treatment Without Med Spa Markups With Clear Pricing | Lumimeds',
    description:
      'Select a weight loss plan online with clear pricing and no med spa markups. Access GLP-1 GIP treatment through licensed providers.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/med-spa2',
    },
    openGraph: {
      title: 'Weight Loss Treatment Without Med Spa Markups With Clear Pricing | Lumimeds',
      description:
        'Select a weight loss plan online with clear pricing and no med spa markups. Access GLP-1 GIP treatment through licensed providers.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/med-spa2',
    },
  };
}

export default async function Page() {
  // Redirect to the new localized route
  redirect('/en/ad/med-spa2');
}
