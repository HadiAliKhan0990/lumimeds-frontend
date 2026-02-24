import PharmacyPage from '@/components/DosingGuide/pharmacyPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tirzepatide Dosing Guide | Weekly & Monthly Instructions | Lumimeds',
    description:
      'Review weekly and monthly dosing instructions for compounded Tirzepatide. Follow provider-directed guidelines for safe, personalized weight-management treatment.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/dosing-guide/mfv',
    },
    openGraph: {
      title: 'Tirzepatide Dosing Guide | Weekly & Monthly Instructions | Lumimeds',
      description:
        'Review weekly and monthly dosing instructions for compounded Tirzepatide. Follow provider-directed guidelines for safe, personalized weight-management treatment.',
      type: 'website',
      url: 'https://www.lumimeds.com/dosing-guide/mfv',
    },
  };
}

export default function MFVPage() {
  return <PharmacyPage slug='mfv' />;
}
