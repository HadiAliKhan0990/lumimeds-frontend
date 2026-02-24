'use client';

import { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { PharmaciesInstructionsResponse } from '@/services/pharmacies';

// ===== TYPES =====
export interface PharmacyNote {
  category: string;
  group: string;
  dosage: number | null;
  day_supply: number;
  notes: string[];
}

export interface CategoryGroup {
  name: string;
  category: string;
  group: string;
  notes: PharmacyNote[];
}

export interface PharmacyData {
  name: string;
  slug: string;
  categoryGroups: CategoryGroup[];
}

interface DosingGuideContextType {
  rawData: PharmaciesInstructionsResponse | null;
  error: Error | null;
  // Computed data
  pharmaciesBySlug: Map<string, PharmacyData>;
  allPharmacies: PharmacyData[];
  getPharmacyBySlug: (slug: string) => PharmacyData | undefined;
}

// ===== UTILITIES =====
const SLUG_MAP: Record<string, string> = {
  'premier rx': 'premierRX',
  premierrx: 'premierRX',
  'olympia/wells': 'olympia',
  'olympia wells': 'olympia',
  olympia: 'olympia',
  'drug crafters': 'drug-crafters',
  drugcrafters: 'drug-crafters',
  mfv: 'mfv',
  northwest: 'northwest',
  '1st choice': '1st-choice',
  '1stchoice': '1st-choice',
  'first choice': '1st-choice',
};

function getPharmacySlug(pharmacyName: string): string {
  const name = pharmacyName.toLowerCase().trim();
  return SLUG_MAP[name] || name.replace(/\s+/g, '-');
}

// ===== CONTEXT =====
const DosingGuideContext = createContext<DosingGuideContextType | undefined>(undefined);

export function DosingGuideProvider({
  children,
  data,
  error,
}: PropsWithChildren<{ data: PharmaciesInstructionsResponse | null; error: Error | null }>) {
  // Process data ONCE using useMemo
  const processedData = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return {
        pharmaciesBySlug: new Map<string, PharmacyData>(),
        allPharmacies: [],
      };
    }

    const pharmaciesMap = new Map<string, PharmacyData>();
    const pharmaciesList: PharmacyData[] = [];

    data.data.forEach((item: { name?: string; notes?: PharmacyNote[] }) => {
      if (!item?.name) return;

      const slug = getPharmacySlug(item.name);

      // Skip if already processed (handles duplicates)
      if (pharmaciesMap.has(slug)) {
        const existing = pharmaciesMap.get(slug)!;
        // Merge notes if needed
        if (item.notes && Array.isArray(item.notes)) {
          item.notes.forEach((note: PharmacyNote) => {
            if (note?.category && note?.group) {
              const categoryGroupKey = `${note.category} (${note.group})`;
              const existingGroup = existing.categoryGroups.find((g) => g.name === categoryGroupKey);

              if (existingGroup) {
                existingGroup.notes.push(note);
              } else {
                existing.categoryGroups.push({
                  name: categoryGroupKey,
                  category: note.category,
                  group: note.group,
                  notes: [note],
                });
              }
            }
          });
        }
        return;
      }

      // Process category groups
      const categoryGroupsMap = new Map<string, CategoryGroup>();

      if (item.notes && Array.isArray(item.notes)) {
        item.notes.forEach((note: PharmacyNote) => {
          if (note?.category && note?.group) {
            const categoryGroupKey = `${note.category} (${note.group})`;

            if (!categoryGroupsMap.has(categoryGroupKey)) {
              categoryGroupsMap.set(categoryGroupKey, {
                name: categoryGroupKey,
                category: note.category,
                group: note.group,
                notes: [],
              });
            }

            categoryGroupsMap.get(categoryGroupKey)!.notes.push({
              category: note.category,
              group: note.group,
              dosage: note.dosage,
              day_supply: note.day_supply,
              notes: note.notes || [],
            });
          }
        });
      }

      const pharmacyData: PharmacyData = {
        name: item.name,
        slug,
        categoryGroups: Array.from(categoryGroupsMap.values()),
      };

      pharmaciesMap.set(slug, pharmacyData);
      pharmaciesList.push(pharmacyData);
    });

    return {
      pharmaciesBySlug: pharmaciesMap,
      allPharmacies: pharmaciesList,
    };
  }, [data]);

  const contextValue: DosingGuideContextType = {
    rawData: data,
    error,
    pharmaciesBySlug: processedData.pharmaciesBySlug,
    allPharmacies: processedData.allPharmacies,
    getPharmacyBySlug: (slug: string) => processedData.pharmaciesBySlug.get(slug),
  };

  return <DosingGuideContext.Provider value={contextValue}>{children}</DosingGuideContext.Provider>;
}

// ===== HOOKS =====
export function useDosingGuide() {
  const context = useContext(DosingGuideContext);
  if (context === undefined) {
    throw new Error('useDosingGuide must be used within a DosingGuideProvider');
  }
  return context;
}

// Custom hook for individual pharmacy pages
export function usePharmacyData(slug: string) {
  const { getPharmacyBySlug, error } = useDosingGuide();
  const pharmacyData = useMemo(() => getPharmacyBySlug(slug), [slug, getPharmacyBySlug]);

  return { pharmacyData, error };
}
