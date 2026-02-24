'use client';

import CryptoJS from 'crypto-js';

/**
 * Encryption utility for localStorage data with backward compatibility
 * Uses versioning to handle multiple encryption schemes
 */

// Encryption version - increment when changing encryption parameters
const ENCRYPTION_VERSION = 'v2';

// Static key/salt from environment for v2 (client-safe via NEXT_PUBLIC_*)
const STATIC_KEY = (process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '').trim();
const STATIC_SALT = (process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'lumimeds-salt-2024').trim();

function getStaticKeyOrThrow(): string {
  // Guard: static key must be present in env for v2
  if (!STATIC_KEY) {
    // Do not throw during SSR to avoid crashing builds; return a deterministic fallback
    if (typeof window === 'undefined') {
      return 'fallback-key-server-side-lumimeds-2024'.padEnd(32, '0').substring(0, 32);
    }
    console.warn('Missing NEXT_PUBLIC_ENCRYPTION_KEY; using weak fallback key. Set it in your env.');
    return 'weak-fallback-key-lumimeds'.padEnd(32, '0').substring(0, 32);
  }
  return STATIC_KEY;
}

// Generate a stable device key with fallback (used for legacy v1 only)
function generateDeviceKey(): string {
  if (typeof window === 'undefined') {
    return 'fallback-key-server-side-lumimeds-2024'.padEnd(32, '0').substring(0, 32);
  }

  // Check if we have a stored device key first
  const storedKey = localStorage.getItem('lumimeds-device-key');
  if (storedKey) {
    return storedKey;
  }

  // Try to get a stable identifier from the browser
  let deviceId = localStorage.getItem('lumimeds-device-id');
  if (!deviceId) {
    // Create a persistent device ID if none exists
    deviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    try {
      localStorage.setItem('lumimeds-device-id', deviceId);
    } catch (e) {
      console.warn('Could not store device ID:', e);
      // Fallback to a less stable but consistent identifier
      deviceId = [navigator.userAgent, screen.width + 'x' + screen.height, navigator.language].join('|');
    }
  }

  // Derive a key from the device ID with a fixed salt
  const derivedKey = CryptoJS.PBKDF2(deviceId, 'lumimeds-fixed-salt-2024', {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();

  // Store the derived key for future use
  try {
    localStorage.setItem('lumimeds-device-key', derivedKey);
  } catch (e) {
    console.warn('Could not store device key:', e);
  }

  return derivedKey;
}

// Generate a proper encryption key using PBKDF2 with simple cache
const derivedKeyCache = new Map<string, string>();
function deriveKey(password: string, salt: string): string {
  const cacheKey = `${password}|${salt}`;
  const cached = derivedKeyCache.get(cacheKey);
  if (cached) return cached;

  const derived = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  }).toString();

  derivedKeyCache.set(cacheKey, derived);
  return derived;
}

function tryDecryptWithKey(ciphertext: string, key: string): string | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
    const plain = decrypted.toString(CryptoJS.enc.Utf8);
    return plain || null;
  } catch (err) {
    console.debug('Decryption failed, returning null:', err);
    return null;
  }
}

function tryDecryptV2(ciphertext: string): string | null {
  const staticKey = getStaticKeyOrThrow();
  const key = deriveKey(staticKey, STATIC_SALT);
  return tryDecryptWithKey(ciphertext, key);
}

function tryDecryptV1(ciphertext: string): string | null {
  const deviceKey = generateDeviceKey();
  const salt = 'lumimeds-salt-2024';
  const key = deriveKey(deviceKey, salt);
  return tryDecryptWithKey(ciphertext, key);
}

/**
 * Encrypt data with versioning
 */
export function encryptData(data: string): string {
  try {
    // v2: use static key+salt from env
    const staticKey = getStaticKeyOrThrow();
    const key = deriveKey(staticKey, STATIC_SALT);

    const encrypted = CryptoJS.AES.encrypt(data, key);

    // Prepend version identifier to encrypted data
    return `${ENCRYPTION_VERSION}:${encrypted.toString()}`;
  } catch (error) {
    console.warn('Encryption failed, using fallback:', error);
    // Return unencrypted data with version marker
    return `plain:${data}`;
  }
}

/**
 * Decrypt data with version awareness
 */
export function decryptData(encryptedData: string): string {
  try {
    // Check if data has version prefix
    if (encryptedData.includes(':')) {
      const [version, data] = encryptedData.split(':', 2);

      switch (version) {
        case 'v2': {
          const plain = tryDecryptV2(data);
          if (plain) return plain;
          throw new Error('Decryption resulted in empty string for v2');
        }
        case 'v1': {
          const plain = tryDecryptV1(data);

          if (plain) return plain;
          throw new Error('Decryption resulted in empty string');
        }
        case 'plain': {
          // Unencrypted data with version marker
          return data;
        }
        default: {
          // Unknown version - try to decrypt with current method
          console.warn(`Unknown encryption version: ${version}, trying current method`);
          // Try v2 first
          const d2 = tryDecryptV2(data);
          if (d2) return d2;
          // Then v1 as legacy fallback
          const d1 = tryDecryptV1(data);
          if (d1) return d1;
          throw new Error('Fallback decryption failed');
        }
      }
    } else {
      // No version prefix - legacy data
      console.warn('No version prefix found, trying legacy decryption');

      // First try current decryption method
      try {
        // Try v2 first
        let plain = tryDecryptV2(encryptedData);
        if (plain) {
          return plain;
        }
        // Then try v1
        plain = tryDecryptV1(encryptedData);

        if (plain) {
          // If successful, this was encrypted data without version prefix
          // Re-encrypt with version prefix for future
          return plain;
        }
      } catch (e) {
        console.debug('Legacy no-prefix decryption attempts failed, trying base64 fallback:', e);
      }

      // Try base64 decoding
      try {
        const decoded = atob(encryptedData);
        // If successful, this was base64-encoded plain text
        return decoded;
      } catch (base64Error) {
        console.debug('Base64 decode failed, returning raw data:', base64Error);
        // Finally, return as-is (plain text)
        return encryptedData;
      }
    }
  } catch (error) {
    console.warn('Decryption failed, returning original data:', error);
    return encryptedData;
  }
}

/**
 * Check if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.length < 16) return false;

  // Check for version prefix
  if (data.includes(':')) {
    const [version] = data.split(':', 1);
    return version !== 'plain';
  }

  // Legacy check for base64-like data
  return /^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 32;
}

/**
 * Migrate existing localStorage data to encrypted format with versioning
 */
export function migrateToEncrypted(key: string): void {
  try {
    if (typeof window === 'undefined') return;

    const existingData = localStorage.getItem(key);
    if (!existingData) return;

    // Check if data is already encrypted with version prefix
    if (
      existingData.includes(':') &&
      (existingData.startsWith('v2:') || existingData.startsWith('v1:') || existingData.startsWith('plain:'))
    ) {
      return;
    }

    // Try to decrypt to see if it's already encrypted without version prefix
    try {
      const decrypted = decryptData(existingData);

      // If decryption worked and we got something different, it was encrypted
      if (decrypted !== existingData) {
        // Re-encrypt with version prefix
        const encrypted = encryptData(decrypted);
        localStorage.setItem(key, encrypted);
        return;
      }
    } catch (e) {
      // Decryption failed, so it's probably plain text
      console.debug("Decryption failed, so it's probably plain text:", e);
    }

    // Validate that existing data is valid JSON before migrating
    try {
      JSON.parse(existingData);

      // Encrypt existing data with version prefix
      const encrypted = encryptData(existingData);
      localStorage.setItem(key, encrypted);
    } catch {
      // Store as plain text with version prefix
      localStorage.setItem(key, `plain:${existingData}`);
    }
  } catch (error) {
    console.warn(`Failed to migrate localStorage key "${key}":`, error);
  }
}

/**
 * Safe data retrieval with automatic migration
 */
export function getEncryptedItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(key);
  if (data === null) return null;

  // If data doesn't have version prefix, migrate it
  if (!data.includes(':')) {
    migrateToEncrypted(key);
    return localStorage.getItem(key);
  }

  return data;
}

/**
 * Safe data storage with encryption
 */
export function setEncryptedItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;

  const encrypted = encryptData(value);
  localStorage.setItem(key, encrypted);
}

/**
 * Simple encryption self-test utility
 */
export function testEncryption(sample: string): {
  success: boolean;
  originalData: string;
  encrypted?: string;
  decrypted?: string;
  error?: string;
} {
  try {
    const encrypted = encryptData(sample);
    const decrypted = decryptData(encrypted);
    const success = decrypted === sample;
    return { success, originalData: sample, encrypted, decrypted };
  } catch (err) {
    return {
      success: false,
      originalData: sample,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
