import type { TrySubdomainConfig } from '@/types/trySubdomain';

/**
 * Generates the blocking script that runs before React hydration
 * to handle try subdomain detection, content hiding, and redirects.
 * 
 * This script:
 * 1. Detects if the current page is on the try subdomain
 * 2. Sets data attributes and injects CSS to hide try-subdomain-specific content
 * 3. Handles redirects for non-whitelisted routes (fallback to middleware)
 * 
 * @param config - Configuration object containing subdomain, whitelisted routes, and base URL
 * @returns The generated JavaScript code as a string
 */
export function generateTrySubdomainBlockingScript(config: TrySubdomainConfig): string {
  const { subdomain, baseUrl, whitelistedRoutes } = config;
  const whitelistedRoutesJson = JSON.stringify(whitelistedRoutes);

  return `
    (function() {
      if (typeof window === 'undefined') return;
      var hostname = window.location.hostname;
      var pathname = window.location.pathname;
      var search = window.location.search;
      var hash = window.location.hash;
      
      // Get try subdomain and base URL from environment (injected at build time)
      var trySubdomain = '${subdomain}';
      var baseUrl = '${baseUrl}';
      var whitelistedRoutes = ${whitelistedRoutesJson};
      
      // Check if we're on try subdomain (supports both 'try' and 'try-staging')
      var isTrySubdomain = hostname.startsWith(trySubdomain + '.');
      
      // Set data attribute on html element to indicate try subdomain (for preventing Klarna icon flash)
      // Also add inline style to hide Klarna icon and "Injections" text immediately
      if (isTrySubdomain) {
        document.documentElement.setAttribute('data-try-subdomain', 'true');
        // Add style to hide Klarna icon and "Injections" text immediately (before React hydration)
        var style = document.createElement('style');
        style.id = 'hide-try-subdomain-content';
        style.textContent = '[data-klarna-icon] { display: none !important; } [data-injections-text] { display: none !important; }';
        document.head.appendChild(style);
      }
      
      // If not on try subdomain, no redirect needed
      if (!isTrySubdomain) {
        return;
      }
      
      // Check if this is a whitelisted route
      var pathWithoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      var isWhitelistedRoute = whitelistedRoutes.some(function(route) {
        return pathWithoutLeadingSlash === route || pathWithoutLeadingSlash.startsWith(route + '/');
      });
      
      // If on try subdomain and NOT a whitelisted route, redirect to main domain
      // Note: Middleware should handle this redirect server-side, but this is a fallback
      // in case middleware doesn't catch it (e.g., client-side navigation)
      if (!isWhitelistedRoute) {
        // Prevent redirect loops: check if we've already redirected recently
        var redirectKey = '_try_redirect_attempt';
        var lastRedirect = sessionStorage.getItem(redirectKey);
        var now = Date.now();
        
        // If we redirected in the last 2 seconds, don't redirect again (prevent loops)
        if (lastRedirect && (now - parseInt(lastRedirect, 10)) < 2000) {
          sessionStorage.removeItem(redirectKey);
          return; // Stop redirecting to prevent loop
        }
        
        // Mark that we're about to redirect
        sessionStorage.setItem(redirectKey, now.toString());
        
        // Determine main domain
        var mainDomain;
        if (hostname === trySubdomain + '.localhost' || hostname.endsWith('.localhost')) {
          var port = window.location.port || '3000';
          mainDomain = 'http://localhost:' + port;
        } else if (baseUrl) {
          // Use baseUrl from environment variable
          try {
            var url = new URL(baseUrl);
            mainDomain = url.protocol + '//' + url.host;
          } catch (e) {
            // If baseUrl is invalid, fallback to removing try subdomain from current origin
            var currentOrigin = window.location.origin;
            var subdomainPrefix = trySubdomain + '.';
            if (currentOrigin.indexOf('://' + subdomainPrefix) !== -1) {
              mainDomain = currentOrigin.replace('://' + subdomainPrefix, '://');
            } else {
              mainDomain = currentOrigin;
            }
          }
        } else {
          // Fallback: remove try subdomain from current origin
          var currentOrigin = window.location.origin;
          var subdomainPrefix = trySubdomain + '.';
          if (currentOrigin.indexOf('://' + subdomainPrefix) !== -1) {
            mainDomain = currentOrigin.replace('://' + subdomainPrefix, '://');
          } else {
            mainDomain = currentOrigin;
          }
        }
        
        // Build redirect URL
        var redirectUrl = mainDomain + pathname + search + hash;
        
        // Only redirect if target is different from current location
        if (redirectUrl !== window.location.href) {
          // Fallback client-side redirect (middleware should handle this server-side)
          // Use replace to ensure proper full page load with CSS
          window.location.replace(redirectUrl);
        } else {
          sessionStorage.removeItem(redirectKey);
        }
      }
    })();
  `;
}
