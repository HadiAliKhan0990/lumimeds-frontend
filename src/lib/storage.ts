'use client';

import { encryptData, decryptData, migrateToEncrypted } from './encryption';

export function loadFromLocalStorage<T>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return undefined;

    // Migrate existing unencrypted data
    migrateToEncrypted(key);
    const updatedData = localStorage.getItem(key);
    if (!updatedData) return undefined;

    const decryptedData = decryptData(updatedData);
    return JSON.parse(decryptedData);
  } catch (err) {
    console.warn(`Error loading from localStorage for key "${key}":`, err);
    return undefined;
  }
}

export function saveToLocalStorage<T>(key: string, state: T): void {
  try {
    if (typeof window === 'undefined') return;
    const serialized = JSON.stringify(state);
    const encrypted = encryptData(serialized);
    localStorage.setItem(key, encrypted);
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

// Synchronous versions for backward compatibility (with reduced security)
export function loadFromLocalStorageSync<T>(key: string): T | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const serialized = localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : undefined;
  } catch (err) {
    console.warn(`Error loading from localStorage sync for key "${key}":`, err);
    return undefined;
  }
}

export function saveToLocalStorageSync<T>(key: string, state: T): void {
  try {
    if (typeof window === 'undefined') return;
    const serialized = JSON.stringify(state);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error('Error saving to localStorage sync', err);
  }
}
