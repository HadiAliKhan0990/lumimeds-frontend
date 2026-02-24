import PharmacyPage from '@/components/DosingGuide/pharmacyPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tirzepatide & Semaglutide Dosing Guide | Weekly & Monthly Instructions | Lumimeds',
    description:
      'View the dosing guide for compounded Tirzepatide and Semaglutide, including weekly and monthly instructions. Follow provider-directed dosage plans.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/dosing-guide/1st-choice',
    },
    openGraph: {
      title: 'Tirzepatide & Semaglutide Dosing Guide | Weekly & Monthly Instructions | Lumimeds',
      description:
        'View the dosing guide for compounded Tirzepatide and Semaglutide, including weekly and monthly instructions. Follow provider-directed dosage plans.',
      type: 'website',
      url: 'https://www.lumimeds.com/dosing-guide/1st-choice',
    },
  };
}

export default function FirstChoicePage() {
  return <PharmacyPage slug='1st-choice' />;
}
