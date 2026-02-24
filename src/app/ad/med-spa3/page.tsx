import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Lower Med Spa Costs With Clear Weight Loss Plans | Lumimeds',
    description:
      'Get clear pricing for GLP-1 GIP treatment from licensed providers. Choose starter or monthly plans without med spa markups.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/med-spa3',
    },
    openGraph: {
      title: 'Lower Med Spa Costs With Clear Weight Loss Plans | Lumimeds',
      description:
        'Get clear pricing for GLP-1 GIP treatment from licensed providers. Choose starter or monthly plans without med spa markups.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/med-spa3',
    },
  };
}

export default async function Page() {
  // Redirect to the new localized route
  redirect('/en/ad/med-spa3');
}
