import PharmacyPage from '@/components/DosingGuide/pharmacyPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Semaglutide & Tirzepatide Dosing Guide | Olympia/Wells',
    description:
      'Review Semaglutide and Tirzepatide dosing instructions for Olympia/Wells prescriptions, including weekly and monthly guidance per provider-directed treatment plans.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/dosing-guide/olympia',
    },
    openGraph: {
      title: 'Semaglutide & Tirzepatide Dosing Guide | Olympia/Wells',
      description:
        'Review Semaglutide and Tirzepatide dosing instructions for Olympia/Wells prescriptions, including weekly and monthly guidance per provider-directed treatment plans.',
      type: 'website',
      url: 'https://www.lumimeds.com/dosing-guide/olympia',
    },
  };
}

export default function OlympiaPage() {
  return <PharmacyPage slug='olympia' />;
}
