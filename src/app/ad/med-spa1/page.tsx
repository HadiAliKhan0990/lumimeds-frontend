import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Stop Overpaying For Weight Loss Care With Clear Pricing Plans | Lumimeds',
    description:
      'Choose a weight care plan with simple pricing. You get access to Compounded GLP-1 and GLP-1 GIP treatment through licensed providers. View starter and monthly options without med spa markups or extra fees.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/med-spa1',
    },
    openGraph: {
      title: 'Stop Overpaying For Weight Loss Care With Clear Pricing Plans | Lumimeds',
      description:
        'Choose a weight care plan with simple pricing. You get access to Compounded GLP-1 and GLP-1 GIP treatment through licensed providers. View starter and monthly options without med spa markups or extra fees.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/med-spa1',
    },
  };
}

export default async function Page() {
  // Redirect to the new localized route
  redirect('/en/ad/med-spa1');
}
