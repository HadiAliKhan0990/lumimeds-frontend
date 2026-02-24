import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function AdminRedirect() {
  redirect(ROUTES.ADMIN_ORDERS);
}

