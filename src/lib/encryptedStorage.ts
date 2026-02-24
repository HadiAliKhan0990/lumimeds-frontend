'use client';

import { encryptData, decryptData, migrateToEncrypted, isEncrypted } from './encryption';

/**
 * Enhanced encrypted storage utility for Redux slices
 * Provides both sync and async operations for different use cases
 */

// Cache for synchronous access during initial load
const storageCache = new Map<string, unknown>();

/**
 * Load from encrypted storage (sync)
 */
export function loadEncrypted<T>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;

    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return undefined;

    // Migrate existing unencrypted data if needed
    migrateToEncrypted(key);
    const updatedData = localStorage.getItem(key);
    if (!updatedData) return undefined;

    const decryptedData = decryptData(updatedData);

    // Validate decrypted data is valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(decryptedData);
    } catch (parseError) {
      console.warn(`Decrypted data for key "${key}" is not valid JSON:`, parseError);
      return undefined;
    }

    // Update cache
    storageCache.set(key, parsedData);

    return parsedData;
  } catch (err) {
    console.warn(`Error loading encrypted data for key "${key}":`, err);
    return undefined;
  }
}

/**
 * Save to encrypted storage (sync)
 */
export function saveEncrypted<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined') return;

    const serialized = JSON.stringify(data);
    const encrypted = encryptData(serialized);
    localStorage.setItem(key, encrypted);

    // Update cache
    storageCache.set(key, data);
  } catch (err) {
    console.error(`Error saving encrypted data for key "${key}":`, err);
  }
}

/**
 * Legacy queue variables - no longer needed with crypto-js synchronous operations
 */

export function queueEncryptedSave<T>(key: string, data: T): void {
  // Since crypto-js is synchronous, we can save directly
  saveEncrypted(key, data);
}

// Removed processStorageQueue since crypto-js is synchronous

/**
 * Synchronous fallback for initial loads (less secure)
 */
export function loadSync<T>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;

    // First check cache
    const cached = storageCache.get(key);
    if (cached !== undefined) return cached as T;

    // Fallback to direct localStorage access
    const serialized = localStorage.getItem(key);
    if (!serialized) return undefined;

    // Handle both encrypted and plaintext values gracefully
    let content: string;
    try {
      if (isEncrypted(serialized)) {
        content = decryptData(serialized);
        // If decryption returns empty string or fails, try fallback
        if (!content) {
          console.warn(`Decryption returned empty string for key "${key}", trying fallback`);
          content = serialized;
        }
      } else {
        content = serialized;
      }
    } catch (decryptErr) {
      console.warn(`Decryption failed for key "${key}", using raw data:`, decryptErr);
      content = serialized;
    }

    try {
      const parsed = JSON.parse(content);
      storageCache.set(key, parsed);
      return parsed;
    } catch (parseErr) {
      console.warn(`Error parsing data for key "${key}" during sync load:`, parseErr);
      return undefined;
    }
  } catch (err) {
    console.warn(`Error loading sync data for key "${key}":`, err);
    return undefined;
  }
}
