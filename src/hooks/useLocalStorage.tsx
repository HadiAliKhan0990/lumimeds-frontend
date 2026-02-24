'use client';

import { useState, useEffect } from 'react';
import { decryptData } from '@/lib/encryption';
import { saveEncrypted } from '@/lib/encryptedStorage';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToFile(base64: string, filename: string, type: string): File {
  const arr = base64.split(',');
  const mimeMatch = /:(.*?);/.exec(arr[0]);
  const mime = mimeMatch?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime ?? type });
}

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load encrypted data on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }

    try {
      const encryptedItem = localStorage.getItem(key);
      if (!encryptedItem) {
        setIsLoaded(true);
        return;
      }

      const decryptedData = decryptData(encryptedItem);
      const parsed = JSON.parse(decryptedData);

      // Handle reconstructing image answers
      if (Array.isArray(parsed)) {
        const reconstructed = parsed.map((answer) => {
          if (answer.answer && typeof answer.answer === 'object' && answer.answer.__type === 'image') {
            const { dataUrl, name, type } = answer.answer;
            answer.answer = base64ToFile(dataUrl, name, type);
          }
          return answer;
        }) as T;
        setStoredValue(reconstructed);
      } else {
        setStoredValue(parsed);
      }
    } catch (error) {
      console.warn('Failed to load encrypted localStorage item:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = async (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;

      const toStore = Array.isArray(valueToStore)
        ? await Promise.all(
            valueToStore.map(async (answer) => {
              if (answer.answer instanceof File) {
                const dataUrl = await fileToBase64(answer.answer);
                return {
                  ...answer,
                  answer: {
                    __type: 'image',
                    name: answer.answer.name,
                    type: answer.answer.type,
                    dataUrl,
                  },
                };
              }
              return answer;
            })
          )
        : valueToStore;

      setStoredValue(valueToStore);
      saveEncrypted(key, toStore);
    } catch (error) {
      console.warn('Failed to save encrypted localStorage:', error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}
