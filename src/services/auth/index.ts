import { clearTokenCache } from '@/lib/baseQuery';
import { Response } from '@/lib/types';

/**
 * Sets authentication cookies via API endpoint
 * This replaces direct calls to setAuth server action from client components
 */
export const setAuthCookiesClient = async (accessToken: string, refreshToken: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    const data: Response = await response.json();

    if (data.success) {
      clearTokenCache();
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * Removes authentication cookies via API endpoint (logout)
 */
export const removeAuthCookiesClient = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/session', { method: 'DELETE' });
    const data: Response = await response.json();

    if (data.success) {
      clearTokenCache();
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
