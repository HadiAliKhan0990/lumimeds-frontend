import { redirect } from 'next/navigation';

export default async function NotFound() {
  // Redirect to root - middleware will handle locale routing to default locale
  redirect('/');
}

export const dynamic = 'force-dynamic';
