import PharmacyPage from '@/components/DosingGuide/pharmacyPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Semaglutide Dosing Guide | PremierRX Compounded Injections',
    description:
      'View Semaglutide dosing instructions for PremierRX compounded injections, including weekly injection guidance and provider-directed titration schedules.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/dosing-guide/premierRX',
    },
    openGraph: {
      title: 'Semaglutide Dosing Guide | PremierRX Compounded Injections',
      description:
        'View Semaglutide dosing instructions for PremierRX compounded injections, including weekly injection guidance and provider-directed titration schedules.',
      type: 'website',
      url: 'https://www.lumimeds.com/dosing-guide/premierRX',
    },
  };
}

export default function PremierRXPage() {
  return <PharmacyPage slug="premierRX" />;
}
