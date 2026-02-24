import { useMemo } from 'react';
import { useGetStatesQuery } from '@/store/slices/pharmaciesApiSlice';
import type { State } from '@/store/slices/pharmaciesApiSlice';

export interface UseStatesReturn {
  states: State[];
  stateNames: string[];
  stateCodes: string[];
  nameToCode: Record<string, string>;
  codeToName: Record<string, string>;
  stateOptions: Array<{ label: string; value: string }>;
  isLoading: boolean;
  error: unknown;
}

/**
 * Custom hook to get US states data from API with various transformed formats
 * @returns Object containing states data in different formats and loading/error states
 */
export const useStates = (): UseStatesReturn => {
  const { data: states = [], isLoading, error } = useGetStatesQuery();

  // Transform states to different formats
  const stateNames = useMemo(() => states.map((s) => s.name), [states]);
  const stateCodes = useMemo(() => states.map((s) => s.code), [states]);

  // Create name -> code mapping
  const nameToCode = useMemo(() => {
    const map: Record<string, string> = {};
    states.forEach((s) => {
      map[s.name] = s.code;
    });
    return map;
  }, [states]);

  // Create code -> name mapping
  const codeToName = useMemo(() => {
    const map: Record<string, string> = {};
    states.forEach((s) => {
      map[s.code] = s.name;
    });
    return map;
  }, [states]);

  // Create React Select options format
  const stateOptions = useMemo(
    () => states.map((s) => ({ label: s.name, value: s.name })),
    [states]
  );

  return {
    states,
    stateNames,
    stateCodes,
    nameToCode,
    codeToName,
    stateOptions,
    isLoading,
    error,
  };
};



