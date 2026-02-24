import { getAuth } from '@/lib/tokens';
import AdminAccount from '@/modules/protected/admin/account';

export default async function Page() {
  const { accessToken } = await getAuth();
  return <AdminAccount accessToken={accessToken} />;
}
