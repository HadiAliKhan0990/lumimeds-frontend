import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllAdPage({ params }: Readonly<Props>) {
  const { slug } = await params;

  // Only med-spa1, med-spa2, and med-spa3 are valid routes
  // All other ad routes should redirect to home
  const validRoutes = ['med-spa1', 'med-spa2', 'med-spa3'];
  const routeName = slug?.[0];

  if (!routeName || !validRoutes.includes(routeName)) {
    // Redirect to root - middleware will handle locale routing
    redirect('/');
  }

  // This should never be reached, but just in case
  redirect('/');
}
