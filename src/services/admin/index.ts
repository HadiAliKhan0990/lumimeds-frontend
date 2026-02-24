import { fetcher } from '@/lib/fetcher';
import { User } from '@/store/slices/userSlice';
import { UserResponse } from '@/store/slices/userApiSlice';
import { SingleOrder } from '@/lib/types';
import { SingleOrderResponse } from '@/store/slices/ordersApiSlice';

export async function getAdminProfile(): Promise<User | undefined> {
  try {
    const { data, success } = await fetcher<UserResponse>('/admin/profile');

    if (success && data) {
      return data;
    }

    return undefined;
  } catch (error) {
    console.log('Failed to fetch patient profile:', error);
    return undefined;
  }
}

export async function getPatientSingleOrder(id: string): Promise<SingleOrder | undefined> {
  try {
    const { data, success } = await fetcher<SingleOrderResponse>(`/orders/${id}`);

    if (success && data) {
      return data;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
