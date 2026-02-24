import PharmacyPage from '@/components/DosingGuide/pharmacyPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tirzepatide Dosing Guide | Northwest Pharmacy Instructions',
    description:
      'View weekly, monthly, and 3-month Tirzepatide dosing instructions for Northwest-filled prescriptions. Follow provider-directed guidance for safe weight-loss treatment.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/dosing-guide/northwest',
    },
    openGraph: {
      title: 'Tirzepatide Dosing Guide | Northwest Pharmacy Instructions',
      description:
        'View weekly, monthly, and 3-month Tirzepatide dosing instructions for Northwest-filled prescriptions. Follow provider-directed guidance for safe weight-loss treatment.',
      type: 'website',
      url: 'https://www.lumimeds.com/dosing-guide/northwest',
    },
  };
}

export default function NorthwestPage() {
  return <PharmacyPage slug='northwest' />;
}
