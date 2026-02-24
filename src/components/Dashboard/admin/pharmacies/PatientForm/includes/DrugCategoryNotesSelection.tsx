'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import { PharmacyClinicalNotes } from '@/store/slices/pharmaciesApiSlice';

export interface DrugCategoryNotesSelectionProps extends React.ComponentPropsWithoutRef<'div'> {
  show: boolean;
  setShow: (ag: boolean) => void;
  categories: PharmacyClinicalNotes[];
  choosenCategories: PharmacyClinicalNotes[];
  onChoosenCategories: (ag: PharmacyClinicalNotes[]) => void;
  onAddClinicalDifferenceStatement: () => void;
  selectedDrugName?: string | null;
}

export const DrugCategoryNotesSelection = ({
  show,
  setShow,
  categories,
  choosenCategories,
  onChoosenCategories,
  onAddClinicalDifferenceStatement,
  selectedDrugName,
}: Readonly<DrugCategoryNotesSelectionProps>) => {
  const safeChoosenCategories = choosenCategories ?? [];
  const hasCategories = categories && categories.length > 0;
  const hasSelection = safeChoosenCategories.length > 0;
  const hasDrugSelected = !!selectedDrugName;

  const renderNoDrugSelectedMessage = () => (
    <div className='text-center py-4'>
      <div className='alert alert-warning mb-0' role='alert'>
        <strong>Drug Name Required</strong>
        <p className='mb-0 mt-2'>Please select a drug name before adding a Clinical Difference Statement.</p>
      </div>
    </div>
  );

  const renderNoNotesMessage = () => (
    <div className='text-center py-4 text-muted'>
      <p className='mb-0'>No clinical notes available at this time.</p>
    </div>
  );

  const renderCategoryList = () => (
    <>
      <div className='text-muted small mb-2'>Select the clinical notes to add to this prescription:</div>
      {categories.map((category) => {
        const checkboxId = `pharmacy-auto-notes-${category.id}`;
        const isChecked = safeChoosenCategories.some((item) => item.id === category.id);

        return (
          <div key={category.id} className='d-flex align-items-start text-start gap-2'>
            <label
              htmlFor={checkboxId}
              className='d-flex align-items-start user-select-none gap-2 cursor-pointer'
              style={{ cursor: 'pointer' }}
            >
              <input
                className='c_checkbox'
                type='checkbox'
                checked={isChecked}
                onChange={({ target: { checked } }) => {
                  const newChoosenCategories = checked
                    ? [...safeChoosenCategories, { ...category }]
                    : safeChoosenCategories.filter((item) => item.id !== category.id);

                  onChoosenCategories(newChoosenCategories);
                }}
                id={checkboxId}
                aria-label={`Select ${category.note || 'clinical note'}`}
              />
              <span className='flex-grow-1'>{category.note || <span className='text-muted'>(No note text)</span>}</span>
            </label>
          </div>
        );
      })}
    </>
  );

  const renderContent = () => {
    if (hasDrugSelected) {
      return hasCategories ? renderCategoryList() : renderNoNotesMessage();
    }
    return renderNoDrugSelectedMessage();
  };

  return (
    <ConfirmationModal
      show={show}
      onHide={() => setShow(false)}
      onConfirm={() => {
        if (hasDrugSelected && hasSelection) {
          onAddClinicalDifferenceStatement();
          setShow(false);
        }
      }}
      title='Clinical Difference Statement'
      confirmLabel={hasSelection ? `Add (${safeChoosenCategories.length})` : 'Add'}
      cancelLabel='Close'
      confirmButtonDisabled={!hasDrugSelected || !hasSelection}
      message={<div className='d-flex flex-column gap-3'>{renderContent()}</div>}
    />
  );
};
