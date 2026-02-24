'use client';

import { loadSync, queueEncryptedSave, saveEncrypted } from '@/lib/encryptedStorage';
import { PatientSurveyAnswerType } from '@/lib/types';
import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_STEP_KEY, FORM_STEP, SURVEY_ANSWERS, SURVEY_ANSWERS_META } from '@/constants/intakeSurvey';

const DEFAULT_EXPIRY_DAYS = 7;

const defaultState: PatientSurveyAnswerType[] = [];

// Inline utility functions to avoid circular dependency with helper.ts (which imports store)
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
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime ?? type });
}

function loadAnswers(): PatientSurveyAnswerType[] {
  // Check expiry metadata first
  const meta = loadSync<{ savedAt: number; expiryDays?: number }>(SURVEY_ANSWERS_META);
  const now = Date.now();
  if (meta && typeof meta.savedAt === 'number') {
    const days = typeof meta.expiryDays === 'number' && meta.expiryDays > 0 ? meta.expiryDays : DEFAULT_EXPIRY_DAYS;
    const maxAgeMs = days * 24 * 60 * 60 * 1000;
    const age = now - meta.savedAt;
    if (age >= maxAgeMs) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SURVEY_ANSWERS);
          localStorage.removeItem(SURVEY_ANSWERS_META);
          // Reset progress keys so user re-enters details
          localStorage.removeItem(STORAGE_STEP_KEY);
          localStorage.removeItem(FORM_STEP);
        }
      } catch {}
      return defaultState;
    }
  }

  const data = loadSync<PatientSurveyAnswerType[]>(SURVEY_ANSWERS) || defaultState;
  if (data.length > 0) {
    const answers = data.map((item) => {
      if (
        item?.answer &&
        typeof item.answer === 'object' &&
        'dataUrl' in item.answer &&
        'name' in item.answer &&
        'type' in item.answer
      ) {
        const { dataUrl, name, type } = item.answer;
        const restoredAnswer = base64ToFile(dataUrl as string, name, type);
        return { ...item, answer: restoredAnswer };
      }
      return item;
    });
    return answers;
  }
  return data;
}

// Use a lazy initializer function to avoid circular dependency issues
// This prevents loadAnswers() from being called during module initialization
const initialState = (): PatientSurveyAnswerType[] => {
  try {
    return loadAnswers();
  } catch (error) {
    console.warn('Failed to load answers during initialization:', error);
    return defaultState;
  }
};

const answersSlice = createSlice({
  name: 'answers',
  initialState,
  reducers: {
    setAnswers(state, action) {
      const data: PatientSurveyAnswerType[] = [...action.payload];

      // Async processing for localStorage
      (async () => {
        const dataToSave = await Promise.all(
          data.map(async (item) => {
            if (item.answer instanceof File) {
              const dataUrl = await fileToBase64(item.answer);
              return {
                ...item,
                answer: {
                  __type: 'file',
                  name: item.answer.name,
                  type: item.answer.type,
                  dataUrl,
                },
              };
            }
            return item;
          })
        );

        queueEncryptedSave(SURVEY_ANSWERS, dataToSave);
        // Update expiry metadata alongside answers
        // Preserve configured expiryDays if present, update savedAt
        const existingMeta = loadSync<{ savedAt?: number; expiryDays?: number }>(SURVEY_ANSWERS_META) || {};
        saveEncrypted(SURVEY_ANSWERS_META, { ...existingMeta, savedAt: Date.now() });
      })();

      return action.payload;
    },
  },
});

export const { setAnswers } = answersSlice.actions;
export default answersSlice.reducer;
