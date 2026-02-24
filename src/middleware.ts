import { COOKIE_NAMES, ENDPOINTS, ROUTES, TRY_SUBDOMAIN_WHITELISTED_ROUTES, getTrySubdomain } from '@/constants';
import { routing } from '@/i18n/routing';
import { decodeJWT } from '@/lib';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Types for better type safety
interface TokenRefreshResult {
  accessToken: string;
  response: NextResponse;
}

interface DecodedToken {
  decodedPayload?: {
    role?: string;
    exp?: number;
    [key: string]: unknown;
  };
}

const USER_ROLES = {
  ADMIN: 'admin',
  PROVIDER: 'provider',
  PATIENT: 'patient',
} as const;

const LOGIN_ROUTES = {
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_LOGIN,
  [USER_ROLES.PROVIDER]: ROUTES.PROVIDER_LOGIN,
  [USER_ROLES.PATIENT]: ROUTES.PATIENT_LOGIN,
} as const;

const HOME_ROUTES = {
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_ORDERS,
  [USER_ROLES.PROVIDER]: ROUTES.PROVIDER_HOME,
  [USER_ROLES.PATIENT]: ROUTES.PATIENT_HOME,
} as const;

// Enhanced function to safely clear cookies with proper logout
function clearAuthCookies(response: NextResponse): NextResponse {
  try {
    // Clear access token
    response.cookies.set({
      name: COOKIE_NAMES.ACCESS_TOKEN,
      value: '',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NEXT_PUBLIC_ENV === 'production',
      httpOnly: true,
    });

    // Clear refresh token
    response.cookies.set({
      name: COOKIE_NAMES.REFRESH_TOKEN,
      value: '',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NEXT_PUBLIC_ENV === 'production',
      httpOnly: true,
    });

    // Also try the delete method as backup
    response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
    response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);

    console.log('Authentication cookies cleared for logout');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
  return response;
}

// Enhanced function to get appropriate login route based on context
function getAppropriateLoginRoute(pathname: string, userRole?: string | null, fallbackRole?: string | null): string {
  try {
    // First priority: Use the user's actual role if available
    if (userRole && LOGIN_ROUTES[userRole as keyof typeof LOGIN_ROUTES]) {
      return LOGIN_ROUTES[userRole as keyof typeof LOGIN_ROUTES];
    }

    // Second priority: Use fallback role if provided
    if (fallbackRole && LOGIN_ROUTES[fallbackRole as keyof typeof LOGIN_ROUTES]) {
      return LOGIN_ROUTES[fallbackRole as keyof typeof LOGIN_ROUTES];
    }

    // Third priority: Determine from the current path
    if (isRouteType(pathname, ADMIN_ROUTES)) {
      return ROUTES.ADMIN_LOGIN;
    }
    if (isRouteType(pathname, PROVIDER_ROUTES)) {
      return ROUTES.PROVIDER_LOGIN;
    }
    if (isRouteType(pathname, PATIENT_ROUTES)) {
      return ROUTES.PATIENT_LOGIN;
    }

    // Final fallback: default to home page to avoid infinite redirects
    return ROUTES.HOME;
  } catch (error) {
    console.error('Error determining login route:', error);
    return ROUTES.HOME;
  }
}

// Enhanced error handler that always clears cookies and redirects to appropriate login
function handleAuthError(
  request: NextRequest,
  error?: unknown,
  userRole?: string | null,
  fallbackRole?: string | null
): NextResponse {
  try {
    if (error && process.env.NEXT_PUBLIC_ENV === 'development') {
      console.error('Authentication error:', error);
    }

    // Always log the user out by clearing cookies
    const loginRoute = getAppropriateLoginRoute(request.nextUrl.pathname, userRole, fallbackRole);
    const response = NextResponse.redirect(new URL(loginRoute, request.url));

    // Clear all authentication cookies to ensure complete logout
    return clearAuthCookies(response);
  } catch (redirectError) {
    console.error('Error creating error redirect:', redirectError);
    // Last resort: redirect to home with cleared cookies
    const response = NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    return clearAuthCookies(response);
  }
}

// Enhanced token refresh with better error handling and logout
async function refreshToken(refreshToken: string): Promise<string | { error: 'unauthorized'; role: string | null }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('API URL not configured');
      return { error: 'unauthorized', role: null };
    }

    // Validate refresh token format before making request
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      console.error('Invalid refresh token format');
      return { error: 'unauthorized', role: null };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${apiUrl}${ENDPOINTS.TOKEN_REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshToken.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Extract role from the refresh token before returning error
        let role: string | null = null;
        try {
          const decoded: DecodedToken = decodeJWT(refreshToken.trim());
          role = decoded?.decodedPayload?.role || null;
        } catch {
          role = null;
        }

        if (response.status === 401) {
          console.log('Token refresh unauthorized - will trigger logout');
          return { error: 'unauthorized', role };
        }

        console.error('Token refresh failed:', response.status, response.statusText);
        return { error: 'unauthorized', role };
      }

      const data = await response.json();
      const newAccessToken = data?.data?.accessToken;

      if (!newAccessToken || typeof newAccessToken !== 'string') {
        console.error('Invalid access token received from refresh');
        return { error: 'unauthorized', role: null };
      }

      return newAccessToken;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Extract role from refresh token before returning error
    let role: string | null = null;
    try {
      const decoded: DecodedToken = decodeJWT(refreshToken.trim());
      role = decoded?.decodedPayload?.role || null;
    } catch {
      role = null;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Token refresh timeout - will trigger logout');
      } else if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.error('Token refresh error:', error.message);
      } else {
        console.error('Token refresh failed - will trigger logout');
      }
    }
    return { error: 'unauthorized', role };
  }
}

// Safe JWT decoding with better error handling
function getUserRole(token: string): string | null {
  try {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return null;
    }

    const decoded: DecodedToken = decodeJWT(token.trim());
    const role = decoded?.decodedPayload?.role;

    if (!role || typeof role !== 'string') {
      return null;
    }

    // Validate role is one of expected values
    const validRoles = Object.values(USER_ROLES);
    return validRoles.includes(role as (typeof validRoles)[number]) ? role : null;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Enhanced role-based redirection with error handling
function redirectToRoleHome(role: string, request: NextRequest): NextResponse {
  try {
    const homeRoute = HOME_ROUTES[role as keyof typeof HOME_ROUTES];
    if (homeRoute) {
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }

    // If role is unknown, redirect to appropriate login and clear cookies
    console.warn(`Unknown role encountered: ${role} - will trigger logout`);
    return handleAuthError(request, `Unknown role: ${role}`);
  } catch (error) {
    console.error('Error in role-based redirect:', error);
    return handleAuthError(request, error);
  }
}

// Safe cookie value extraction
function getCookieValue(request: NextRequest, cookieName: string): string | null {
  try {
    const cookie = request.cookies.get(cookieName);
    const value = cookie?.value;
    return value && typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  } catch (error) {
    console.error(`Error getting cookie ${cookieName}:`, error);
    return null;
  }
}

// Enhanced token refresh handler with better error handling and logout
async function handleTokenRefresh(
  request: NextRequest,
  fallbackRole?: string | null
): Promise<TokenRefreshResult | NextResponse> {
  try {
    const refreshTokenValue = getCookieValue(request, COOKIE_NAMES.REFRESH_TOKEN);

    if (!refreshTokenValue) {
      console.log('No refresh token found - triggering logout');
      return handleAuthError(request, 'No refresh token', null, fallbackRole);
    }

    const newAccessTokenOrError = await refreshToken(refreshTokenValue);

    // Handle unauthorized error with role-based redirect and logout
    if (typeof newAccessTokenOrError === 'object' && newAccessTokenOrError?.error === 'unauthorized') {
      console.log('Token refresh unauthorized - triggering logout');
      return handleAuthError(request, 'Token refresh unauthorized', newAccessTokenOrError.role, fallbackRole);
    }

    const newAccessToken = newAccessTokenOrError as string;

    if (!newAccessToken) {
      console.log('No access token received - triggering logout');
      return handleAuthError(request, 'No access token received', null, fallbackRole);
    }

    // Validate the new token before setting it
    const role = getUserRole(newAccessToken);
    if (!role) {
      console.error('New access token has invalid role - triggering logout');
      return handleAuthError(request, 'Invalid role in new token', null, fallbackRole);
    }

    const response = NextResponse.next();

    try {
      const decoded: DecodedToken = decodeJWT(newAccessToken);
      const exp = decoded?.decodedPayload?.exp;
      const expirationTime = exp ? Math.floor((exp * 1000 - Date.now()) / 1000) : 3600;

      response.cookies.set({
        name: COOKIE_NAMES.ACCESS_TOKEN,
        value: newAccessToken,
        maxAge: Math.max(expirationTime, 60),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NEXT_PUBLIC_ENV === 'production',
        httpOnly: true,
      });

      return { accessToken: newAccessToken, response };
    } catch (error) {
      console.error('Error setting new access token - triggering logout:', error);
      return handleAuthError(request, error, role, fallbackRole);
    }
  } catch (error) {
    console.error('Token refresh handler error - triggering logout:', error);
    return handleAuthError(request, error, null, fallbackRole);
  }
}

// Route validation helper
function isRouteType(pathname: string, routes: string[]): boolean {
  try {
    return routes.some((route) => {
      if (!route || typeof route !== 'string') return false;
      return pathname.startsWith(route);
    });
  } catch (error) {
    console.error('Route validation error:', error);
    return false;
  }
}

// Check if user is already on the correct login page for their role
function isOnCorrectLoginPage(pathname: string, userRole: string | null): boolean {
  if (!userRole) return false;

  const expectedLoginRoute = LOGIN_ROUTES[userRole as keyof typeof LOGIN_ROUTES];
  return pathname === expectedLoginRoute;
}

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Main middleware function
export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const hostname = request.nextUrl.hostname;
    // Also check the Host header as fallback
    const hostHeader = request.headers.get('host') || hostname;

    // Skip middleware for static assets, API routes, and Next.js internal routes
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
    ) {
      return NextResponse.next();
    }

    // Restrict try subdomain to only whitelisted ad routes
    // Get try subdomain from environment variable (try-staging for staging, try for production/localhost)
    const trySubdomain = getTrySubdomain();
    const isActuallyOnTrySubdomain = hostHeader && hostHeader.startsWith(`${trySubdomain}.`);
    
    // Only apply restrictions if actually on try subdomain
    if (isActuallyOnTrySubdomain) {
      // Redirect home page routes to /ad/starter-pack on the same subdomain
      // Handle root path and locale-prefixed paths
      const isRootPath = pathname === '/';
      const isLocaleHomePath = routing.locales.some((locale) => {
        return pathname === `/${locale}` || pathname === `/${locale}/`;
      });

      if (isRootPath || isLocaleHomePath) {
        // Determine target path based on locale
        let targetPath = '/ad/starter-pack';
        
        if (isLocaleHomePath) {
          // Extract locale from pathname
          const localeMatch = pathname.match(/^\/(en|es)(\/)?$/);
          if (localeMatch) {
            const locale = localeMatch[1];
            targetPath = `/${locale}/ad/starter-pack`;
          }
        }

        // Build redirect URL on the same subdomain, preserving query params and hash
        const redirectUrl = new URL(
          targetPath + request.nextUrl.search + request.nextUrl.hash,
          request.nextUrl.origin
        );

        // Use 307 (Temporary Redirect) to preserve method and ensure proper asset loading
        return NextResponse.redirect(redirectUrl, 307);
      }
      // Check if pathname matches any whitelisted route
      // Remove leading slash and check against whitelisted routes
      const pathWithoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const isWhitelistedRoute = TRY_SUBDOMAIN_WHITELISTED_ROUTES.some((route) => {
        // Check direct match or if pathname starts with the whitelisted route
        return pathWithoutLeadingSlash === route || pathWithoutLeadingSlash.startsWith(`${route}/`);
      });
      
      // Check if pathname has locale prefix followed by whitelisted route
      const isLocaleWhitelistedRoute = routing.locales.some((locale) => {
        const localePrefix = `/${locale}/`;
        if (pathname.startsWith(localePrefix)) {
          const pathAfterLocale = pathname.slice(localePrefix.length);
          return TRY_SUBDOMAIN_WHITELISTED_ROUTES.some((route) => {
            return pathAfterLocale === route || pathAfterLocale.startsWith(`${route}/`);
          });
        }
        return false;
      });

      // Allow only whitelisted routes (with or without locale prefix)
      // For non-whitelisted routes, redirect to main domain using server-side redirect
      // This ensures CSS and other assets load properly on the redirected page
      if (!isWhitelistedRoute && !isLocaleWhitelistedRoute) {
        // Get base URL from environment variable
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        let mainDomain: string;
        
        if (hostname === `${trySubdomain}.localhost` || hostname.endsWith('.localhost')) {
          const port = request.nextUrl.port || '3000';
          mainDomain = `http://localhost:${port}`;
        } else if (baseUrl) {
          try {
            const url = new URL(baseUrl);
            mainDomain = `${url.protocol}//${url.host}`;
          } catch {
            // If baseUrl is invalid, fallback to removing try subdomain from current origin
            const currentOrigin = request.nextUrl.origin;
            const subdomainPrefix = `${trySubdomain}.`;
            if (currentOrigin.includes(`://${subdomainPrefix}`)) {
              mainDomain = currentOrigin.replace(`://${subdomainPrefix}`, '://');
            } else {
              mainDomain = currentOrigin;
            }
          }
        } else {
          // Fallback: remove try subdomain from current origin
          const currentOrigin = request.nextUrl.origin;
          const subdomainPrefix = `${trySubdomain}.`;
          if (currentOrigin.includes(`://${subdomainPrefix}`)) {
            mainDomain = currentOrigin.replace(`://${subdomainPrefix}`, '://');
          } else {
            mainDomain = currentOrigin;
          }
        }
        
        // Build redirect URL
        const redirectUrl = new URL(pathname + request.nextUrl.search + request.nextUrl.hash, mainDomain);
        
        // Only redirect if target is different from current URL
        if (redirectUrl.toString() !== request.url) {
          // Use 307 (Temporary Redirect) to preserve method and ensure proper asset loading
          return NextResponse.redirect(redirectUrl, 307);
        }
      }
    }

    // Check if the pathname starts with a locale
    const pathnameHasLocale = routing.locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // If request is for public ad routes with locale, handle with next-intl
    if (pathnameHasLocale && pathname.includes('/ad/')) {
      return intlMiddleware(request);
    }

    // Validate pathname
    if (!pathname || typeof pathname !== 'string') {
      console.error('Invalid pathname');
      return handleAuthError(request, 'Invalid pathname');
    }

    const hasAccessToken = request.cookies.has(COOKIE_NAMES.ACCESS_TOKEN);
    const hasRefreshToken = request.cookies.has(COOKIE_NAMES.REFRESH_TOKEN);

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
    const isAdminRoute = isRouteType(pathname, ADMIN_ROUTES);
    const isDoctorRoute = isRouteType(pathname, PROVIDER_ROUTES);
    const isPatientRoute = isRouteType(pathname, PATIENT_ROUTES);

    const hasBothCookies = hasAccessToken && hasRefreshToken;

    // Special handling for survey routes - always allow access
    if (
      pathname.startsWith(ROUTES.PATIENT_SURVEY) ||
      pathname.startsWith(ROUTES.PRODUCT_SURVEY) ||
      pathname.startsWith(ROUTES.PROVIDER_SURVEY)
    ) {
      return NextResponse.next();
    }

    // Special handling for ad routes - always allow access
    if (pathname.startsWith('/ad/')) {
      return NextResponse.next();
    }

    // Special handling for impersonate routes - always allow access (public magic link)
    if (pathname.startsWith(ROUTES.IMPERSONATE)) {
      return NextResponse.next();
    }

    // Handle public routes
    if (isPublicRoute) {
      // Check if user is trying to access login pages while already logged in
      const loginPages = [ROUTES.ADMIN_LOGIN, ROUTES.PROVIDER_LOGIN, ROUTES.PATIENT_LOGIN];
      const isLoginPage = loginPages.includes(pathname);

      if (isLoginPage && hasAccessToken) {
        try {
          const accessToken = getCookieValue(request, COOKIE_NAMES.ACCESS_TOKEN);
          if (typeof accessToken === 'string') {
            const role = getUserRole(accessToken);
            if (role) {
              // Check if user is on the correct login page for their role
              if (isOnCorrectLoginPage(pathname, role)) {
                // User is already authenticated and on correct login page, redirect to home
                return redirectToRoleHome(role, request);
              } else {
                // User is on wrong login page, redirect to correct one
                return redirectToRoleHome(role, request);
              }
            }
          }

          // If access token is invalid but refresh token exists, try refresh
          if (hasRefreshToken) {
            const refreshTokenValue = getCookieValue(request, COOKIE_NAMES.REFRESH_TOKEN);
            if (typeof refreshTokenValue === 'string') {
              const newAccessTokenOrError = await refreshToken(refreshTokenValue);
              if (typeof newAccessTokenOrError === 'string') {
                const role = getUserRole(newAccessTokenOrError);
                if (role) {
                  return redirectToRoleHome(role, request);
                }
              } else {
                // Refresh failed, clear cookies and allow login
                console.log('Token refresh failed on login page - clearing cookies');
                const response = NextResponse.next();
                return clearAuthCookies(response);
              }
            }
          }
        } catch (error) {
          console.error('Error handling login page redirect - clearing cookies:', error);
          // Clear cookies and allow access to login page
          const response = NextResponse.next();
          return clearAuthCookies(response);
        }
      } else if (isLoginPage && hasRefreshToken && !hasAccessToken) {
        try {
          const refreshTokenValue = getCookieValue(request, COOKIE_NAMES.REFRESH_TOKEN);
          if (typeof refreshTokenValue === 'string') {
            const newAccessTokenOrError = await refreshToken(refreshTokenValue);
            if (typeof newAccessTokenOrError === 'string') {
              const role = getUserRole(newAccessTokenOrError);
              if (role) {
                return redirectToRoleHome(role, request);
              }
            } else {
              // Refresh failed, clear cookies and allow login
              console.log('Token refresh failed on login page - clearing cookies');
              const response = NextResponse.next();
              return clearAuthCookies(response);
            }
          }
        } catch (error) {
          console.error('Error handling refresh token on login page - clearing cookies:', error);
          // Clear cookies and allow access to login page
          const response = NextResponse.next();
          return clearAuthCookies(response);
        }
      }

      return NextResponse.next();
    }

    // Helper function for protected route handling
    async function handleProtectedRoute(expectedRole: string): Promise<NextResponse> {
      try {
        // Try refresh if no access token but refresh token exists
        if (!hasAccessToken && hasRefreshToken) {
          const result = await handleTokenRefresh(request, expectedRole);
          if (typeof result === 'object' && 'accessToken' in result) {
            const role = getUserRole(result.accessToken);
            if (role === expectedRole) {
              return result.response;
            } else {
              // Wrong role after refresh - logout and redirect to appropriate login
              console.log(`Wrong role after refresh. Expected: ${expectedRole}, Got: ${role} - triggering logout`);
              return handleAuthError(request, 'Wrong role after refresh', role, expectedRole);
            }
          }
          // Token refresh failed - already handled logout in handleTokenRefresh
          return result instanceof NextResponse
            ? result
            : handleAuthError(request, 'Token refresh failed', null, expectedRole);
        }

        // No cookies at all - logout and redirect
        if (!hasBothCookies) {
          console.log('No auth cookies found - triggering logout');
          return handleAuthError(request, 'No auth cookies', null, expectedRole);
        }

        // Validate existing access token
        const accessToken = getCookieValue(request, COOKIE_NAMES.ACCESS_TOKEN);
        if (accessToken) {
          const role = getUserRole(accessToken);
          if (role === expectedRole) {
            return NextResponse.next();
          }
          // Wrong role - logout and redirect to appropriate login
          console.log(`Wrong role. Expected: ${expectedRole}, Got: ${role} - triggering logout`);
          return handleAuthError(request, 'Wrong role', role, expectedRole);
        }

        // Invalid access token - logout and redirect
        console.log('Invalid access token - triggering logout');
        return handleAuthError(request, 'Invalid access token', null, expectedRole);
      } catch (error) {
        console.error('Error in handleProtectedRoute - triggering logout:', error);
        return handleAuthError(request, error, null, expectedRole);
      }
    }

    // Handle role-specific routes with enhanced error handling
    if (isAdminRoute) {
      return await handleProtectedRoute(USER_ROLES.ADMIN);
    }

    if (isDoctorRoute) {
      return await handleProtectedRoute(USER_ROLES.PROVIDER);
    }

    if (isPatientRoute) {
      return await handleProtectedRoute(USER_ROLES.PATIENT);
    }

    // Default case - allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error - triggering logout:', error);
    // In case of any unexpected error, logout and redirect to appropriate login
    return handleAuthError(request, error);
  }
}

export const config = {
  matcher: '/:path*',
};

// Route configurations
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ADMIN_LOGIN,
  ROUTES.PROVIDER_LOGIN,
  ROUTES.PATIENT_LOGIN,
  ROUTES.PATIENT_FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.PROVIDER_FORGOT_PASSWORD,
  ROUTES.ADMIN_FORGOT_PASSWORD,
  ROUTES.PRODUCT_SURVEY,
  ROUTES.PROVIDER_SURVEY,
  // ROUTES.AFFILIATE_REGISTERATION, // Commented out - affiliate registration page not in use
  ROUTES.PRODUCT_SUMMARY,
  ROUTES.IMPERSONATE,
];

export const ADMIN_ROUTES = [
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

export const PROVIDER_ROUTES = [
  ROUTES.PROVIDER_HOME,
  ROUTES.PROVIDER_VISIT,
  ROUTES.PROVIDER_PENDING_ENCOUNTERS,
  ROUTES.PROVIDER_VIEW_ALL_PATIENTS,
];

export const PATIENT_ROUTES = [
  ROUTES.PATIENT_HOME,
  ROUTES.PATIENT_ACCOUNT,
  ROUTES.PATIENT_ORDERS,
  ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS,
  ROUTES.PATIENT_MESSAGES,
  ROUTES.PATIENT_SURVEYS,
  ROUTES.PATIENT_FIRST_LOGIN_UPDATE,
  ROUTES.PATIENT_REFILL,
  ROUTES.PATIENT_APPOINTMENTS,
];
