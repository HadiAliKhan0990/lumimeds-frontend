import WeightLossMedicationsOptionsPage from '@/components/Ads/WeightLossMedicationsOptions';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Weight‑Loss Medications: Options & Top Pills | LumiMeds',
    description:
      'Learn whether you qualify for prescription weight‑loss medications and compare top pills like Ozempic and Wegovy. Know BMI criteria, benefits, and side effects. Oder Now!',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/weight-loss-medications-options',
    },
    openGraph: {
      title: 'Weight‑Loss Medications: Options & Top Pills | LumiMeds',
      description:
        'Learn whether you qualify for prescription weight‑loss medications and compare top pills like Ozempic and Wegovy. Know BMI criteria, benefits, and side effects. Oder Now!',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/weight-loss-medications-options',
    },
  };
}

export default async function Page() {
  return <WeightLossMedicationsOptionsPage />;
}
