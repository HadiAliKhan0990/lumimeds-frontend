import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { TabPanel } from '@/components/elements';

type ClinicalNote = {
  is_default?: boolean;
  id: number;
  note: string;
  drug: string;
};

type ClinicalNotesTabProps = {
  clinicalNotes: Record<string, ClinicalNote[]>;
  onChange: (field: string, value: Record<string, ClinicalNote[]>) => void;
  medicineCategories?: string[];
};

export const ClinicalNotesTab = React.forwardRef<{ validate: () => boolean }, ClinicalNotesTabProps>(
  function ClinicalNotesTab({ clinicalNotes, onChange, medicineCategories = [] }, ref) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [activeDrugTabs, setActiveDrugTabs] = useState<Record<string, number>>({});
    const [showNewDrugInput, setShowNewDrugInput] = useState<Record<string, boolean>>({});
    const [tempNewDrugName, setTempNewDrugName] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Merge categories from clinicalNotes and medicineCategories from Products tab
    const clinicalNotesCategories = Object.keys(clinicalNotes || {});
    const allCategories = [...new Set([...clinicalNotesCategories, ...medicineCategories])];
    const categories = allCategories.sort();

    // Set initial selected category when categories change
    React.useEffect(() => {
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
      // If selected category was deleted, select first available
      if (selectedCategory && !categories.includes(selectedCategory) && categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
      // If no categories left, clear selection
      if (categories.length === 0) {
        setSelectedCategory('');
      }
    }, [categories, selectedCategory]);

    // Get unique drugs for each category
    const getDrugsForCategory = (category: string) => {
      const notes = clinicalNotes[category] || [];
      const uniqueDrugs = [...new Set(notes.map((note) => note.drug).filter((drug) => drug.trim() !== ''))];
      return uniqueDrugs; // Return empty array instead of ['All']
    };

    // Get notes for a specific drug in a category
    const getNotesForDrug = (category: string, drug: string) => {
      const notes = clinicalNotes[category] || [];
      return notes.filter((note) => note.drug === drug);
    };

    const handleAddNote = (category: string, drug: string = '') => {
      const existingNotes = clinicalNotes[category] || [];
      const newId = Math.max(0, ...existingNotes.map((n) => n.id)) + 1;

      const newNote: ClinicalNote = {
        id: newId,
        drug: drug,
        note: '',
        is_default: false,
      };

      onChange('clinicalNotes', {
        ...clinicalNotes,
        [category]: [...existingNotes, newNote],
      });
    };

    const handleRemoveNote = (category: string, noteId: number) => {
      const updatedNotes = clinicalNotes[category].filter((n) => n.id !== noteId);

      if (updatedNotes.length === 0) {
        // Remove the category if no notes left
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [category]: _, ...rest } = clinicalNotes;
        onChange('clinicalNotes', rest);
      } else {
        onChange('clinicalNotes', {
          ...clinicalNotes,
          [category]: updatedNotes,
        });
      }
    };

    const handleUpdateNote = (category: string, noteId: number, field: keyof ClinicalNote, value: string | boolean) => {
      const categoryNotes = clinicalNotes[category] || [];

      let updatedNotes: ClinicalNote[] = categoryNotes;

      if (field === 'is_default' && value === true) {
        // Enforce only one default per drug within a category
        const targetNote = categoryNotes.find((n) => n.id === noteId);
        const targetDrug = targetNote?.drug ?? '';

        updatedNotes = categoryNotes.map((n) => {
          if (n.drug === targetDrug) {
            return { ...n, is_default: n.id === noteId };
          }
          return n;
        });
      } else {
        // Regular field update (including turning off default)
        updatedNotes = categoryNotes.map((n) => (n.id === noteId ? { ...n, [field]: value } : n));
      }

      onChange('clinicalNotes', {
        ...clinicalNotes,
        [category]: updatedNotes,
      });

      // Clear error when user types
      if (field === 'note') {
        const errorKey = `clinical-note-${category}-${noteId}`;
        if (errors[errorKey]) {
          setErrors((prev) => ({ ...prev, [errorKey]: '' }));
        }
      }
    };

    // Simple validation function - call this before API
    const validateClinicalNotes = () => {
      const newErrors: Record<string, string> = {};

      // Check if there are any clinical notes at all
      if (!clinicalNotes || Object.keys(clinicalNotes).length === 0) {
        return true; // No clinical notes to validate
      }

      // Check each clinical note - only validate notes that have meaningful content
      Object.entries(clinicalNotes).forEach(([category, notes]) => {
        notes.forEach((note) => {
          // Only validate notes that have a drug name assigned (meaning they're not just placeholders)
          // If a note has a drug name, then the note content should be required
          if (note.drug.trim() !== '' && (!note.note || !note.note.trim())) {
            newErrors[`clinical-note-${category}-${note.id}`] = 'Clinical note cannot be empty';
          }
        });
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Expose validation to parent
    React.useImperativeHandle(ref, () => ({
      validate: validateClinicalNotes,
    }));

    const handleAddCategory = () => {
      if (!newCategoryName.trim()) return;

      const trimmedName = newCategoryName.trim();

      // Check if category already exists in either clinicalNotes or medicineCategories
      if (categories.includes(trimmedName)) {
        toast.error(`Category "${trimmedName}" already exists.`, {
          duration: 3000,
        });
        return;
      }

      onChange('clinicalNotes', {
        ...clinicalNotes,
        [trimmedName]: [],
      });

      // Auto-select the newly created category
      setSelectedCategory(trimmedName);
      setNewCategoryName('');
      setShowNewCategory(false);
    };

    const handleRemoveCategory = (category: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [category]: _, ...rest } = clinicalNotes;
      onChange('clinicalNotes', rest);
    };

    const handleAddDrugTab = (category: string) => {
      const drugName = tempNewDrugName[category]?.trim();
      if (!drugName) return;

      // Check if drug already exists in this category
      const existingDrugs = getDrugsForCategory(category);
      const drugExists = existingDrugs.some((drug) => drug.toLowerCase() === drugName.toLowerCase());

      if (drugExists) {
        toast.error(`Drug "${drugName}" already exists in this category.`, {
          duration: 3000,
        });
        return;
      }

      // Create a new note with the drug name
      const existingNotes = clinicalNotes[category] || [];
      const newId = Math.max(0, ...existingNotes.map((n) => n.id)) + 1;

      const newNote: ClinicalNote = {
        id: newId,
        drug: drugName,
        note: '',
        is_default: false,
      };

      onChange('clinicalNotes', {
        ...clinicalNotes,
        [category]: [...existingNotes, newNote],
      });

      // Switch to the new tab (it will be the last one)
      const updatedDrugs = [...existingDrugs, drugName];
      setActiveDrugTabs((prev) => ({
        ...prev,
        [category]: updatedDrugs.length - 1,
      }));

      // Clear the input and hide it
      setTempNewDrugName((prev) => ({ ...prev, [category]: '' }));
      setShowNewDrugInput((prev) => ({ ...prev, [category]: false }));
    };

    return (
      <div className='space-y-4'>
        {/* Info Section */}
        <div>
          <p className='text-sm'>
            Clinical notes are organized by drug categories. Each category can have multiple notes with associated drug
            names and default flags.
          </p>
        </div>

        {/* Category Selector and Add New Category Button */}
        <div className='d-flex gap-2 align-items-center mb-4'>
          {categories.length > 0 && (
            <div className='flex-grow-1'>
              <label className='form-label fw-semibold mb-2'>Select Category</label>
              <select
                className='form-select'
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // Close the add new category form if it's open
                  if (showNewCategory) {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={categories.length > 0 ? 'align-self-end' : ''}>
            <button
              type='button'
              onClick={() => setShowNewCategory(true)}
              className='btn btn-outline-secondary d-flex align-items-center gap-2'
            >
              <FiPlus /> Add New Category
            </button>
          </div>
        </div>

        {/* Categories */}
        {showNewCategory ? (
          // Show only the Add New Category form when adding
          <div className='mt-4'>
            <h5 className='mb-3 fw-semibold'>Add New Category</h5>
            <div className='d-flex gap-2 mb-3'>
              <input
                type='text'
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className='form-control flex-grow-1'
                placeholder='Enter category name (e.g., GLP-1, SGLT-2)'
                autoFocus
              />
              <button
                type='button'
                onClick={handleAddCategory}
                className='btn btn-secondary'
                style={{ minWidth: '80px', whiteSpace: 'nowrap' }}
                disabled={!newCategoryName.trim()}
              >
                Add
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                }}
                className='btn btn-outline-secondary'
                style={{ minWidth: '80px', whiteSpace: 'nowrap' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div>
            <div className='card'>
              <div className='card-body text-center py-5'>
                <p className='text-muted mb-3'>
                  No clinical note categories yet. Click &quot;Add New Category&quot; to create one.
                </p>
              </div>
            </div>
          </div>
        ) : !selectedCategory ? (
          <div className='card'>
            <div className='card-body text-center py-5'>
              <p className='text-muted mb-3'>
                Please select a category from the dropdown above to view and manage its notes.
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Render only the selected category */}
            {(() => {
              const category = selectedCategory;
              const drugs = getDrugsForCategory(category);
              const activeDrugTab = activeDrugTabs[category] || 0;

              // Check if category has notes in clinicalNotes
              const hasNotesInClinicalNotes = clinicalNotes[category] && clinicalNotes[category].length > 0;

              return (
                <div key={category} className=''>
                  <div className=''>
                    <div className='d-flex justify-content-between mb-4 mt-4'>
                      <h5 className='mb-0 fw-semibold'>{category}</h5>
                      <div className='d-flex gap-2'>
                        {hasNotesInClinicalNotes && (
                          <button
                            type='button'
                            onClick={() => handleRemoveCategory(category)}
                            className='btn btn-outline-danger btn-sm d-flex align-items-center gap-2'
                          >
                            <FaTrash size={12} /> Remove Category
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Drug Tabs */}
                    <div className='tw-mb-4'>
                      <div className='tab-group tw-whitespace-nowrap tw-overflow-x-auto d-flex align-items-center'>
                        {/* Show Add Drug button when no drugs exist */}
                        {drugs.length === 0 && !showNewDrugInput[category] ? (
                          <button
                            type='button'
                            onClick={() => setShowNewDrugInput((prev) => ({ ...prev, [category]: true }))}
                            className='btn btn-outline-secondary d-flex align-items-center gap-2'
                          >
                            <FiPlus /> Add Drug
                          </button>
                        ) : (
                          <>
                            {/* Existing Drug Tabs */}
                            {drugs.map((drug, index) => (
                              <button
                                key={drug}
                                onClick={() =>
                                  setActiveDrugTabs((prev) => ({
                                    ...prev,
                                    [category]: index,
                                  }))
                                }
                                className={`tab-button ${activeDrugTab === index ? 'active' : ''}`}
                                id={`tab-${index}`}
                              >
                                {drug.charAt(0).toUpperCase() + drug.slice(1)}
                              </button>
                            ))}

                            {/* Add Drug Tab Button - only show when there are existing drugs */}
                            {drugs.length > 0 && !showNewDrugInput[category] && (
                              <button
                                type='button'
                                onClick={() => setShowNewDrugInput((prev) => ({ ...prev, [category]: true }))}
                                className='tab-button d-flex align-items-center justify-content-center'
                                style={{ minWidth: '40px', height: '40px', marginLeft: '8px' }}
                                title='Add new drug tab'
                              >
                                <FiPlus size={16} />
                              </button>
                            )}
                          </>
                        )}

                        {/* New Drug Input - Inline with tabs */}
                        {showNewDrugInput[category] && (
                          <div className='d-flex align-items-center' style={{ marginLeft: '8px' }}>
                            <input
                              type='text'
                              value={tempNewDrugName[category] || ''}
                              onChange={(e) => setTempNewDrugName((prev) => ({ ...prev, [category]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddDrugTab(category);
                                }
                              }}
                              className='form-control'
                              placeholder='Enter drug name'
                              style={{ width: '150px', height: '40px' }}
                              autoFocus
                            />
                            <button
                              type='button'
                              onClick={() => handleAddDrugTab(category)}
                              className='btn btn-outline-secondary btn-sm ms-2'
                              disabled={!tempNewDrugName[category]?.trim()}
                              style={{ height: '40px' }}
                            >
                              Add
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                setShowNewDrugInput((prev) => ({ ...prev, [category]: false }));
                                setTempNewDrugName((prev) => ({ ...prev, [category]: '' }));
                              }}
                              className='btn btn-outline-secondary btn-sm ms-1'
                              style={{ height: '40px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tab Content */}
                    {drugs.length === 0 ? (
                      <div className='text-center py-4'>
                        <p className='text-muted mb-3'>
                          No drugs added yet. Click the + button above to add your first drug.
                        </p>
                      </div>
                    ) : (
                      drugs.map((drug, drugIndex) => (
                        <TabPanel key={drug} value={activeDrugTab} index={drugIndex}>
                          <div className='row g-3'>
                            {getNotesForDrug(category, drug).map((note) => (
                              <div key={note.id} className='col-12'>
                                <div className='card pt-2'>
                                  <div className='card-body position-relative'>
                                    {/* Delete Button */}
                                    <div className='tw-absolute tw-top-0 tw-right-2'>
                                      <button
                                        type='button'
                                        onClick={() => handleRemoveNote(category, note.id)}
                                        className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center !tw-p-2 rounded-circle'
                                      >
                                        <FaTrash size={12} />
                                      </button>
                                    </div>

                                    <div className='d-flex align-items-center gap-3 mb-3'>
                                      <span className='badge bg-secondary'>ID: {note.id}</span>
                                      <div className='form-check'>
                                        <input
                                          type='checkbox'
                                          className='form-check-input'
                                          id={`default-${note.id}`}
                                          checked={note.is_default || false}
                                          onChange={(e) =>
                                            handleUpdateNote(category, note.id, 'is_default', e.target.checked)
                                          }
                                        />
                                        <label className='form-check-label' htmlFor={`default-${note.id}`}>
                                          Default
                                        </label>
                                      </div>
                                    </div>

                                    <div className='row g-3'>
                                      <div className='col-md-12'>
                                        <label className='form-label fw-semibold' htmlFor={`note-${note.id}`}>
                                          Note
                                        </label>
                                        <textarea
                                          id={`note-${note.id}`}
                                          className='form-control'
                                          rows={3}
                                          placeholder='Enter clinical note'
                                          value={note.note}
                                          onChange={(e) => handleUpdateNote(category, note.id, 'note', e.target.value)}
                                        />
                                        {errors[`clinical-note-${category}-${note.id}`] && (
                                          <div className='text-danger small mt-1'>
                                            {errors[`clinical-note-${category}-${note.id}`]}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabPanel>
                      ))
                    )}

                    {/* Add Note Button for this specific category - Always visible */}
                    <div className='mt-3 d-flex gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          const drugs = getDrugsForCategory(category);
                          const activeDrugTab = activeDrugTabs[category] || 0;
                          const activeDrug = drugs[activeDrugTab] || '';
                          handleAddNote(category, activeDrug);
                        }}
                        className='btn btn-outline-secondary d-flex align-items-center gap-2'
                      >
                        <FiPlus /> Add Note
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  }
);
