'use client';

import { useState, KeyboardEvent, useCallback, useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { ProviderSurveyFormValues } from '@/services/providerIntake/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { QuestionType } from '@/lib/enums';

interface Props {
  question: SurveyQuestion;
  name: string;
}

interface ProviderGroupState {
  selectedGroups: string[];
  customGroups: string[];
}

export default function ProviderGroupSelector({ question, name }: Readonly<Props>) {
  const hasSyncedOther = useRef(false);

  const [inputValue, setInputValue] = useState('');

  const { values, setFieldValue, handleBlur } = useFormikContext<ProviderSurveyFormValues>();

  const currentValue = values[name];
  const isMultiSelect = question.questionType === QuestionType.MULTIPLE_CHOICE;

  const getCurrentState = useCallback((): ProviderGroupState => {
    if (!currentValue) {
      return { selectedGroups: [], customGroups: [] };
    }

    const standardOptions = question.options || [];

    if (typeof currentValue === 'string') {
      if (isMultiSelect) {
        // For multi-select, string values shouldn't happen, but handle gracefully
        return { selectedGroups: [currentValue], customGroups: [] };
      } else {
        // For single selection, check if it's a standard option or custom
        if (standardOptions.includes(currentValue)) {
          return { selectedGroups: [currentValue], customGroups: [] };
        } else {
          // Custom value - show "Other" as selected
          return { selectedGroups: ['Other'], customGroups: [currentValue] };
        }
      }
    }

    if (Array.isArray(currentValue)) {
      const stringArray = currentValue.filter((item): item is string => typeof item === 'string');
      let selectedGroups = stringArray.filter((group) => standardOptions.includes(group));
      const customGroups = stringArray.filter((group) => !standardOptions.includes(group) && group !== 'Other');

      if (customGroups.length > 0 && !selectedGroups.includes('Other')) {
        selectedGroups = [...selectedGroups, 'Other'];
      }

      return { selectedGroups, customGroups };
    }

    return { selectedGroups: [], customGroups: [] };
  }, [currentValue, question.options, isMultiSelect]);

  const { selectedGroups, customGroups } = getCurrentState();
  const isOtherSelected = selectedGroups.includes('Other');

  const opts = question.options || [];

  useEffect(() => {
    if (isMultiSelect && !hasSyncedOther.current && customGroups.length > 0 && !isOtherSelected) {
      const standardGroupsWithoutOther = selectedGroups.filter((group) => group !== 'Other');
      const allGroups = [...standardGroupsWithoutOther, ...customGroups];
      setFieldValue(name, allGroups);
      hasSyncedOther.current = true;
    }
  }, [customGroups.length, isOtherSelected, selectedGroups, name, setFieldValue, isMultiSelect]);

  const handleGroupClick = (opt: string) => {
    if (isMultiSelect) {
      // Multi-selection logic
      const isCurrentlySelected = selectedGroups.includes(opt);
      let newSelectedGroups: string[];

      if (isCurrentlySelected) {
        newSelectedGroups = selectedGroups.filter((group) => group !== opt);
      } else {
        newSelectedGroups = [...selectedGroups, opt];
      }

      const newCustomGroups = opt === 'Other' && isCurrentlySelected ? [] : customGroups;
      if (opt === 'Other' && isCurrentlySelected) {
        setInputValue('');
        hasSyncedOther.current = false;
      }

      const standardGroupsToSave = newSelectedGroups.filter((group) => group !== 'Other');
      const allGroups =
        opt === 'Other'
          ? isCurrentlySelected
            ? [...standardGroupsToSave, ...newCustomGroups]
            : [...standardGroupsToSave, 'Other', ...newCustomGroups]
          : [...standardGroupsToSave, ...(selectedGroups.includes('Other') ? ['Other'] : []), ...newCustomGroups];

      setFieldValue(name, allGroups);
    } else {
      // Single-selection logic
      if (opt === 'Other') {
        // For single selection with "Other", keep the custom groups if any exist
        const newCustomGroups = selectedGroups.includes('Other') ? [] : customGroups;
        if (selectedGroups.includes('Other')) {
          setInputValue('');
          hasSyncedOther.current = false;
          setFieldValue(name, '');
        } else {
          setFieldValue(name, newCustomGroups.length > 0 ? newCustomGroups[0] : 'Other');
        }
      } else {
        // Select only this option, clear custom groups
        setInputValue('');
        hasSyncedOther.current = false;
        setFieldValue(name, opt);
      }
    }
  };

  const addCustomGroup = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !customGroups.includes(trimmedValue)) {
      if (isMultiSelect) {
        const newCustomGroups = [...customGroups, trimmedValue];
        const standardGroupsWithoutOther = selectedGroups.filter((group) => group !== 'Other');
        const allGroups = [...standardGroupsWithoutOther, 'Other', ...newCustomGroups];
        setFieldValue(name, allGroups);
      } else {
        // For single selection, replace the value with the custom group
        setFieldValue(name, trimmedValue);
      }
      setInputValue('');
    }
  };

  const removeCustomGroup = (groupToRemove: string) => {
    if (isMultiSelect) {
      const newCustomGroups = customGroups.filter((group) => group !== groupToRemove);
      const standardGroupsWithoutOther = selectedGroups.filter((group) => group !== 'Other');
      const allGroups =
        newCustomGroups.length > 0
          ? [...standardGroupsWithoutOther, 'Other', ...newCustomGroups]
          : [...standardGroupsWithoutOther, ...(isOtherSelected ? ['Other'] : [])];
      setFieldValue(name, allGroups);
    } else {
      // For single selection, clear the value when removing custom group
      setFieldValue(name, '');
      hasSyncedOther.current = false;
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomGroup();
    }
  };

  return (
    <div className='tw-flex tw-flex-col tw-gap-4'>
      {/* Standard group options */}
      <div className='tw-flex tw-flex-col tw-gap-3'>
        {opts.map((opt) => {
          const isSelected = isMultiSelect
            ? selectedGroups.includes(opt)
            : (typeof currentValue === 'string' && currentValue === opt) ||
              (opt === 'Other' && typeof currentValue === 'string' && currentValue && !opts.includes(currentValue));
          return (
            <button
              key={opt}
              type='button'
              onClick={() => handleGroupClick(opt)}
              className={`tw-flex tw-items-center tw-gap-2 tw-rounded tw-cursor-pointer tw-select-none border tw-w-full tw-px-3 py-3 tw-justify-start tw-gap-x-4 ${
                isSelected ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
              }`}
            >
              {isSelected ? (
                <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
              ) : (
                <FaRegCircle className='flex-shrink-0' />
              )}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Custom groups input section - shown when "Other" is selected */}
      {(isOtherSelected ||
        (!isMultiSelect && typeof currentValue === 'string' && currentValue && !opts.includes(currentValue))) && (
        <div className='tw-mt-4'>
          <label htmlFor='custom-group-input' className='tw-text-sm tw-font-medium tw-mb-2 tw-block'>
            Add Custom Group <span className='tw-text-danger'>*</span>
          </label>
          <div className='tw-flex tw-gap-2'>
            <input
              id='custom-group-input'
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleBlur}
              placeholder='Enter provider group'
              className='form-control dark-input border-blue rounded-1 tw-flex-1'
            />
            <button
              type='button'
              onClick={addCustomGroup}
              disabled={!inputValue.trim()}
              className='btn btn-outline-primary px-3'
            >
              {isMultiSelect ? 'Add' : 'Set'}
            </button>
          </div>
        </div>
      )}

      {/* Display custom groups as pills */}
      {(customGroups.length > 0 ||
        (!isMultiSelect && typeof currentValue === 'string' && currentValue && !opts.includes(currentValue))) && (
        <div className='tw-mt-3'>
          <div className='tw-flex tw-flex-wrap tw-gap-2'>
            {isMultiSelect
              ? customGroups.map((group) => (
                  <div
                    key={group}
                    className='tw-inline-flex tw-items-center tw-gap-1 tw-py-1 tw-pl-3 tw-pr-0.5 tw-rounded-pill tw-border tw-border-primary tw-text-primary tw-bg-white tw-rounded-md'
                  >
                    <span className='tw-text-sm'>{group}</span>
                    <IoClose
                      size={16}
                      onClick={() => removeCustomGroup(group)}
                      className='tw-cursor-pointer tw-text-danger hover:tw-text-danger-dark'
                    />
                  </div>
                ))
              : typeof currentValue === 'string' &&
                currentValue &&
                !opts.includes(currentValue) && (
                  <div className='tw-inline-flex tw-items-center tw-gap-1 tw-py-1 tw-pl-3 tw-pr-0.5 tw-rounded-pill tw-border tw-border-primary tw-text-primary tw-bg-white tw-rounded-md'>
                    <span className='tw-text-sm'>{currentValue}</span>
                    <IoClose
                      size={16}
                      onClick={() => removeCustomGroup(currentValue)}
                      className='tw-cursor-pointer tw-text-danger hover:tw-text-danger-dark'
                    />
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}
