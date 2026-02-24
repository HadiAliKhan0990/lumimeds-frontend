import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa6';

type Header = {
  key: string;
  value: string;
};

type BasicInfoTabProps = {
  formData: {
    practiceId?: string;
    practiceName?: string;
    vendorId?: string;
    locationId?: string;
    apiNetworkId?: string;
    apiNetworkName?: string;
    headers?: Header[];
    type?: string;
  };
  onChange: (field: string, value: unknown) => void;
};

export const BasicInfoTab = React.forwardRef<{ validate: () => boolean }, BasicInfoTabProps>(function BasicInfoTab(
  { formData, onChange },
  ref
) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...(formData.headers || [])];
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value };
    onChange('headers', updatedHeaders);

    // Clear error when user types
    const errorKey = `header-${field}-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleAddHeader = () => {
    const updatedHeaders = [...(formData.headers || []), { key: '', value: '' }];
    onChange('headers', updatedHeaders);
  };

  const handleRemoveHeader = (index: number) => {
    const updatedHeaders = formData.headers?.filter((_, i) => i !== index) || [];
    onChange('headers', updatedHeaders);
  };

  // Simple validation function - call this before API
  const validateHeaders = () => {
    const newErrors: Record<string, string> = {};

    formData.headers?.forEach((header, index) => {
      if (!header.key?.trim()) {
        newErrors[`header-key-${index}`] = 'key is required';
      }
      if (!header.value?.trim()) {
        newErrors[`header-value-${index}`] = 'value is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation to parent
  React.useImperativeHandle(ref, () => ({
    validate: validateHeaders,
  }));

  const isLifefileType = formData.type === 'lifefile';

  return (
    <div className='space-y-4'>
      {/* Show full basic info only for lifefile type */}
      {isLifefileType && (
        <div className='row g-3'>
          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='practice-id'>
              Practice ID
            </label>
            <input
              id='practice-id'
              type='number'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter practice ID'
              value={formData.practiceId || ''}
              onChange={(e) => onChange('practiceId', e.target.value)}
            />
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='practice-name'>
              Practice Name
            </label>
            <input
              id='practice-name'
              type='text'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter practice name'
              value={formData.practiceName || ''}
              onChange={(e) => onChange('practiceName', e.target.value)}
            />
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='vendor-id'>
              Vendor ID
            </label>
            <input
              id='vendor-id'
              type='number'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter vendor ID'
              value={formData.vendorId || ''}
              onChange={(e) => onChange('vendorId', e.target.value)}
            />
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='location-id'>
              Location ID
            </label>
            <input
              id='location-id'
              type='number'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter location ID'
              value={formData.locationId || ''}
              onChange={(e) => onChange('locationId', e.target.value)}
            />
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='api-network-id'>
              API Network ID
            </label>
            <input
              id='api-network-id'
              type='number'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter API network ID'
              value={formData.apiNetworkId || ''}
              onChange={(e) => onChange('apiNetworkId', e.target.value)}
            />
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-semibold' htmlFor='api-network-name'>
              API Network Name
            </label>
            <input
              id='api-network-name'
              type='text'
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter API network name'
              value={formData.apiNetworkName || ''}
              onChange={(e) => onChange('apiNetworkName', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Headers section - always shown */}
      <div className='tw-mt-10'>
        <div className='row g-3'>
          <div className='col-md-6'>
            <p className='text-lg'>Headers</p>
          </div>
        </div>

        {formData.headers && formData.headers.length > 0 ? (
          <div className='row g-3'>
            {formData.headers.map((header, index) => (
              <div key={index} className='col-12'>
                <div className='card pt-2'>
                  <div className='card-body position-relative'>
                    {/* Delete Button */}
                    <div className='tw-absolute tw-top-0 tw-right-2'>
                      <button
                        type='button'
                        onClick={() => handleRemoveHeader(index)}
                        className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center !tw-p-2 rounded-circle'
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div className='row g-3'>
                      <div className='col-md-6'>
                        <label className='form-label fw-semibold' htmlFor={`header-key-${index}`}>
                          Key
                        </label>
                        <input
                          id={`header-key-${index}`}
                          type='text'
                          className='form-control dark-input border-black rounded-1'
                          placeholder='Enter header key'
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        />
                        {errors[`header-key-${index}`] && (
                          <div className='text-danger small mt-1'>{errors[`header-key-${index}`]}</div>
                        )}
                      </div>

                      <div className='col-md-6'>
                        <label className='form-label fw-semibold' htmlFor={`header-value-${index}`}>
                          Value
                        </label>
                        <input
                          id={`header-value-${index}`}
                          type='text'
                          className='form-control dark-input border-black rounded-1'
                          placeholder='Enter header value'
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        />
                        {errors[`header-value-${index}`] && (
                          <div className='text-danger small mt-1'>{errors[`header-value-${index}`]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-5'>
            <p className='text-muted mb-3'>No headers added yet.</p>
          </div>
        )}

        {formData.headers && formData.headers.length > 0 && (
          <div className='text-center'>
            <button
              type='button'
              onClick={handleAddHeader}
              className='btn btn-outline-secondary d-flex align-items-center gap-2 mt-4 mb-4'
            >
              <FiPlus /> Add Another Header
            </button>
          </div>
        )}

        {(!formData.headers || formData.headers.length === 0) && (
          <div className='text-center'>
            <button
              type='button'
              onClick={handleAddHeader}
              className='btn btn-outline-primary d-flex align-items-center gap-2 mt-4 mb-4'
            >
              <FiPlus /> Add Header
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
