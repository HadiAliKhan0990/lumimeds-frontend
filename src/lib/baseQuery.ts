import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/tokens';
import { ENDPOINTS, ROUTES } from '@/constants';
import { Error } from '@/lib/types';
import { PROVIDER_ROUTES } from '@/middleware';
import { removeAuthCookiesClient, setAuthCookiesClient } from '@/services/auth';


// Define route constants (matching middleware)
const ADMIN_ROUTES = [
  ROUTES.ADMIN_HOME,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_ADD_PATIENTS,
  ROUTES.ADMIN_APPOINTMENTS,
  ROUTES.ADMIN_LEGEND,
  ROUTES.ADMIN_ACCOUNT,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_MESSAGES,
  ROUTES.ADMIN_MEDICATIONS,
  ROUTES.ADMIN_VIDEO_CALLS,
  ROUTES.ADMIN_SALES,
  ROUTES.ADMIN_PHARMACY,
  ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION,
];

const PATIENT_ROUTES = [
  ROUTES.PATIENT_HOME,
  ROUTES.PATIENT_ACCOUNT,
  ROUTES.PATIENT_ORDERS,
  ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS,
  ROUTES.PATIENT_MESSAGES,
  ROUTES.PATIENT_SURVEYS,
  ROUTES.PATIENT_FIRST_LOGIN_UPDATE,
  ROUTES.PATIENT_REFILL,
];

// ─── Augment AxiosRequestConfig to carry our custom skipAuth flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean; // Flag to prevent infinite retry loops
  }
}

// ─── Create a single axios instance with baseURL from env
export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});

// ─── Define the shape of requests to our RTK Query baseQuery
export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  skipAuth?: boolean;
  responseType?: AxiosRequestConfig['responseType'];
}

// ─── Helper function to determine login route based on pathname
const getLoginRoute = (pathname?: string): string => {
  if (!pathname) {
    return ROUTES.PATIENT_LOGIN; // Default fallback
  }

  // Prevent redirect loops if we're already on a login page
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/provider/login') ||
    pathname.startsWith('/patient/login')
  ) {
    return ROUTES.PATIENT_LOGIN; // Return default to avoid loops
  }

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isProviderRoute = PROVIDER_ROUTES.some((route) => pathname.startsWith(route));
  const isPatientRoute = PATIENT_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    return ROUTES.ADMIN_LOGIN;
  } else if (isProviderRoute) {
    return ROUTES.PROVIDER_LOGIN;
  } else if (isPatientRoute) {
    return ROUTES.PATIENT_LOGIN;
  }

  return ROUTES.PATIENT_LOGIN; // Default fallback
};

// ─── Helper function to handle logout redirect
const handleLogoutRedirect = (pathname?: string) => {
  // Server-side: use Next.js redirect
  // Note: redirect() throws a special error that Next.js catches in Server Components/Actions
  // In axios interceptors, this may not work perfectly since we're not in the Next.js request context
  if (typeof window === 'undefined') {
    try {
      const loginRoute = getLoginRoute(pathname);
      redirect(loginRoute);
    } catch {
      // redirect() throws an error that Next.js should catch
      // If we're not in the right context, this will be a regular error
    }
    return;
  }

  // Client-side: use window.location.href (redirect() doesn't work on client)
  // TypeScript now knows window is defined after the check above
  const currentPathname = pathname || window.location.pathname;
  const loginRoute = getLoginRoute(currentPathname);

  // Prevent redirect loops if we're already on a login page
  if (
    currentPathname.startsWith('/admin/login') ||
    currentPathname.startsWith('/provider/login') ||
    currentPathname.startsWith('/patient/login')
  ) {
    return;
  }

  window.location.href = loginRoute;
};

// ─── Client-side token cache
let cachedToken: string | null = null;
let tokenCacheTime: number = 0;
let tokenFetchPromise: Promise<{ accessToken: string | null; refreshToken: string | null }> | null = null;
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_BUFFER = 1 * 60 * 1000; // Refresh 1 minutes before expiry

// ─── Helper to decode JWT and get expiration time
const decodeJWT = (token: string): { exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
};

// ─── Check if token is expired or about to expire
const isTokenExpiredOrExpiring = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true; // If we can't decode, treat as expired

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();

  // Token is expired or will expire within TOKEN_REFRESH_BUFFER
  return expirationTime <= now + TOKEN_REFRESH_BUFFER;
};

// ─── Helper to normalize auth response (convert undefined to null)
const normalizeAuth = (auth: {
  accessToken?: string | null;
  refreshToken?: string | null;
}): { accessToken: string | null; refreshToken: string | null } => {
  return {
    accessToken: auth.accessToken ?? null,
    refreshToken: auth.refreshToken ?? null,
  };
};

// ─── Helper to get token with client-side caching and proactive refresh
export const getCachedAuth = async (): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
  // Server-side: use getAuth directly (no caching needed, React cache handles it)
  if (typeof window === 'undefined') {
    const auth = await getAuth();
    return normalizeAuth(auth);
  }

  // Client-side: check if cached token is valid and not expired/expiring
  const now = Date.now();
  if (cachedToken && now - tokenCacheTime < TOKEN_CACHE_TTL) {
    // Check if token is expired or about to expire
    if (!isTokenExpiredOrExpiring(cachedToken)) {
      return { accessToken: cachedToken, refreshToken: null };
    }

    // Token is expiring soon, refresh it proactively
    try {
      const newToken = await refreshAuthToken();
      if (newToken) {
        cachedToken = newToken;
        tokenCacheTime = Date.now();
        return { accessToken: newToken, refreshToken: null };
      }
    } catch (error) {
      // If refresh fails, fall through to fetch fresh token
      console.error('Proactive token refresh failed:', error);
    }
  }

  // If there's already a fetch in progress, reuse that promise
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  // Fetch fresh token from server action
  tokenFetchPromise = getAuth()
    .then((auth) => {
      const normalized = normalizeAuth(auth);
      cachedToken = normalized.accessToken;
      tokenCacheTime = now;
      return normalized;
    })
    .catch(() => {
      // If server action fails, return cached token as fallback if available
      if (cachedToken && !isTokenExpiredOrExpiring(cachedToken)) {
        return { accessToken: cachedToken, refreshToken: null };
      }
      return { accessToken: null, refreshToken: null };
    })
    .finally(() => {
      // Clear the promise so next call can fetch fresh token
      tokenFetchPromise = null;
    });

  return tokenFetchPromise;
};

// ─── Clear token cache (call when token is refreshed or removed)
export const clearTokenCache = () => {
  cachedToken = null;
  tokenCacheTime = 0;
  tokenFetchPromise = null;
  refreshTokenPromise = null;
};

// ─── Shared refresh token promise to prevent multiple simultaneous refresh calls
let refreshTokenPromise: Promise<string | null> | null = null;

// ─── Helper function to refresh token (with promise caching to prevent multiple calls)
const refreshAuthToken = async (): Promise<string | null> => {
  // If a refresh is already in progress, return the existing promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // Create a new refresh promise
  refreshTokenPromise = (async (): Promise<string | null> => {
    try {
      // Get refresh token from cookies (don't clear cache yet)
      const auth = await getAuth();
      const { refreshToken } = normalizeAuth(auth);

      if (!refreshToken) {
        return null;
      }

      try {
        const { data } = await axios.post((process.env.NEXT_PUBLIC_API_URL || '') + ENDPOINTS.TOKEN_REFRESH, {
          refreshToken,
        });

        const newAccessToken = data?.data?.accessToken;

        if (newAccessToken) {
          const cookiesSuccess = await setAuthCookiesClient(newAccessToken, refreshToken);

          if (cookiesSuccess) {
            // Update cache with new token
            cachedToken = newAccessToken;
            tokenCacheTime = Date.now();

            return newAccessToken;
          }
          // If setting cookies failed, return null to trigger retry or logout
          return null;
        }

        return null;
      } catch (error) {
        const err = error as AxiosError;
        const statusCode = err?.response?.status;
        const errorData = err?.response?.data as Error['data'];
        const errorMessage = errorData?.message || '';

        // Handle expired refresh token
        const isRefreshTokenExpired =
          statusCode === 401 &&
          (errorMessage === 'Refresh token has expired. Please login again' ||
            errorMessage.toLowerCase() === 'refresh token has expired' ||
            errorMessage.toLowerCase().includes('refresh token expired'));

        // Handle invalid refresh token (malformed, compromised, etc.)
        const isInvalidRefreshToken =
          statusCode === 401 &&
          (errorMessage === 'Invalid refresh token' ||
            errorMessage.toLowerCase() === 'invalid refresh token' ||
            errorMessage.toLowerCase().includes('invalid refresh token'));

        // Clear cookies for both expired AND invalid tokens
        if ((isRefreshTokenExpired || isInvalidRefreshToken) && globalThis.window !== undefined) {
          console.log(
            isRefreshTokenExpired
              ? 'Refresh token expired - clearing auth cookies'
              : 'Invalid refresh token - clearing auth cookies'
          );
          await removeAuthCookiesClient();
          clearTokenCache();
          handleLogoutRedirect();
        } else if (statusCode === 401) {
// Debug log for unexpected 401 during refresh
          // Log other 401s for debugging but don't clear cookies
          console.warn('Token refresh returned 401 but message does not indicate expired/invalid token:', errorMessage);
        } else {
          // Network errors, 500s, etc. - log but don't clear cookies
          console.error('Token refresh failed with non-401 error:', statusCode, errorMessage);
        }

        return null;
      }
    } finally {
      // Clear the promise so next 401 can trigger a new refresh if needed
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

// ─── BaseQueryFn for RTK Query using our axios client
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
  async ({ url, method, data, params, headers, skipAuth, responseType }) => {
    try {
      const result = await client.request({
        url,
        method,
        data,
        params,
        headers,
        skipAuth,
        responseType,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// ─── Request Interceptor: attaches token unless skipAuth is true
type InternalConfig = InternalAxiosRequestConfig & { skipAuth?: boolean };

client.interceptors.request.use(async (config: InternalConfig) => {
  // If skipAuth is set, bail out immediately
  if (config.skipAuth) {
    delete config.skipAuth;
    return config;
  }

  // Use cached version to avoid multiple server round-trips
  const { accessToken } = await getCachedAuth();

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ─── Response Interceptor: handles token refresh and retry logic
client.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;
// Check if this is a 403 error with account deactivation message
// BUT skip this check for login endpoints (let the login form handle the error)
// Check if this is a 401 error and we haven't already tried to refresh

    if (error.response?.status === 403 && !error.config?.url?.toLowerCase()?.includes('login')) {
      const errorData = error.response?.data as Error['data'];
      const message = errorData?.message || '';

      if (message.toLowerCase().includes('deactivated') || message.toLowerCase().includes('suspended')) {
        // Account has been deactivated, logout and redirect (client-side only)
        if (typeof window !== 'undefined') {
          await removeAuthCookiesClient();
          clearTokenCache();
          handleLogoutRedirect();
        }
        throw error;
      }
    }


    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuth &&
      !error.config?.url?.toLowerCase()?.includes('login') &&
      !error.config?.url?.toLowerCase()?.includes('/hubspot/contact/email-consent') &&
      !error.config?.url?.toLowerCase()?.includes('/hubspot/contact')
    ) {
      // Check for "Missing or invalid token" error message
      const errorData = error.response?.data as Error['data'];
      const errorMessage = errorData?.message || '';
      const isMissingOrInvalidToken = 
        errorMessage.toLowerCase().includes('missing or invalid token') ||
        (errorMessage.toLowerCase().includes('missing') && errorMessage.toLowerCase().includes('invalid token'));

      // If it's "Missing or invalid token", redirect to login based on role
      if (isMissingOrInvalidToken && globalThis.window !== undefined) {
        // Get role from token or pathname
        const getRoleAndRedirect = async () => {
          try {
            const { accessToken } = await getCachedAuth();
            let role: string | null = null;

          
        if (accessToken) {
            const decoded = decodeJWT(accessToken) as { decodedPayload?: { role?: string } };
           role = decoded?.decodedPayload?.role || null;
          }

            // If no role from token, determine from pathname
            if (!role) {
              const pathname = window.location.pathname;
              if (pathname.includes('/admin')) {
                role = 'admin';
              } else if (pathname.includes('/provider')) {
                role = 'provider';
              } else if (pathname.includes('/patient')) {
                role = 'patient';
              }
            }

            // Clear auth cookies
            await removeAuthCookiesClient();
            clearTokenCache();

            // Redirect based on role
            if (role === 'admin') {
              window.location.href = '/admin/login';
            } else if (role === 'provider') {
              window.location.href = '/provider/login';
            } else if (role === 'patient') {
              window.location.href = '/patient/login';
            } else {
              // Default to admin login if role cannot be determined
              window.location.href = '/patient/login';
            }
          } catch (err) {
            console.error('Error handling token redirect:', err);
            // Fallback redirect based on pathname
            const pathname = window.location.pathname;
            if (pathname.includes('/admin')) {
              window.location.href = '/admin/login';
            } else if (pathname.includes('/provider')) {
              window.location.href = '/provider/login';
            } else if (pathname.includes('/patient')) {
              window.location.href = '/patient/login';
            } else {
              window.location.href = '/patient/login';
            }
          }
        };

        getRoleAndRedirect();
        throw error;
      }

      // Mark this request as retried to prevent infinite loops on the same request
      originalRequest._retry = true;

      try {
        // Always attempt to refresh the token on 401
        // If multiple 401s occur simultaneously, they'll share the same refresh promise
        const newAccessToken = await refreshAuthToken();
// If refresh returned null, it might have already cleared cookies
// (if refresh token expired) or it's a temporary error
// Don't clear cookies again here - let refreshAuthToken handle it
// Just throw the original error so the UI can handle it
        if (newAccessToken) {
          // Update the original request with new token
          // Note: refreshAuthToken already updates the token cache, so next requests will use the new token
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request with the new token
          return client.request(originalRequest);
        }

   
      } catch (refreshError) {
       
        console.error('Token refresh threw an error:', refreshError);
      }

      // Re-throw the original 401 error
      throw error;
    }

    // For all other errors or if retry failed, reject the promise
    throw error;
  }
);
