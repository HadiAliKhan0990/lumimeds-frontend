import { getAuth } from '@/lib/tokens';
import { getCachedAuth } from '@/lib/baseQuery';
import { ENDPOINTS, ROUTES } from '@/constants';
import { PROVIDER_ROUTES } from '@/middleware';
import { removeAuthCookiesClient, setAuthCookiesClient } from '@/services/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetcherOptions<Body = unknown> {
  method?: HttpMethod;
  data?: Body;
  params?: Record<string, string | number>;
  _retry?: boolean; // Internal flag to prevent infinite retry loops
}

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

// ─── Helper function to handle logout redirect
const handleLogoutRedirect = () => {
  if (globalThis.window !== undefined) {
    const { pathname } = globalThis.window.location;

    // Prevent redirect loops if we're already on a login page
    if (
      pathname.startsWith('/admin/login') ||
      pathname.startsWith('/provider/login') ||
      pathname.startsWith('/patient/login')
    ) {
      return;
    }

    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    const isProviderRoute = PROVIDER_ROUTES.some((route) => pathname.startsWith(route));
    const isPatientRoute = PATIENT_ROUTES.some((route) => pathname.startsWith(route));

    if (isAdminRoute) {
      globalThis.window.location.href = '/admin/login';
    } else if (isProviderRoute) {
      globalThis.window.location.href = '/provider/login';
    } else if (isPatientRoute) {
      globalThis.window.location.href = '/patient/login';
    }
  }
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
      // Always get refresh token directly from cookies (not cached)
      const { refreshToken } = await getAuth();

      if (!refreshToken) {
        return null;
      }

      try {
        const response = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + ENDPOINTS.TOKEN_REFRESH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
  const errorData = await response.json();
  const errorMessage = errorData?.message || '';
// If refresh token is expired OR invalid, clear auth cookies and force re-login
// This mirrors baseQuery interceptor behavior

  // Handle expired refresh token
  const isRefreshTokenExpired =
    response.status === 401 &&
    (errorMessage === 'Refresh token has expired. Please login again' ||
      errorMessage.toLowerCase().includes('refresh token expired'));

  // Handle invalid refresh token (malformed, revoked, or compromised)
  const isInvalidRefreshToken =
    response.status === 401 &&
    (errorMessage === 'Invalid refresh token' ||
      errorMessage.toLowerCase().includes('invalid refresh token'));

  // Keep behavior consistent with baseQuery:
  // both expired AND invalid refresh tokens force logout
  // Covers cases where refresh token is missing, expired, or invalid

  if (isRefreshTokenExpired || isInvalidRefreshToken) {
    await removeAuthCookiesClient();
    handleLogoutRedirect();
  }

  return null;
}

        const data = await response.json();
        const newAccessToken = data?.data?.accessToken;

        if (newAccessToken) {
          const cookiesSuccess = await setAuthCookiesClient(newAccessToken, refreshToken);
          if (cookiesSuccess) {
            return newAccessToken;
          }
          // If setting cookies failed, return null to trigger retry or logout
          return null;
        }

        return null;
      } catch {
        // If an error occurs during token refresh, return null
        return null;
      }
    } finally {
      // Clear the promise so next 401 can trigger a new refresh if needed
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

// ─── Helper to build query string from params
const buildQueryString = (params: Record<string, string | number>): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
};

// ─── Helper to check and handle 403 deactivation errors
const handleDeactivationError = async (res: Response, isLoginEndpoint: boolean): Promise<void> => {
  if (res.status === 403 && !isLoginEndpoint) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      const message = errorData?.message || '';

      if (message.toLowerCase().includes('deactivated') || message.toLowerCase().includes('suspended')) {
        // Account has been deactivated, logout and redirect
        await removeAuthCookiesClient();
        handleLogoutRedirect();
        throw new Error(message);
      }
    }
  }
};

const handle401Error = async <T, Body>(
  res: Response,
  input: RequestInfo,
  options: FetcherOptions<Body>,
  isLoginEndpoint: boolean
): Promise<T | null> => {
  const { method, data, params, _retry } = options;

  if (res.status === 401 && !_retry && !isLoginEndpoint) {

    const newAccessToken = await refreshAuthToken();

    if (newAccessToken) {
      // Retry the request with the new token
      return fetcher<T, Body>(input, {
        method,
        data,
        params,
        _retry: true, // Mark as retry to prevent infinite loops on the same request
      });
    }

    // If refresh failed, remove auth and redirect
    await removeAuthCookiesClient();
    handleLogoutRedirect();
  }

  return null;
};

// ─── Helper to prepare request body
const prepareRequestBody = (data: unknown, isForm: boolean): BodyInit | undefined => {
  if (data == null) {
    return undefined;
  }

  if (isForm) {
    return data as BodyInit;
  }

  return JSON.stringify(data);
};


export async function fetcher<T = unknown, Body = unknown>(
  input: RequestInfo,
  options: FetcherOptions<Body> = {}
): Promise<T> {
  const { method = 'GET', data, params } = options;
  const inputUrl = typeof input === 'string' ? input : input.url;
  let url = `${process.env.NEXT_PUBLIC_API_URL || ''}${inputUrl}`;
  const isLoginEndpoint = inputUrl.toLowerCase().includes('login');

  if (params && Object.keys(params).length > 0) {
    url += `?${buildQueryString(params)}`;
  }

  const { accessToken } = await getCachedAuth();
  const isForm = data instanceof FormData;

  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: prepareRequestBody(data, isForm),
    cache: 'no-cache',
  });

  // Check for 403 errors with account deactivation message
  await handleDeactivationError(res, isLoginEndpoint);

  // Check for 401 errors and attempt token refresh
  const retryResult = await handle401Error<T, Body>(res, input, options, isLoginEndpoint);
  if (retryResult !== null) {
    return retryResult;
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();

  return payload as T;
}
