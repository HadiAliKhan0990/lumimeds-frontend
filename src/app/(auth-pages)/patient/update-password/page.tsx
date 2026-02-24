import UpdatePassword from '@/components/Dashboard/patient/UpdatePassword';

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { redirect } = await searchParams;
  return <UpdatePassword redirect={redirect} role='patient' />;
}
