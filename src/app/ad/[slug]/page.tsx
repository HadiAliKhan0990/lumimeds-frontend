import { redirect } from 'next/navigation';
import { parseAdSlug } from '@/lib/parseAdSlug';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DynamicAdPage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const { pageName, language } = parseAdSlug(slug);

  // Only handle language variants (pages with language suffix)
  // If it's a base page without language suffix, redirect to home
  if (language === 'en') {
    redirect('/');
  }

  // Map language to locale
  const locale = language === 'spanish' ? 'es' : 'en';

  // Handle med-spa pages - redirect to localized routes
  if (pageName === 'med-spa1') {
    redirect(`/${locale}/ad/med-spa1`);
  }

  if (pageName === 'med-spa2') {
    redirect(`/${locale}/ad/med-spa2`);
  }

  if (pageName === 'med-spa3') {
    redirect(`/${locale}/ad/med-spa3`);
  }

  // If pageName doesn't match any supported page, return 404
  redirect('/');
}
