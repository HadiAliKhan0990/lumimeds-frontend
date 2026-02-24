import Logs from '@/components/Dashboard/admin/logs';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ r?: string; q?: string }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { r, q } = await searchParams;

  return <Logs role={r} query={q} />;
}
