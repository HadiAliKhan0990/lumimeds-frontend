import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import { Dropdown } from 'react-bootstrap';
import { useGetStatesQuery } from '@/store/slices/pharmaciesApiSlice';

type StatesTabProps = {
  forbiddenStates: string[];
  onChange: (field: string, value: string[]) => void;
};

export const StatesTab: React.FC<StatesTabProps> = ({ forbiddenStates, onChange }) => {
  const { data: allStates = [], isLoading, error } = useGetStatesQuery();
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract only the name field from the API response and filter out already forbidden states
  const availableStates = allStates.filter((state) => !forbiddenStates.includes(state.name)).map((state) => state.name);

  // Filter states based on search term
  const filteredStates = availableStates.filter((state) => state.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStateSelect = (stateName: string) => {
    if (!forbiddenStates.includes(stateName)) {
      const updated = [...forbiddenStates, stateName];
      onChange('forbiddenStates', updated);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShow(false);
        // Don't clear search term, keep it for better UX
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const removeForbiddenState = (state: string) => {
    // Remove from forbidden states
    const updated = forbiddenStates.filter((s) => s !== state);
    onChange('forbiddenStates', updated);
  };

  return (
    <div className='space-y-4'>
      <div className='row g-3 tw-mb-10'>
        <div className='col-md-6'>
          <p className='text-lg mb-0'>Forbidden States</p>
        </div>
        <div className='col-md-6'>
          <div ref={dropdownRef} className='tw-relative'>
            <Dropdown
              show={show}
              onToggle={(nextShow) => {
                // Only close if clicking outside, not when toggling
                if (!nextShow && show) {
                  return;
                }
                setShow(nextShow);
              }}
            >
              <Dropdown.Toggle
                as='div'
                className='tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-border tw-border-gray-300 tw-rounded-md tw-bg-white tw-cursor-pointer tw-flex tw-items-center tw-justify-between hover:tw-border-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500'
                disabled={isLoading || !!error}
              >
                <div className='tw-flex tw-items-center tw-flex-1 tw-pr-2'>
                  <FiSearch className='tw-mr-2 tw-text-gray-400 tw-flex-shrink-0' />
                  <input
                    type='text'
                    placeholder={
                      isLoading ? 'Loading states...' : error ? 'Error loading states' : 'Select and search forbidden states...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='tw-flex-1 !tw-border-none !tw-outline-none tw-bg-transparent tw-text-sm tw-placeholder-gray-500'
                    disabled={isLoading || !!error}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShow(true);
                    }}
                    onFocus={() => setShow(true)}
                  />
                </div>
                <FiChevronDown
                  className={`tw-text-gray-400 tw-transition-transform tw-duration-200 tw-cursor-pointer ${
                    show ? 'tw-rotate-180' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShow(false);
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu className='tw-w-full tw-max-h-80 tw-overflow-y-auto tw-border tw-border-gray-300 tw-rounded-md tw-shadow-lg tw-bg-white tw-p-0 tw-h-44'>
                {/* States list */}
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <Dropdown.Item
                      key={state}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStateSelect(state);
                      }}
                      className='tw-cursor-pointer tw-px-4 tw-py-2 hover:tw-bg-gray-100 tw-text-sm tw-border-none tw-bg-transparent'
                    >
                      {state}
                    </Dropdown.Item>
                  ))
                ) : (
                  <div className='tw-px-4 tw-py-2 tw-text-gray-500 tw-text-sm'>
                    {searchTerm ? 'No states found matching your search' : 'No states available'}
                  </div>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className='tw-flex tw-flex-wrap tw-gap-2'>
        {forbiddenStates.map((state) => (
          <button
            key={state}
            type='button'
            onClick={() => removeForbiddenState(state)}
            className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-full tw-cursor-pointer tw-transition-all tw-font-medium tw-text-sm tw-bg-red-100 tw-text-red-700 hover:tw-bg-red-200 tw-border tw-border-red-300'
          >
            {state}
            <FiX className='w-3 h-3' />
          </button>
        ))}
      </div>
    </div>
  );
};
