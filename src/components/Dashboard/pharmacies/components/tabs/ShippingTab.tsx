import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa6';

type ShippingService = {
  id: number;
  name: string;
};

type ShippingTabProps = {
  shippingServices: ShippingService[];
  onChange: (field: string, value: ShippingService[]) => void;
};

export const ShippingTab = React.forwardRef<{ validate: () => boolean }, ShippingTabProps>(function ShippingTab(
  { shippingServices, onChange },
  ref
) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleServiceChange = (index: number, field: 'id' | 'name', value: string | number) => {
    const updated = [...shippingServices];

    if (field === 'id') {
      // Convert to number, but handle empty/invalid values properly
      const numValue = value === '' ? 0 : Number(value);
      updated[index] = { ...updated[index], [field]: isNaN(numValue) ? 0 : numValue };
    } else {
      updated[index] = { ...updated[index], [field]: value as string };
    }

    onChange('shippingServices', updated);

    // Clear error when user types
    const errorKey = `service-${field}-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleAddService = () => {
    const updated = [...shippingServices, { id: 0, name: '' }];
    onChange('shippingServices', updated);
  };

  const handleRemoveService = (index: number) => {
    const updated = shippingServices.filter((_, i) => i !== index);
    onChange('shippingServices', updated);
  };

  // Simple validation function - call this before API
  const validateServices = () => {
    const newErrors: Record<string, string> = {};

    shippingServices.forEach((service, index) => {
      // Check if ID is a valid positive number (handle both string and number)
      const id = Number(service.id);
      if (!service.id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        newErrors[`service-id-${index}`] = 'Service ID must be a positive integer';
      }
      if (!service.name?.trim()) {
        newErrors[`service-name-${index}`] = 'Service Name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation to parent
  React.useImperativeHandle(ref, () => ({
    validate: validateServices,
  }));

  return (
    <div className='space-y-4'>
      {shippingServices && shippingServices.length > 0 ? (
        <div className='row g-3'>
          {shippingServices.map((service, index) => (
            <div key={index} className='col-12'>
              <div className='card pt-2'>
                <div className='card-body position-relative'>
                  {/* Delete Button */}
                  <div className='tw-absolute tw-top-0 tw-right-2'>
                    <button
                      type='button'
                      onClick={() => handleRemoveService(index)}
                      className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center !tw-p-2 rounded-circle'
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div className='row g-3'>
                    {/* Service ID */}
                    <div className='col-md-6'>
                      <label className='form-label fw-semibold' htmlFor={`service-id-${index}`}>
                        Service ID
                      </label>
                      <input
                        id={`service-id-${index}`}
                        type='number'
                        className='form-control dark-input border-black rounded-1'
                        placeholder='Enter Service ID'
                        value={service.id === 0 ? '' : service.id}
                        onChange={(e) => handleServiceChange(index, 'id', e.target.value)}
                      />
                      {errors[`service-id-${index}`] && (
                        <div className='text-danger small mt-1'>{errors[`service-id-${index}`]}</div>
                      )}
                    </div>

                    {/* Service Name */}
                    <div className='col-md-6'>
                      <label className='form-label fw-semibold' htmlFor={`service-name-${index}`}>
                        Service Name
                      </label>
                      <input
                        id={`service-name-${index}`}
                        type='text'
                        className='form-control dark-input border-black rounded-1'
                        placeholder='Enter Service Name'
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      />
                      {errors[`service-name-${index}`] && (
                        <div className='text-danger small mt-1'>{errors[`service-name-${index}`]}</div>
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
          <p className='text-muted mb-3'>No shipping services added yet.</p>
          <button
            type='button'
            onClick={handleAddService}
            className='btn btn-outline-secondary d-flex align-items-center gap-2 mx-auto'
          >
            <FiPlus /> Add Service
          </button>
        </div>
      )}

      {shippingServices && shippingServices.length > 0 && (
        <div className='text-center'>
          <button
            type='button'
            onClick={handleAddService}
            className='btn btn-outline-secondary d-flex align-items-center gap-2 mt-4 mb-4'
          >
            <FiPlus /> Add Another Service
          </button>
        </div>
      )}
    </div>
  );
});
