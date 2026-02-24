// Helper utilities for pharmacy edit modal

/**
 * @deprecated Use useStates() hook from @/hooks/useStates instead
 * Use stateCodes from the hook: const { stateCodes } = useStates();
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

/**
 * @deprecated Use useStates() hook from @/hooks/useStates instead
 */
export const getAllUSStates = (): string[] => {
  return US_STATES;
};

/**
 * Deep compare two objects and return only the changed fields
 */
export const getChangedFields = (original: Record<string, unknown>, updated: Record<string, unknown>): Record<string, unknown> | null => {
  const changes: Record<string, unknown> = {};

  for (const key in updated) {
    if (updated.hasOwnProperty(key)) {
      const originalValue = original?.[key];
      const updatedValue = updated[key];

      // Skip if values are the same
      if (JSON.stringify(originalValue) === JSON.stringify(updatedValue)) {
        continue;
      }

      // Include the changed field
      changes[key] = updatedValue;
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
};

export type NoteFilterOptions = {
  daySupply: number[];
  dosage: string[];
  medication: string[];
  group: string[];
  category: string[];
};

/**
 * Extract unique values from notes array for filter dropdowns
 */
export const extractNotesFilterOptions = (notes: Array<{
  day_supply: number;
  dosage: string;
  medication: string;
  group: string;
  category: string;
  route?: string;
}>): NoteFilterOptions => {
  if (!notes || notes.length === 0) {
    return {
      daySupply: [],
      dosage: [],
      medication: [],
      group: [],
      category: [],
    };
  }

  const daySupplySet = new Set<number>();
  const dosageSet = new Set<string>();
  const medicationSet = new Set<string>();
  const groupSet = new Set<string>();
  const categorySet = new Set<string>();

  notes.forEach((note) => {
    if (note.day_supply !== undefined) daySupplySet.add(note.day_supply);
    if (note.dosage) dosageSet.add(note.dosage);
    if (note.medication) medicationSet.add(note.medication);
    if (note.group) groupSet.add(note.group);
    if (note.category) categorySet.add(note.category);
  });

  return {
    daySupply: Array.from(daySupplySet).sort((a, b) => a - b),
    dosage: Array.from(dosageSet).sort(),
    medication: Array.from(medicationSet).sort(),
    group: Array.from(groupSet).sort(),
    category: Array.from(categorySet).sort(),
  };
};

/**
 * Get dosages filtered by selected medication and optionally route
 */
export const getDosagesByMedication = (
  notes: Array<{
    day_supply: number;
    dosage: string;
    medication: string;
    group: string;
    category: string;
    route?: string;
  }>,
  medication: string,
  route?: 'im' | 'sq'
): string[] => {
  if (!notes || notes.length === 0 || !medication) {
    return [];
  }

  const dosageSet = new Set<string>();
  
  notes.forEach((note) => {
    if (note.medication === medication && note.dosage) {
      // If route is specified, only include notes with matching route (or no route if route is undefined)
      if (route !== undefined) {
        if (note.route === route) {
          dosageSet.add(note.dosage);
        }
      } else {
        // If no route filter, include all dosages (both with and without route)
        dosageSet.add(note.dosage);
      }
    }
  });

  return Array.from(dosageSet).sort();
};

/**
 * Filter notes based on selected criteria
 */
export const filterNotes = (
  notes: Array<{
    day_supply: number;
    dosage: string;
    medication: string;
    group: string;
    category: string;
    notes: string[];
    route?: string;
  }>,
  filters: {
    daySupply?: number;
    dosage?: string;
    medication?: string;
    group?: string;
    category?: string;
    route?: 'im' | 'sq';
  }
): {
  day_supply: number;
  dosage: string;
  medication: string;
  group: string;
  category: string;
  notes: string[];
  route?: string;
} | null => {
  if (!notes || notes.length === 0) return null;

  return notes.find((note) => {
    if (filters.daySupply !== undefined && note.day_supply !== filters.daySupply) return false;
    if (filters.dosage && note.dosage !== filters.dosage) return false;
    if (filters.medication && note.medication !== filters.medication) return false;
    if (filters.group && note.group !== filters.group) return false;
    if (filters.category && note.category !== filters.category) return false;
    // Match route if filter is specified (undefined route in note matches undefined filter)
    if (filters.route !== undefined) {
      if (note.route !== filters.route) return false;
    }
    return true;
  }) || null;
};

