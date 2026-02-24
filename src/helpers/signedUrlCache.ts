/**
 * Cache management for signed file URLs
 * Provides LRU cache with automatic expiration and cleanup
 */

// Cache configuration
export const CACHE_MAX_SIZE = 100; // Maximum number of entries in cache
export const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up expired entries every 5 minutes
export const CACHE_ENTRY_TTL = 5 * 60 * 1000; // 5 minutes TTL for cache entries

export interface CacheEntry {
  url: string;
  expiresAt: number;
  lastAccessed: number;
}

const urlCache = new Map<string, CacheEntry>();

// Cleanup interval reference
let cleanupIntervalId: NodeJS.Timeout | null = null;
let isInitialized = false;

/**
 * Cleans up expired entries from the cache
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of urlCache.entries()) {
    if (now >= entry.expiresAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => urlCache.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
  }
}

/**
 * Evicts least recently used entries when cache is full
 * Uses LRU (Least Recently Used) eviction policy
 */
export function evictLRUEntries(): void {
  if (urlCache.size < CACHE_MAX_SIZE) {
    return;
  }

  // Sort entries by lastAccessed time (oldest first)
  const entries = Array.from(urlCache.entries())
    .map(([key, entry]) => ({ key, lastAccessed: entry.lastAccessed }))
    .sort((a, b) => a.lastAccessed - b.lastAccessed);

  // Remove oldest entries until we're under the limit
  const entriesToRemove = entries.slice(0, urlCache.size - CACHE_MAX_SIZE + 1);
  entriesToRemove.forEach(({ key }) => urlCache.delete(key));

  console.log(`Evicted ${entriesToRemove.length} LRU cache entries`);
}

/**
 * Initializes periodic cache cleanup (idempotent - only initializes once)
 */
export function initializeCacheCleanup(): void {
  // Only initialize once
  if (isInitialized) {
    return;
  }

  // Set up periodic cleanup
  cleanupIntervalId = setInterval(() => {
    cleanupExpiredEntries();
  }, CACHE_CLEANUP_INTERVAL);

  // Run initial cleanup
  cleanupExpiredEntries();
  isInitialized = true;
}

/**
 * Stops the periodic cache cleanup interval
 * Useful for testing or cleanup scenarios
 */
export function stopCacheCleanup(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    isInitialized = false;
  }
}

/**
 * Gets a cached entry if it exists and is not expired
 * @param key - The cache key
 * @returns Cache entry or null if not found or expired
 */
export function getCachedEntry(key: string): CacheEntry | null {
  const cached = urlCache.get(key);
  const now = Date.now();

  if (cached && now < cached.expiresAt) {
    // Update last accessed time for LRU tracking
    cached.lastAccessed = now;
    return cached;
  }

  // Remove expired entry if found
  if (cached) {
    urlCache.delete(key);
  }

  return null;
}

/**
 * Sets a cache entry
 * @param key - The cache key
 * @param url - The URL to cache
 * @param ttl - Time to live in milliseconds (defaults to CACHE_ENTRY_TTL)
 */
export function setCachedEntry(key: string, url: string, ttl: number = CACHE_ENTRY_TTL): void {
  // Evict LRU entries if cache is full before adding new entry
  evictLRUEntries();

  const now = Date.now();
  urlCache.set(key, {
    url,
    expiresAt: now + ttl,
    lastAccessed: now,
  });
}

/**
 * Clears all cache entries
 */
export function clearCache(): void {
  urlCache.clear();
}

/**
 * Gets the current cache size
 */
export function getCacheSize(): number {
  return urlCache.size;
}
