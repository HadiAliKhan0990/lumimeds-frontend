'use server';

import { cookies } from 'next/headers';
import { decodeJWT } from '@/lib';
import { COOKIE_NAMES } from '@/constants';

export const setAuth = async (accessToken: string, refreshToken: string) => {
  const baseCookies = await cookies();
  const { decodedPayload: decodedAccessPayload } = decodeJWT(accessToken || '');
  const { decodedPayload: decodedRefreshPayload } = decodeJWT(refreshToken || '');

  if (decodedAccessPayload && typeof decodedAccessPayload.exp === 'number') {
    baseCookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(decodedAccessPayload.exp * 1000),
    });
  }

  if (decodedRefreshPayload && typeof decodedRefreshPayload.exp === 'number') {
    baseCookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(decodedRefreshPayload.exp * 1000),
    });
  }
};

export const getAuth = async () => {
  const baseCookies = await cookies();
  return {
    accessToken: baseCookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value,
    refreshToken: baseCookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value,
  };
};

export const removeAuth = async () => {
  const baseCookies = await cookies();
  baseCookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  baseCookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
};
