'use client';
import { useState, useEffect } from 'react';
import Modal from '../../../../Common/modal';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useStates } from '@/hooks/useStates';

type Props = {
  show: boolean;
  initialData?: {
    id?: string;
    name?: string;
    licenseNumber?: string;
    expiration?: string;
  };
  onSave: (data: { id?: string; name: string; licenseNumber: string; expiration: string }) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isAdding?: boolean;
  isUpdating?: boolean;
  isRemoving?: boolean;
};

const parseMMDDYYYY = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const mmddyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (mmddyyyyMatch) {
    const month = parseInt(mmddyyyyMatch[1], 10) - 1;
    const day = parseInt(mmddyyyyMatch[2], 10);
    const year = parseInt(mmddyyyyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export default function StateModal({
  show,
  initialData,
  onSave,
  onClose,
  onDelete,
  isAdding,
  isUpdating,
  isRemoving,
}: Props) {
  const { stateNames, isLoading: isLoadingStates } = useStates();
  const [id, setId] = useState<string | undefined>(initialData?.id);
  const [name, setName] = useState(initialData?.name || '');
  const [licenseNumber, setLicenseNumber] = useState(initialData?.licenseNumber || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateInputValue, setDateInputValue] = useState<string>(''); // Track raw input for manual entry
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (show) {
      setId(initialData?.id);
      setName(initialData?.name || '');
      setLicenseNumber(initialData?.licenseNumber || '');
      const parsedDate = initialData?.expiration ? parseMMDDYYYY(initialData.expiration) : null;
      setSelectedDate(parsedDate);
      setDateInputValue(''); // Reset raw input
      setErrors({});
    } else {
      setId(undefined);
      setName('');
      setLicenseNumber('');
      setSelectedDate(null);
      setDateInputValue('');
      setErrors({});
    }
  }, [show, initialData]);

  const handleSave = () => {
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      return;
    }

    const newErrors: { [key: string]: string } = {};
    if (!initialData && !name.trim()) newErrors.name = 'Select a state';

    if (!licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else {
      const trimmedLicense = licenseNumber.trim();
      if (trimmedLicense.length < 4 || trimmedLicense.length > 25) {
        newErrors.licenseNumber = 'License number must be 4-25 characters';
      } else if (!/^[a-zA-Z0-9\s.\-]+$/.test(trimmedLicense)) {
        newErrors.licenseNumber = 'License number must contain only letters, numbers, dashes, periods, and spaces';
      } else if (!/[a-zA-Z0-9]/.test(trimmedLicense)) {
        newErrors.licenseNumber = 'License number must contain at least one letter or number';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      let formattedDate = '';
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        formattedDate = `${month}-${day}-${year}`;
      }

      onSave({ id, name, licenseNumber: licenseNumber.trim(), expiration: formattedDate });
    }
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'licenseNumber':
        setLicenseNumber(value);
        break;
    }

    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setDateInputValue(''); // Clear raw input when date is selected from picker

    // Clear any expiration errors when date is selected/cleared
    if (errors.expiration) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.expiration;
        return copy;
      });
    }
  };

  // Handle manual date input (track raw input)
  const handleDateInputChange = (event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (!event) return;

    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    setDateInputValue(inputValue);

    // If user clears the field manually, also clear the selected date
    if (!inputValue || inputValue.trim() === '') {
      setSelectedDate(null);
    }

    // Clear error as user types
    if (errors.expiration) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.expiration;
        return copy;
      });
    }
  };

  // Validate date when user leaves the field
  const handleDateBlur = () => {
    // If there's no manual input, don't do anything (date might be selected from picker)
    if (!dateInputValue || dateInputValue.trim() === '') {
      // Don't clear selectedDate if it exists (user might have picked from calendar)
      return;
    }

    // Try to parse the date in MM-dd-yyyy format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateInputValue?.match(datePattern);

    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);

      // Validate month (1-12), day (1-31), and year
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
        setErrors((prev) => ({
          ...prev,
          expiration: 'Invalid date. Please enter a valid date in MM-DD-YYYY format',
        }));
        setSelectedDate(null);
        return;
      }

      // Create date and check if it's actually valid (e.g., no Feb 30)
      const parsedDate = new Date(year, month - 1, day);
      if (parsedDate.getFullYear() === year && parsedDate.getMonth() === month - 1 && parsedDate.getDate() === day) {
        // Valid date - set it
        setSelectedDate(parsedDate);
        setDateInputValue(''); // Clear raw input since we have a valid date
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.expiration;
          return copy;
        });
      } else {
        // Invalid date (e.g., Feb 30, Apr 31)
        setErrors((prev) => ({
          ...prev,
          expiration: 'Invalid date. Please enter a valid date in MM-DD-YYYY format',
        }));
        setSelectedDate(null);
      }
    } else {
      // Format doesn't match MM-dd-yyyy
      setErrors((prev) => ({
        ...prev,
        expiration: 'Invalid format. Please use MM-dd-yyyy format (e.g., 12-31-2025)',
      }));
      setSelectedDate(null);
    }
  };

  const stateOptions = isLoadingStates
    ? []
    : initialData?.name
    ? [initialData.name, ...stateNames.filter((s) => s !== initialData.name)]
    : stateNames;

  return (
    <Modal
      show={show}
      title={initialData ? 'Edit State' : 'Add More Licensed State'}
      onClose={onClose}
      onSave={handleSave}
      saveText={initialData ? 'Update' : 'Add'}
      hideCancel={!!initialData}
      onDelete={initialData?.id !== undefined ? () => onDelete?.(initialData.id!) : undefined}
      isAdding={isAdding}
      isUpdating={isUpdating}
      isRemoving={isRemoving}
    >
      <div className='mb-3 mt-3 position-relative'>
        <label className='form-label fs-sm-6 fs-md-5 d-flex align-items-center'>Licensed State</label>
        <select
          className={`form-select border ls-custom-border ${errors.name ? 'border-danger' : ''} ${
            !name ? 'text-muted' : ''
          } ${initialData ? 'bg-light pointer-events-none' : ''}`}
          value={name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={!!initialData}
        >
          <option className='text-muted' value=''>
            Select State
          </option>
          {stateOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.name && <small className='text-danger'>{errors.name}</small>}
      </div>

      <div className='row pb-4 border-bottom border-muted'>
        <div className='col-12 col-md-6 mb-3 mb-md-0 position-relative'>
          <label className='form-label fs-6'>License Number</label>
          <input
            type='text'
            className={`form-control border ls-custom-border ${errors.licenseNumber ? 'border-danger' : ''}`}
            value={licenseNumber}
            placeholder='Enter License Number'
            maxLength={10}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
          />
          {errors.licenseNumber && <small className='text-danger'>{errors.licenseNumber}</small>}
        </div>

        <div className='col-12 col-md-6 position-relative'>
          <label className='form-label fs-6'>License Expiration Date</label>
          <ReactDatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            onChangeRaw={handleDateInputChange}
            onBlur={handleDateBlur}
            value={dateInputValue || undefined}
            placeholderText='Select Date'
            dateFormat='MM-dd-yyyy'
            className={`form-control shadow-none ${errors.expiration ? 'border-danger' : ''} ${
              selectedDate ? '' : 'date-input'
            }`}
            wrapperClassName='w-100'
            popperClassName='react-datepicker-popper'
            popperContainer={({ children }) => <div style={{ zIndex: 9999, position: 'relative' }}>{children}</div>}
            isClearable
            clearButtonClassName='q-date-picker-clear-button'
          />
          {errors.expiration && <small className='text-danger d-block mt-1'>{errors.expiration}</small>}
        </div>
      </div>
    </Modal>
  );
}
