'use client';

import { usePharmacyData } from '@/contexts/DosingGuideContext';
import Header from '@/components/DosingGuide/header';
import CategoryData from '@/components/DosingGuide/categoryData';
import SideEffects from '@/components/DosingGuide/sideEffects';

interface PharmacyPageProps {
  slug: string;
}

export default function PharmacyPage({ slug }: PharmacyPageProps) {
  const { pharmacyData, error } = usePharmacyData(slug);

  if (error) {
    return (
      <div className='tw-flex tw-flex-col tw-gap-6'>
        <Header />
        <div className='tw-text-center tw-py-12'>
          <p className='tw-text-red-600'>Error loading pharmacy data</p>
        </div>
      </div>
    );
  }

  if (!pharmacyData) {
    return (
      <div className='tw-flex tw-flex-col tw-gap-6'>
        <Header />
        <div className='tw-text-center tw-py-12'>
          <p className='tw-text-gray-600'>Pharmacy not found</p>
        </div>
      </div>
    );
  }

  // Separate Standard and non-Standard groups
  const standardGroups = pharmacyData.categoryGroups.filter((g) => g.group === 'Standard');
  const nonStandardGroups = pharmacyData.categoryGroups.filter((g) => g.group !== 'Standard');

  // For Northwest and 1st Choice, group by category
  const isNorthwestOr1stChoice = slug === 'northwest' || slug === '1st-choice';

  // Transform category groups into table data
  const categoryGroupsArray = isNorthwestOr1stChoice
    ? (() => {
        // Group by category for Northwest and 1st Choice
        const groupedByCategory = nonStandardGroups.reduce((acc, categoryGroup) => {
          const key = categoryGroup.category;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(categoryGroup);
          return acc;
        }, {} as Record<string, typeof nonStandardGroups>);

        return Object.entries(groupedByCategory).map(([category, groups]) => {
          // Handle "Evaluate side effects"
          if (category === 'Evaluate side effects') {
            const categoryGroup = groups[0];
            const sideEffectsNote = categoryGroup.notes.find((note) => note.category === 'Evaluate side effects');
            if (!sideEffectsNote) {
              return {
                name: category,
                subtitle: '',
                data: [],
                isSideEffects: false,
                isCombinedTable: false,
              };
            }

            const introText = sideEffectsNote.notes[0] || '';
            const safetyInfoLink = sideEffectsNote.notes[1] || '';
            const question = sideEffectsNote.notes[2] || '';
            const noneOrManageableText = sideEffectsNote.notes[3] || '';
            const unmanageableText = sideEffectsNote.notes[4] || '';

            const noneOrManageableParts = noneOrManageableText.split(': ')[1]?.split(', ') || [];
            const noneOrManageableDescription = 'None or manageable';
            const noneOrManageableSubDescription = `${noneOrManageableParts[0]}, ${noneOrManageableParts[1]}`;
            const noneOrManageableAction = noneOrManageableParts[2] || '';

            const unmanageableParts = unmanageableText.split(': ')[1]?.split(', ') || [];
            const unmanageableDescription = 'Unmanageable';
            const unmanageableSubDescription = unmanageableParts[0] || '';
            const unmanageableAction = unmanageableParts[1] || '';

            const options = [
              {
                type: 'none-or-manageable',
                title: 'None or manageable',
                description: noneOrManageableDescription,
                subDescription: noneOrManageableSubDescription,
                action: noneOrManageableAction,
                note: introText,
              },
              {
                type: 'unmanageable',
                title: 'Unmanageable',
                description: unmanageableDescription,
                subDescription: unmanageableSubDescription,
                action: unmanageableAction,
              },
            ];

            return {
              name: category,
              subtitle: '',
              data: [],
              isSideEffects: true,
              isCombinedTable: false,
              sideEffectsData: {
                title: category,
                introText: introText || '',
                safetyInfoLink: safetyInfoLink || '',
                question: question || '',
                options,
              },
            };
          }

          // Separate Monthly and 3-month supply groups
          const monthlyGroup = groups.find((g) => g.group === 'Monthly');
          const threeMonthGroup = groups.find((g) => g.group === '3-month supply');

          // Get notes from each group
          const monthlyNotes = monthlyGroup?.notes.filter((note) => note.day_supply === 30) || [];
          const threeMonthNotes = threeMonthGroup?.notes.filter((note) => note.day_supply === 90) || [];

          // Calculate maximum dosage from both groups
          const allDosages = [...monthlyNotes, ...threeMonthNotes]
            .map((note) => note.dosage)
            .filter((dosage): dosage is number => dosage != null && !isNaN(dosage));
          const maxDosage = allDosages.length > 0 ? Math.max(...allDosages) : null;

          const subtitle = maxDosage
            ? `*${maxDosage} mg is the maximum dose/maintenance dose for ${category}\n**Increase dose beyond labeled instructions ONLY AS OR IF DIRECTED by provider.`
            : '**Increase dose beyond labeled instructions ONLY AS OR IF DIRECTED by provider.';

          // Create combined table data with 3 columns: Weekly Dosing, Monthly, 3-month supply
          const maxLength = Math.max(monthlyNotes.length, threeMonthNotes.length);
          const tableData = Array.from({ length: maxLength }, (_, i) => {
            const dosage = monthlyNotes[i]?.dosage || threeMonthNotes[i]?.dosage;
            const displayDosage = dosage !== undefined && dosage !== null ? `${dosage} mg` : '-';
            return {
              weeklyDosing: displayDosage,
              monthlyInstructions: monthlyNotes[i]?.notes.join('\n') || '-',
              threeMonthInstructions: threeMonthNotes[i]?.notes.join('\n') || '-',
            };
          });

          return {
            name: category,
            subtitle,
            data: tableData,
            hasStandard: false,
            isSideEffects: false,
            isCombinedTable: true,
          };
        });
      })()
    : nonStandardGroups.map((categoryGroup) => {
        // Special handling for "Evaluate side effects"
        if (categoryGroup.category === 'Evaluate side effects') {
          const sideEffectsNote = categoryGroup.notes.find((note) => note.category === 'Evaluate side effects');
          if (!sideEffectsNote) {
            return {
              name: categoryGroup.name,
              subtitle: '',
              data: [],
              isSideEffects: false,
              isCombinedTable: false,
            };
          }

          const introText = sideEffectsNote.notes[0] || '';
          const safetyInfoLink = sideEffectsNote.notes[1] || '';
          const question = sideEffectsNote.notes[2] || '';
          const noneOrManageableText = sideEffectsNote.notes[3] || '';
          const unmanageableText = sideEffectsNote.notes[4] || '';

          const noneOrManageableParts = noneOrManageableText.split(': ')[1]?.split(', ') || [];
          const noneOrManageableDescription = 'None or manageable';
          const noneOrManageableSubDescription = `${noneOrManageableParts[0]}, ${noneOrManageableParts[1]}`;
          const noneOrManageableAction = noneOrManageableParts[2] || '';

          const unmanageableParts = unmanageableText.split(': ')[1]?.split(', ') || [];
          const unmanageableDescription = 'Unmanageable';
          const unmanageableSubDescription = unmanageableParts[0] || '';
          const unmanageableAction = unmanageableParts[1] || '';

          const options = [
            {
              type: 'none-or-manageable',
              title: 'None or manageable',
              description: noneOrManageableDescription,
              subDescription: noneOrManageableSubDescription,
              action: noneOrManageableAction,
              note: introText,
            },
            {
              type: 'unmanageable',
              title: 'Unmanageable',
              description: unmanageableDescription,
              subDescription: unmanageableSubDescription,
              action: unmanageableAction,
            },
          ];

          return {
            name: categoryGroup.name,
            subtitle: '',
            data: [],
            isSideEffects: true,
            isCombinedTable: false,
            sideEffectsData: {
              title: categoryGroup.category,
              introText: introText || '',
              safetyInfoLink: safetyInfoLink || '',
              question: question || '',
              options,
            },
          };
        }

        // Filter for 90-day supply
        const filteredNotes = categoryGroup.notes.filter((note) => note.day_supply === 90);

        // Find matching Standard group for the same category
        const matchingStandardGroup = standardGroups.find((g) => g.category === categoryGroup.category);
        const standardNotes = matchingStandardGroup
          ? matchingStandardGroup.notes.filter((note) => note.day_supply === 90)
          : [];

        // Calculate maximum dosage from ALL columns (Custom + Standard)
        const allNotesForDosage = [...filteredNotes, ...standardNotes];
        const dosages = allNotesForDosage
          .map((note) => note.dosage)
          .filter((dosage): dosage is number => dosage != null && !isNaN(dosage));
        const maxDosage = dosages.length > 0 ? Math.max(...dosages) : null;

        // Create subtitle
        let categoryText = categoryGroup.category;

        // For Olympia and MFV, use complete categoryGroup.name and remove "Injections" and brackets around group
        if (slug === 'olympia' || slug === 'mfv') {
          categoryText = categoryGroup.name
            .replace(' (GLP-1) Injections', ' (GLP-1)')
            .replace(' (GLP-1/GIP) Injections', ' (GLP-1/GIP)')
            .replace(/\(([^)]+)\)$/, '$1'); // Remove brackets around group at the end
        }

        const subtitle = maxDosage
          ? `*${maxDosage} mg is the maximum dose/maintenance dose for ${categoryText}\n**Increase dose beyond labeled instructions ONLY AS OR IF DIRECTED by provider.`
          : '**Increase dose beyond labeled instructions ONLY AS OR IF DIRECTED by provider.';

        // Transform notes into table rows
        const tableData = filteredNotes.map((note) => {
          const weeklyDosing = note.dosage !== undefined && note.dosage !== null ? `${note.dosage} mg` : 'N/A';
          return {
            weeklyDosing,
            injectionInstructions: note.notes.join('\n') || 'No instructions available',
          };
        });

        // Transform standard notes into table rows
        const standardTableData =
          standardNotes.length > 0
            ? standardNotes.map((note) => {
                const weeklyDosingStandard =
                  note.dosage !== undefined && note.dosage !== null ? `${note.dosage} mg` : 'N/A';
                return {
                  weeklyDosingStandard,
                  injectionInstructionsStandard: note.notes.join('\n') || 'No instructions available',
                };
              })
            : [];

        // Merge custom and standard data row by row
        const maxLength = Math.max(tableData.length, standardTableData.length);
        const mergedData = Array.from({ length: maxLength }, (_, i) => ({
          weeklyDosing: tableData[i]?.weeklyDosing || '',
          injectionInstructions: tableData[i]?.injectionInstructions || '',
          weeklyDosingStandard: standardTableData[i]?.weeklyDosingStandard || '',
          injectionInstructionsStandard: standardTableData[i]?.injectionInstructionsStandard || '',
        }));

        return {
          name: categoryGroup.name,
          subtitle,
          data: mergedData,
          hasStandard: standardNotes.length > 0,
          isSideEffects: false,
          isCombinedTable: false,
        };
      });

  return (
    <div className='tw-flex tw-flex-col tw-gap-6'>
      <Header />
      {categoryGroupsArray.map((categoryGroup, index) =>
        categoryGroup.isSideEffects && categoryGroup.sideEffectsData ? (
          <div key={index} id='evaluate-side-effects'>
            <SideEffects data={categoryGroup.sideEffectsData} />
          </div>
        ) : (
          <div key={index} id={`category-${index}`}>
            <CategoryData
              title={categoryGroup.name}
              subtitle={categoryGroup.subtitle}
              data={categoryGroup.data}
              standardData={categoryGroup.hasStandard ? categoryGroup.data : undefined}
              isFirst={index === 0}
              isCombinedTable={categoryGroup.isCombinedTable}
              slug={slug}
            />
          </div>
        )
      )}
    </div>
  );
}
