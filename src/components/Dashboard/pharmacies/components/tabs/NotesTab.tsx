import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa6';
import { extractNotesFilterOptions, filterNotes, getDosagesByMedication } from '@/helpers/pharmacy-edit-utils';

type DosageStructure = {
  semaglutide?: number[];
  tirzepatide?: number[];
  nad?: {
    im?: number[];
    sq?: number[];
  };
  [key: string]: number[] | { im?: number[]; sq?: number[] } | undefined;
};

type Note = {
  day_supply: number;
  dosage: string;
  group: string;
  category: string;
  medication: string;
  notes: string[];
  route?: string; // Route for NAD products: 'im' or 'sq'
};

type NotesTabProps = {
  notes: Note[];
  supplyDays?: number[];
  medicineCategories?: string[];
  dosage?: DosageStructure;
  onChange: (field: string, value: Note[]) => void;
};

export const NotesTab = React.forwardRef<{ validate: () => boolean }, NotesTabProps>(function NotesTab(
  { notes, supplyDays, medicineCategories, dosage, onChange },
  ref
) {
  const [filters, setFilters] = useState({
    daySupply: undefined as number | undefined,
    dosage: undefined as string | undefined,
    medication: undefined as string | undefined,
    group: undefined as string | undefined,
    category: undefined as string | undefined,
    route: undefined as 'im' | 'sq' | undefined,
  });

  // Helper function to check if a medicine has routes
  const hasRoutes = (medicine: string): boolean => {
    if (!dosage || !dosage[medicine]) return false;
    const medicineDosage = dosage[medicine];
    return typeof medicineDosage === 'object' && !Array.isArray(medicineDosage);
  };

  // Helper function to get dosages for a medicine (handles both simple arrays and route-based)
  const getDosagesForMedicine = (medicine: string, route?: 'im' | 'sq'): number[] => {
    if (!dosage || !dosage[medicine]) return [];
    
    const medicineDosage = dosage[medicine];
    if (Array.isArray(medicineDosage)) {
      return medicineDosage;
    }
    
    if (typeof medicineDosage === 'object' && route) {
      return medicineDosage[route] || [];
    }
    
    return [];
  };

  const [filteredNote, setFilteredNote] = useState<Note | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filterOptions = extractNotesFilterOptions(notes);

  // Merge backend supply days with user-added supply days
  const allSupplyDays = React.useMemo(() => {
    const backendSupplyDays = filterOptions.daySupply || [];
    const userSupplyDays = supplyDays || [];
    const merged = [...new Set([...backendSupplyDays, ...userSupplyDays])];
    return merged.sort((a, b) => a - b);
  }, [filterOptions.daySupply, supplyDays]);

  // Merge backend categories with user-added medicine categories
  const allCategories = React.useMemo(() => {
    const backendCategories = filterOptions.category || [];
    const userCategories = medicineCategories || [];
    const merged = [...new Set([...backendCategories, ...userCategories])];
    return merged.sort();
  }, [filterOptions.category, medicineCategories]);

  // Get dosages filtered by selected medication - merge from notes and Products tab
  const filteredDosages = React.useMemo(() => {
    if (!filters.medication) return [];

    // Get dosages from notes (filtered by route if medication has routes)
    const noteDosages = getDosagesByMedication(notes, filters.medication, filters.route);

    // Get dosages from Products tab for the selected medication
    let productDosages: string[] = [];
    if (dosage && dosage[filters.medication]) {
      if (hasRoutes(filters.medication) && filters.route) {
        // For route-based medicines, get dosages for the selected route
        const routeDosages = getDosagesForMedicine(filters.medication, filters.route);
        productDosages = routeDosages.map((d) => d.toString());
      } else if (!hasRoutes(filters.medication)) {
        // For simple array-based medicines
        const medicineDosage = dosage[filters.medication];
        if (Array.isArray(medicineDosage)) {
          productDosages = medicineDosage.map((d) => d.toString());
        }
      }
    }

    // Merge and deduplicate
    const merged = [...new Set([...noteDosages, ...productDosages])];

    // Sort numerically if all values are numbers, otherwise sort as strings
    return merged.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  }, [filters.medication, filters.route, notes, dosage]);

  useEffect(() => {
    // Only filter if both medication and dosage are selected
    // For medicines with routes (like nad), route must also be selected
    if (filters.medication && filters.dosage) {
      if (hasRoutes(filters.medication) && !filters.route) {
        setFilteredNote(null);
        return;
      }
      const result = filterNotes(notes, filters);
      setFilteredNote(result);
    } else {
      setFilteredNote(null);
    }
  }, [filters, notes, dosage]);

  const handleFilterChange = (field: string, value: string | number | undefined) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [field]: value === '' ? undefined : value,
      };

      // Clear dosage and route when medication changes
      if (field === 'medication') {
        newFilters.dosage = undefined;
        newFilters.route = undefined;
      }

      // Clear dosage when route changes (for route-based medicines)
      if (field === 'route') {
        newFilters.dosage = undefined;
      }

      return newFilters;
    });
  };

  const handleAddNoteLine = () => {
    if (!filteredNote) return;

    const updatedNote = {
      ...filteredNote,
      notes: [...filteredNote.notes, ''],
    };

    // Update the notes array - include route in matching
    const updatedNotes = notes.map((n) =>
      n.day_supply === filteredNote.day_supply &&
      n.dosage === filteredNote.dosage &&
      n.medication === filteredNote.medication &&
      n.group === filteredNote.group &&
      n.category === filteredNote.category &&
      n.route === filteredNote.route
        ? updatedNote
        : n
    );

    onChange('notes', updatedNotes);
  };

  const handleCreateNewNote = () => {
    // Medication and dosage are required
    if (!filters.medication || !filters.dosage) return;

    // For medicines with routes (like nad), route is required
    if (hasRoutes(filters.medication) && !filters.route) return;

    // Create a new note object with the selected filters
    const newNote: Note = {
      day_supply: filters.daySupply || 0,
      dosage: filters.dosage,
      medication: filters.medication,
      group: filters.group || '',
      category: filters.category || '',
      notes: [''], // Start with one empty note line
      route: filters.route, // Include route if set
    };

    // Add the new note to the notes array
    const updatedNotes = [...notes, newNote];
    onChange('notes', updatedNotes);
  };

  const handleRemoveNoteLine = (index: number) => {
    if (!filteredNote) return;

    const updatedNote = {
      ...filteredNote,
      notes: filteredNote.notes.filter((_, i) => i !== index),
    };

    const updatedNotes = notes.map((n) =>
      n.day_supply === filteredNote.day_supply &&
      n.dosage === filteredNote.dosage &&
      n.medication === filteredNote.medication &&
      n.group === filteredNote.group &&
      n.category === filteredNote.category &&
      n.route === filteredNote.route
        ? updatedNote
        : n
    );

    onChange('notes', updatedNotes);
  };

  const handleEditNoteLine = (index: number, value: string) => {
    if (!filteredNote) return;

    const updatedNote = {
      ...filteredNote,
      notes: filteredNote.notes.map((note, i) => (i === index ? value : note)),
    };

    const updatedNotes = notes.map((n) =>
      n.day_supply === filteredNote.day_supply &&
      n.dosage === filteredNote.dosage &&
      n.medication === filteredNote.medication &&
      n.group === filteredNote.group &&
      n.category === filteredNote.category &&
      n.route === filteredNote.route
        ? updatedNote
        : n
    );

    onChange('notes', updatedNotes);

    // Clear error when user types
    const errorKey = `note-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Simple validation function - call this before API
  const validateNotes = () => {
    const newErrors: Record<string, string> = {};

    // Check if there are any notes at all
    if (!notes || notes.length === 0) {
      return true; // No notes to validate
    }

    // Check each note's individual note lines
    notes.forEach((note) => {
      note.notes.forEach((noteLine, lineIndex) => {
        if (!noteLine || !noteLine.trim()) {
          newErrors[`note-${lineIndex}`] = 'Note cannot be empty';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation to parent
  React.useImperativeHandle(ref, () => ({
    validate: validateNotes,
  }));

  return (
    <div className='space-y-4'>
      {/* Filters Section */}
      <div>
        <h5 className='fw-semibold mb-3'>Filter Notes</h5>
        <p className='text-sm mb-4'>
          Select filters to view and edit notes for a specific configuration. All filters must match to display the
          corresponding notes.
        </p>

        <div className='row g-3'>
          <div className='col-md-6 col-lg-4'>
            <label className='form-label fw-semibold' htmlFor='medication'>
              Medication
            </label>
            <select
              id='medication'
              value={filters.medication || ''}
              onChange={(e) => handleFilterChange('medication', e.target.value)}
              className='form-select'
            >
              <option value=''>Select Medication</option>
              {filterOptions.medication.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          {/* Route selector - only show for medicines with routes (like nad) */}
          {filters.medication && hasRoutes(filters.medication) && (
            <div className='col-md-6 col-lg-4'>
              <label className='form-label fw-semibold' htmlFor='route'>
                Route
              </label>
              <select
                id='route'
                value={filters.route || ''}
                onChange={(e) => handleFilterChange('route', e.target.value as 'im' | 'sq' | undefined)}
                className='form-select'
              >
                <option value=''>Select Route</option>
                <option value='im'>IM</option>
                <option value='sq'>SQ</option>
              </select>
            </div>
          )}
          
          <div className='col-md-6 col-lg-4'>
            <label className='form-label fw-semibold' htmlFor='dosage'>
              Dosage
            </label>
            <select
              id='dosage'
              value={filters.dosage || ''}
              onChange={(e) => handleFilterChange('dosage', e.target.value)}
              className='form-select'
              disabled={!filters.medication || (hasRoutes(filters.medication) && !filters.route)}
            >
              <option value=''>Select Dosage</option>
              {filteredDosages.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='col-md-6 col-lg-4'>
            <label className='form-label fw-semibold' htmlFor='daySupply'>
              Days Supply
            </label>
            <select
              id='daySupply'
              value={filters.daySupply || ''}
              onChange={(e) => handleFilterChange('daySupply', e.target.value ? Number(e.target.value) : '')}
              className='form-select'
            >
              <option value=''>Select Days Supply</option>
              {allSupplyDays.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='col-md-6 col-lg-4'>
            <label className='form-label fw-semibold' htmlFor='group'>
              Doctor Group
            </label>
            <select
              id='group'
              value={filters.group || ''}
              onChange={(e) => handleFilterChange('group', e.target.value)}
              className='form-select'
            >
              <option value=''>Select Group</option>
              {filterOptions.group.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className='col-md-6 col-lg-4'>
            <label className='form-label fw-semibold' htmlFor='category'>
              Category
            </label>
            <select
              id='category'
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className='form-select'
            >
              <option value=''>Select Category</option>
              {allCategories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Note Display */}
      {filteredNote ? (
        <div className='mt-4'>
          <div className='bg-light rounded p-3 mb-4'>
            <h6 className='fw-semibold mb-3'>Note Configuration</h6>
            <div className='row g-2'>
              <div className='col-md-6 col-lg-2'>
                <div className='text-sm'>
                  <span className='text-muted'>Days Supply:</span>
                  <span className='ms-1 fw-medium'>{filteredNote.day_supply}</span>
                </div>
              </div>
              <div className='col-md-6 col-lg-2'>
                <div className='text-sm'>
                  <span className='text-muted'>Dosage:</span>
                  <span className='ms-1 fw-medium'>{filteredNote.dosage}</span>
                </div>
              </div>
              <div className='col-md-6 col-lg-2'>
                <div className='text-sm'>
                  <span className='text-muted'>Medication:</span>
                  <span className='ms-1 fw-medium'>{filteredNote.medication}</span>
                </div>
              </div>
              {filteredNote.route && (
                <div className='col-md-6 col-lg-2'>
                  <div className='text-sm'>
                    <span className='text-muted'>Route:</span>
                    <span className='ms-1 fw-medium'>{filteredNote.route.toUpperCase()}</span>
                  </div>
                </div>
              )}
              <div className='col-md-6 col-lg-2'>
                <div className='text-sm'>
                  <span className='text-muted'>Group:</span>
                  <span className='ms-1 fw-medium'>{filteredNote.group}</span>
                </div>
              </div>
              <div className='col-md-6 col-lg-2'>
                <div className='text-sm'>
                  <span className='text-muted'>Category:</span>
                  <span className='ms-1 fw-medium'>{filteredNote.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className=''>
            <label className='form-label fw-semibold mb-3'>Notes</label>

            <div className='tw-space-y-3 tw-mb-3'>
              {filteredNote.notes.map((note, index) => (
                <div key={index} className='d-flex gap-2 align-items-start'>
                  <div className='flex-grow-1'>
                    <textarea
                      value={note}
                      onChange={(e) => handleEditNoteLine(index, e.target.value)}
                      className='form-control'
                      rows={2}
                    />
                    {errors[`note-${index}`] && <div className='text-danger small mt-1'>{errors[`note-${index}`]}</div>}
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveNoteLine(index)}
                    className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center'
                    style={{ minWidth: '40px', height: '40px' }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Note Button at Bottom */}
            <div className='text-center'>
              <button
                type='button'
                onClick={handleAddNoteLine}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
              >
                <FiPlus /> Add Note
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='card mt-4'>
            <div className='card-body text-center py-5'>
              {!filters.medication || !filters.dosage || (filters.medication && hasRoutes(filters.medication) && !filters.route) ? (
                <p className='text-muted mb-0'>
                  Please select Medication{filters.medication && hasRoutes(filters.medication) ? ', Route' : ''} and Dosage to view and edit notes.
                </p>
              ) : (
                <>
                  <p className='text-muted mb-3'>No note found matching the selected filters.</p>
                </>
              )}
            </div>
          </div>
          {filters.medication && filters.dosage && (!hasRoutes(filters.medication) || filters.route) && (
            <div className='mt-3'>
              <button
                type='button'
                onClick={handleCreateNewNote}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
              >
                <FiPlus /> Add Note for Selected Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});
