import LongevityNadPage from '@/components/Ads/Longevity-nad';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Longevity NAD+ Injection Plans | LumiMeds',
    description:
      'Start your longevity journey with LumiMeds NAD+ injections. Boost energy, mental clarity, and vitality with monthly plans designed for your wellness.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/longevity-nad',
    },
    openGraph: {
      title: 'Longevity NAD+ Injection Plans | LumiMeds',
      description:
        'Start your longevity journey with LumiMeds NAD+ injections. Boost energy, mental clarity, and vitality with monthly plans designed for your wellness.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/longevity-nad',
    },
  };
}

export default async function Page() {
  return <LongevityNadPage />;
}
