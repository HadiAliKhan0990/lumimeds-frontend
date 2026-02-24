import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJWT } from '@/lib';
import { COOKIE_NAMES } from '@/constants';
import { Response } from '@/lib/types';

/**
 * POST /api/auth/session
 * Sets authentication cookies (accessToken and refreshToken)
 * Body: { accessToken: string, refreshToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

    if (!accessToken || !refreshToken) {
      const errorResponse: Response = {
        success: false,
        message: 'accessToken and refreshToken are required',
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const baseCookies = await cookies();
    const { decodedPayload: decodedAccessPayload } = decodeJWT(accessToken || '');
    const { decodedPayload: decodedRefreshPayload } = decodeJWT(refreshToken || '');

    // Set access token cookie
    if (decodedAccessPayload && typeof decodedAccessPayload.exp === 'number') {
      baseCookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(decodedAccessPayload.exp * 1000),
        path: '/',
      });
    }

    // Set refresh token cookie
    if (decodedRefreshPayload && typeof decodedRefreshPayload.exp === 'number') {
      baseCookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(decodedRefreshPayload.exp * 1000),
        path: '/',
      });
    }

    const successResponse: Response = {
      success: true,
      message: 'Session saved successfully',
      statusCode: 200,
    };
    return NextResponse.json(successResponse);
  } catch {
    const errorResponse: Response = {
      success: false,
      message: 'Failed to login',
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * Deletes authentication cookies (logout)
 */
export async function DELETE() {
  try {
    const baseCookies = await cookies();
    baseCookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
    baseCookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
    const successResponse: Response = {
      success: true,
      message: 'Session deleted successfully',
      statusCode: 200,
    };
    return NextResponse.json(successResponse);
  } catch {
    const errorResponse: Response = {
      success: false,
      message: 'Failed to logout',
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
