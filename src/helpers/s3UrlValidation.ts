/**
 * S3 URL validation and key extraction helpers
 * Provides secure validation and sanitization for S3 file URLs
 */

/**
 * Gets allowed S3 hostnames from environment variable with fallback
 * Environment variable format: NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES=host1.com,host2.com
 * @returns Array of allowed hostnames
 */
export function getAllowedS3Hostnames(): readonly string[] {
  const envHostnames = process.env.NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES;

  if (envHostnames) {
    // Parse comma-separated list and trim whitespace
    const hostnames = envHostnames
      .split(',')
      .map((host) => host.trim())
      .filter((host) => host.length > 0);

    if (hostnames.length > 0) {
      return hostnames;
    }
  }

  // Fallback to default hostnames if env var not set or empty
  return [];
}

// Initialize allowed hostnames (computed once at module load)
const ALLOWED_S3_HOSTNAMES = getAllowedS3Hostnames();

/**
 * Validates that a URL is from an allowed S3 bucket domain
 * @param url - The URL to validate
 * @returns true if the URL is from an allowed domain, false otherwise
 */
export function isValidS3Url(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow HTTPS protocol
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    // Check if hostname is in the allowed list
    return ALLOWED_S3_HOSTNAMES.includes(urlObj.hostname);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a file key to prevent path traversal attacks
 * Removes path traversal sequences (../, ./, etc.) and normalizes the path
 * @param key - The file key to sanitize
 * @returns Sanitized key or null if invalid
 */
export function sanitizeFileKey(key: string): string | null {
  if (!key || typeof key !== 'string') {
    return null;
  }

  // Remove leading/trailing slashes and whitespace
  let sanitized = key.trim().replaceAll(/(?:^(?:\/+))|(?:(?:\/+)$)/g, '');

  // Prevent path traversal attacks
  // Remove any occurrences of ../, ..\, ./, .\, or multiple slashes
  sanitized = sanitized
    .replaceAll(/\.\.[/\\]/g, '')
    .replaceAll(/\.[/\\]/g, '')
    .replaceAll(/\/+/g, '/');

  // Check for remaining path traversal attempts
  if (sanitized.includes('..') || sanitized.includes('\\')) {
    return null;
  }

  // Ensure the key is not empty after sanitization
  if (sanitized.length === 0) {
    return null;
  }

  return sanitized;
}

/**
 * Extracts and validates the S3 key from a full URL
 * @param fileKey - The S3 key or full URL
 * @returns Sanitized key or null if invalid
 */
export function extractAndSanitizeKey(fileKey: string): string | null {
  // If it's not a URL, treat it as a direct key
  if (!fileKey.startsWith('http://') && !fileKey.startsWith('https://')) {
    return sanitizeFileKey(fileKey);
  }

  // Validate URL is from allowed S3 bucket
  if (!isValidS3Url(fileKey)) {
    console.error('Invalid S3 URL: URL must be from an allowed S3 bucket domain');
    return null;
  }

  try {
    const urlObj = new URL(fileKey);
    // Extract pathname and remove leading slash
    const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;

    // Sanitize the extracted key
    return sanitizeFileKey(pathname);
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}
