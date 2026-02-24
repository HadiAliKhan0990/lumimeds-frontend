import { fetcher } from '@/lib/fetcher';
import { User } from '@/store/slices/userSlice';
import { UserResponse } from '@/store/slices/userApiSlice';

export async function getProviderProfile(): Promise<User | undefined> {
  try {
    const { data, success } = await fetcher<UserResponse>('/providers/profile');

    if (success && data) {
      return data;
    }

    return undefined;
  } catch (error) {
    console.log('Failed to fetch patient profile:', error);
    return undefined;
  }
}
