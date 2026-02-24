/**
 * Configuration for try subdomain functionality
 */
export interface TrySubdomainConfig {
  /** The subdomain prefix (e.g., 'try' or 'try-staging') */
  subdomain: string;
  /** Routes that are allowed on the try subdomain */
  whitelistedRoutes: string[];
  /** Base URL of the main domain */
  baseUrl: string;
}

/**
 * Context value for try subdomain provider
 */
export interface TrySubdomainContextValue {
  /** Whether the current page is on the try subdomain */
  isTrySubdomain: boolean;
  /** Optional configuration for try subdomain */
  config?: TrySubdomainConfig;
}
