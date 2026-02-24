import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function Page({
    searchParams,
  }: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }) {
    const trySubdomain = process.env.NEXT_PUBLIC_TRY_SUBDOMAIN || 'try';
    let url = '';
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      url = `http://${trySubdomain}.localhost:3000`;
    } else {
      url = `https://${trySubdomain}.lumimeds.com`;
    }
    url += '/ad/starter-pack';
    
    const sp = (await searchParams) ?? {};
    const qs = new URLSearchParams(
      Object.entries(sp).flatMap(([k, v]) => (Array.isArray(v) ? v.map((vv) => [k, vv]) : v == null ? [] : [[k, v]])),
    ).toString();
    redirect(qs ? `${url}?${qs}` : url);
}
