// DEPRECATED: Use useStates() hook and getStateAbbreviationDynamic() instead
import statesAbbreviations from '@/data/statesAbbreviations.json';

/**
 * @deprecated Use getStateAbbreviationDynamic() with useStates() hook instead
 * Get state abbreviation from state name (uses static data)
 */
export const getStateAbbreviation = (stateName: string): string => {
  if (!stateName) return '';

  if (stateName.length === 2) return stateName.toUpperCase();

  const abbreviation = statesAbbreviations[stateName as keyof typeof statesAbbreviations];
  return abbreviation || stateName;
};

/**
 * Get state abbreviation from state name using dynamic API data
 * @param stateName - Full state name
 * @param nameToCode - Mapping from state name to code (from useStates hook)
 * @returns 2-letter state code
 */
export const getStateAbbreviationDynamic = (
  stateName: string,
  nameToCode: Record<string, string>
): string => {
  if (!stateName) return '';

  if (stateName.length === 2) return stateName.toUpperCase();

  return nameToCode[stateName] || stateName;
};

/**
 * @deprecated Use abbreviateLocationStateDynamic() with useStates() hook instead
 */
export const abbreviateLocationState = (location: string): string => {
  if (!location || location === 'N/A') return location || 'N/A';

  if (location.includes(',')) {
    const parts = location.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
      const city = parts[0];
      const state = parts[1];
      const abbreviated = getStateAbbreviation(state);
      return `${city}, ${abbreviated}`;
    }
  }

  return getStateAbbreviation(location);
};

/**
 * Abbreviate location state using dynamic API data
 */
export const abbreviateLocationStateDynamic = (
  location: string,
  nameToCode: Record<string, string>
): string => {
  if (!location || location === 'N/A') return location || 'N/A';

  if (location.includes(',')) {
    const parts = location.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
      const city = parts[0];
      const state = parts[1];
      const abbreviated = getStateAbbreviationDynamic(state, nameToCode);
      return `${city}, ${abbreviated}`;
    }
  }

  return getStateAbbreviationDynamic(location, nameToCode);
};

/**
 * @deprecated Use formatCityStateDynamic() with useStates() hook instead
 */
export const formatCityState = (city: string, state: string): string => {
  if (!state) return 'N/A';

  const abbreviated = getStateAbbreviation(state);

  if (city && city.trim()) {
    return `${city}, ${abbreviated}`;
  }

  return abbreviated;
};

/**
 * Format city and state using dynamic API data
 */
export const formatCityStateDynamic = (
  city: string,
  state: string,
  nameToCode: Record<string, string>
): string => {
  if (!state) return 'N/A';

  const abbreviated = getStateAbbreviationDynamic(state, nameToCode);

  if (city && city.trim()) {
    return `${city}, ${abbreviated}`;
  }

  return abbreviated;
};
