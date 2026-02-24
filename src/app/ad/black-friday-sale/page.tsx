import { redirect } from 'next/navigation';

// Archived: This page has been archived and redirects to home
export default async function Page() {
  redirect('/');
}
