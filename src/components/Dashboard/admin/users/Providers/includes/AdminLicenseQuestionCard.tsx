import Select, { SingleValue } from 'react-select';
import DatePicker from 'react-datepicker';
import { FaTrash } from 'react-icons/fa6';
import { LicenseQuestionAnswer } from '@/services/providerIntake/types';
import { HTMLAttributes, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

export function AdminLicenseQuestionCard({
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

  const popperContainer = useCallback((props: { children?: React.ReactNode }) => {
    if (typeof document !== 'undefined') {
      return createPortal(<div className='tw-relative tw-z-[9999]'>{props.children}</div>, document.body);
    }
    return <div className='tw-relative tw-z-[9999]'>{props.children}</div>;
  }, []);

  const getLicenseStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;

    const today = new Date();
    const exp = new Date(expiryDate);

    // Check if selected date year is in future year
    if (exp.getFullYear() > today.getFullYear()) {
      return { label: 'Active', color: 'bg-success text-white' };
    }

    // Reset time parts to compare only dates
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired', color: 'bg-danger text-white' };
    }

    if (diffDays === 0) {
      return { label: 'Expires today', color: 'bg-warning text-dark' };
    }

    if (diffDays <= 90) {
      return { label: `Expires in ${diffDays}d`, color: 'bg-warning text-dark' };
    }

    return { label: 'Active', color: 'bg-success text-white' };
  };

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

  const selectedValue = useMemo(() => {
    const licenseStateLower = (license.state || '').toLowerCase();
    return availableStateOptions.find((opt) => opt.value.toLowerCase() === licenseStateLower) || null;
  }, [availableStateOptions, license.state]);

  const statusInfo = useMemo(() => getLicenseStatus(license.expiryDate), [license.expiryDate]);

  return (
    <div {...props} className='card border rounded-3 p-3'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div className='d-flex align-items-center gap-2'>
          <h6 className='mb-0 fw-semibold'>License Information</h6>
        </div>
        <button
          type='button'
          onClick={handleRemoveLicense}
          className='btn btn-sm btn-outline-danger d-flex align-items-center gap-1'
        >
          <FaTrash size={12} />
          Remove
        </button>
      </div>

      <div className='row g-3'>
        {/* State Select */}
        <div className='col-lg-4'>
          <label className='form-label fw-medium'>
            State <span className='text-danger'>*</span>
          </label>
          <Select
            options={availableStateOptions}
            value={selectedValue}
            onChange={handleStateChange}
            onBlur={() => setTouched((prev) => ({ ...prev, state: true }))}
            placeholder='Select state...'
            isClearable
            className={stateError && touched.state ? 'is-invalid' : ''}
          />
          {stateError && touched.state && <div className='invalid-feedback d-block'>{stateError}</div>}
        </div>

        {/* License Number */}
        <div className='col-lg-4'>
          <label className='form-label fw-medium'>
            License Number <span className='text-danger'>*</span>
          </label>
          <input
            type='text'
            className={`form-control ${licenseNumberError && touched.number ? 'is-invalid' : ''}`}
            value={license.licenseNumber || ''}
            onChange={(e) => handleLicenseNumberChange(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, number: true }))}
            placeholder='Enter license number'
          />
          {licenseNumberError && touched.number && <div className='invalid-feedback d-block'>{licenseNumberError}</div>}
        </div>

        {/* Expiry Date */}
        <div className='col-lg-4'>
          <label className='form-label fw-medium'>Expiration Date</label>
          <DatePicker
            selected={license.expiryDate}
            onChange={handleDateChange}
            onBlur={() => setTouched((prev) => ({ ...prev, expiryDate: true }))}
            dateFormat='MM-dd-yyyy'
            placeholderText='MM-DD-YYYY'
            className={`form-control !tw-pl-9 tw-cursor-pointer ${
              expiryDateError && touched.expiryDate ? 'is-invalid' : ''
            } z-100`}
            showMonthDropdown
            showYearDropdown
            showIcon
            isClearable
            icon={<FiCalendar className='tw-pointer-events-none' size={16} />}
            dropdownMode='select'
            popperClassName='admin-license-datepicker-popper'
            popperContainer={popperContainer}
          />
          {expiryDateError && touched.expiryDate && <div className='invalid-feedback d-block'>{expiryDateError}</div>}
        </div>
      </div>

      {/* Status Badge */}
      {statusInfo && (
        <div className='mt-3'>
          <span className={`badge ${statusInfo.color} px-3 py-2`}>{statusInfo.label}</span>
        </div>
      )}
    </div>
  );
}
