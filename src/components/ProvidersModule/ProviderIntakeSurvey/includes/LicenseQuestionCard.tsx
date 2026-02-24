import Select, { SingleValue } from 'react-select';
import DatePicker from 'react-datepicker';
import { FaTrash } from 'react-icons/fa6';
import { LicenseQuestionAnswer } from '@/services/providerIntake/types';
import { HTMLAttributes, useMemo, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  handleRemoveLicense: () => void;
  license: LicenseQuestionAnswer;
  stateOptions: Array<{
    value: string;
    label: string;
  }>;
  handleStateChange: (
    selected: SingleValue<{
      value: string;
      label: string;
    }>
  ) => void;
  handleDateChange: (data: Date | null) => void;
  handleLicenseNumberChange: (value: string) => void;
  licenseAnswers: LicenseQuestionAnswer[];
  currentIndex: number;
  stateError?: string;
  expiryDateError?: string;
  licenseNumberError?: string;
}

export function LicenseQuestionCard({
  handleRemoveLicense,
  license,
  handleStateChange,
  handleDateChange,
  handleLicenseNumberChange,
  stateOptions,
  licenseAnswers,
  currentIndex,
  stateError,
  expiryDateError,
  licenseNumberError,
  ...props
}: Readonly<IProps>) {
  const [touched, setTouched] = useState({
    state: false,
    expiryDate: false,
    number: false,
  });
  const [dateInputValue, setDateInputValue] = useState<string>(''); // Track raw input for manual entry
  const [dateValidationError, setDateValidationError] = useState<string>(''); // Track manual input validation errors

  const getLicenseStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;

    const today = new Date();
    const exp = new Date(expiryDate);

    // Check if selected date year is in future year
    if (exp.getFullYear() > today.getFullYear()) {
      return { label: 'Active License', color: 'bg-success text-white' }; // green background, white text
    }

    // Reset time parts to compare only dates
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired License', color: 'bg-danger' }; // red
    }

    if (diffDays === 0) {
      return { label: 'License expires today', color: 'bg-warning text-dark' };
    }

    if (diffDays <= 90) {
      // For dates within 30 days, always show in days
      if (diffDays <= 30) {
        return { label: `Expires in ${diffDays} Day${diffDays !== 1 ? 's' : ''}`, color: 'bg-warning text-dark' };
      }

      // For dates between 31-90 days, show in months and days
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;

      if (remainingDays === 0) {
        return { label: `Expires in ${diffMonths} Month${diffMonths !== 1 ? 's' : ''}`, color: 'bg-warning text-dark' };
      } else {
        return {
          label: `Expires in ${diffMonths} Month${diffMonths !== 1 ? 's' : ''} and ${remainingDays} Day${
            remainingDays !== 1 ? 's' : ''
          }`,
          color: 'bg-warning text-dark',
        };
      }
    }

    return { label: 'Active License', color: 'bg-success' }; // green
  };

  // Handle manual date input (track raw input)
  const handleDateInputChange = (event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (!event) return;

    const target = event.target as HTMLInputElement;
    const inputValue = target.value;

    setDateInputValue(inputValue);

    // If user clears the field manually, also clear the selected date
    if (!inputValue || inputValue.trim() === '') {
      handleDateChange(null);
    }

    // Clear error as user types
    if (dateValidationError) {
      setDateValidationError('');
    }
  };

  // Validate date when user leaves the field
  const handleDateBlur = () => {
    setTouched((obj) => ({ ...obj, expiryDate: true }));

    // If there's no manual input, don't do anything (date might be selected from picker)
    if (!dateInputValue || dateInputValue.trim() === '') {
      // Don't clear selectedDate if it exists (user might have picked from calendar)
      return;
    }

    // Try to parse the date in MM/dd/yyyy format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateInputValue?.match(datePattern);

    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);

      // Validate month (1-12), day (1-31), and year
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
        setDateValidationError('Invalid date. Please enter a valid date in MM-DD-YYYY format');
        handleDateChange(null);
        return;
      }

      // Create date and check if it's actually valid (e.g., no Feb 30)
      const parsedDate = new Date(year, month - 1, day);
      if (parsedDate.getFullYear() === year && parsedDate.getMonth() === month - 1 && parsedDate.getDate() === day) {
        // Valid date - set it
        handleDateChange(parsedDate);
        setDateInputValue(''); // Clear raw input since we have a valid date
        setDateValidationError('');
      } else {
        // Invalid date (e.g., Feb 30, Apr 31)
        setDateValidationError('Invalid date. Please enter a valid date in MM-DD-YYYY format');
        handleDateChange(null);
      }
    } else {
      // Format doesn't match MM/dd/yyyy
      setDateValidationError('Invalid format. Please use MM-DD-YYYY format (e.g., 12-31-2025)');
      handleDateChange(null);
    }
  };

  // Handle date change from picker
  const handleDatePickerChange = (date: Date | null) => {
    console.log('onChange fired:', date);
    handleDateChange(date);
    setDateInputValue(''); // Clear raw input when date is selected from picker

    // Clear any validation errors when date is selected/cleared
    if (dateValidationError) {
      setDateValidationError('');
    }
  };

  const licenseStatus = useMemo(() => {
    if (license.expiryDate) {
      return getLicenseStatus(license.expiryDate);
    }
  }, [license.expiryDate]);

  // Filter out already selected states, but keep the current license's state available (case-insensitive)
  const availableStateOptions = useMemo(() => {
    // Get selected states (case-insensitive) excluding current license
    const selectedStatesLower = new Set(
      licenseAnswers
        .map((l, index) => (index !== currentIndex ? l.state : null))
        .filter(Boolean)
        .map((state) => (state || '').toLowerCase())
    );
    const currentStateLower = (license.state || '').toLowerCase();

    return stateOptions.filter(
      (option) =>
        !selectedStatesLower.has(option.value.toLowerCase()) || option.value.toLowerCase() === currentStateLower
    );
  }, [stateOptions, licenseAnswers, currentIndex, license.state]);

  return (
    <div className='card pt-2' {...props}>
      <div className='card-body position-relative'>
        {/* Delete Button */}
        <div className='tw-absolute tw-top-0 tw-right-2'>
          <button
            type='button'
            onClick={handleRemoveLicense}
            className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center !tw-p-2 rounded-circle'
          >
            <FaTrash size={12} />
          </button>
        </div>

        <div className='row g-3'>
          {/* State Select */}
          <div className={`col-md-6 ${license.expiryDate && licenseStatus ? 'col-xl-3' : 'col-xl-4'}`}>
            <label className='form-label fw-semibold' htmlFor={`state-select-${currentIndex}`}>
              State
            </label>
            <Select
              inputId={`state-select-${currentIndex}`}
              options={availableStateOptions}
              value={
                availableStateOptions.find((opt) => opt.value.toLowerCase() === (license.state || '').toLowerCase()) ||
                null
              }
              onChange={(selected) => {
                handleStateChange(selected);
              }}
              placeholder='Select State'
              onBlur={() => setTouched((obj) => ({ ...obj, state: true }))}
              classNames={{
                indicatorSeparator: () => 'd-none',
                control: () => 'rounded-1',
              }}
            />
            {stateError && touched.state ? <div className='invalid-feedback d-block'>{stateError}</div> : null}
          </div>

          {/* Expiry Date */}
          <div className={`col-md-6 ${license.expiryDate && licenseStatus ? 'col-xl-3' : 'col-xl-4'}`}>
            <label className='form-label fw-semibold' htmlFor={`expiry-date-${currentIndex}`}>
              Expiry Date
            </label>
            <div>
              <DatePicker
                id={`expiry-date-${currentIndex}`}
                showIcon
                isClearable
                icon={<FiCalendar className='tw-pointer-events-none' size={16} />}
                selected={license.expiryDate ? new Date(license.expiryDate) : null}
                onChange={handleDatePickerChange}
                onChangeRaw={handleDateInputChange}
                onBlur={handleDateBlur}
                value={dateInputValue || undefined}
                dateFormat={'MM-dd-YYYY'}
                className={`form-control dark-input !tw-pl-9 border-black rounded-1 ${
                  dateValidationError ? 'border-danger' : ''
                }`}
                placeholderText={'Please select expiry date'}
              />
            </div>
            {dateValidationError ? (
              <div className='invalid-feedback d-block'>{dateValidationError}</div>
            ) : expiryDateError && touched.expiryDate ? (
              <div className='invalid-feedback d-block'>{expiryDateError}</div>
            ) : null}
          </div>

          {/* License Number */}
          <div className={`col-md-6 ${license.expiryDate && licenseStatus ? 'col-xl-3' : 'col-xl-4'}`}>
            <label className='form-label fw-semibold' htmlFor={`license-number-${currentIndex}`}>
              License Number
            </label>
            <input
              id={`license-number-${currentIndex}`}
              type='text'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter license #'
              onBlur={() => setTouched((obj) => ({ ...obj, number: true }))}
              value={license.licenseNumber}
              onChange={(e) => handleLicenseNumberChange(e.target.value)}
            />
            {licenseNumberError && touched.number ? (
              <div className='invalid-feedback d-block'>{licenseNumberError}</div>
            ) : null}
          </div>

          {license.expiryDate && licenseStatus && (
            <div className='col-md-6 col-xl-3'>
              <label className='form-label fw-semibold' htmlFor={`license-status-${currentIndex}`}>
                License Expiry Status
              </label>
              <div id={`license-status-${currentIndex}`}>
                {<span className={`badge ${licenseStatus.color} p-2`}>{licenseStatus.label}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
