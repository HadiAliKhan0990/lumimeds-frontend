import React, { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa6';
import { PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { ReactSelect } from '@/components/elements/ReactSelect';

type MedicineOption = {
  label: string;
  value: string;
};

type RouteOption = {
  label: string;
  value: 'im' | 'sq';
};

type TagField = 'quantity' | 'medicineCategories' | 'supplyDays';

type DosageStructure = {
  semaglutide?: number[];
  tirzepatide?: number[];
  nad?: {
    im?: number[];
    sq?: number[];
  };
  [key: string]: number[] | { im?: number[]; sq?: number[] } | undefined;
};

type ProductsTabProps = {
  formData: {
    quantity?: string[];
    medicineCategories?: string[];
    supplyDays?: number[];
    dosage?: DosageStructure;
    products?: PharmacyProduct[];
  };
  onChange: (field: string, value: unknown) => void;
};

export const ProductsTab = React.forwardRef<{ validate: () => boolean }, ProductsTabProps>(function ProductsTab(
  { formData, onChange },
  ref
) {
  const [quantityInput, setQuantityInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [supplyDayInput, setSupplyDayInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dosage states
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineOption | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [dosageInput, setDosageInput] = useState('');
  const [currentBackendDosage, setCurrentBackendDosage] = useState<DosageStructure>(formData.dosage || {});

  // Sync currentBackendDosage when formData.dosage changes externally
  React.useEffect(() => {
    if (formData.dosage) {
      setCurrentBackendDosage(formData.dosage);
    }
  }, [formData.dosage]);

  // Helper function to check if a medicine has routes
  const hasRoutes = (medicine: string): boolean => {
    const dosage = currentBackendDosage[medicine];
    return dosage !== undefined && typeof dosage === 'object' && !Array.isArray(dosage);
  };

  // Helper function to get dosages for a medicine (handles both simple arrays and route-based)
  const getDosagesForMedicine = (medicine: string, route?: 'im' | 'sq'): number[] => {
    const dosage = currentBackendDosage[medicine];
    if (!dosage) return [];
    
    if (Array.isArray(dosage)) {
      return dosage;
    }
    
    if (typeof dosage === 'object' && route) {
      return dosage[route] || [];
    }
    
    return [];
  };

  // Dosage dropdown options - extract from backend data
  const medicineOptions: MedicineOption[] = Object.keys(currentBackendDosage).map((medicine) => ({
    label: medicine,
    value: medicine,
  }));

  // Route options for medicines with routes (like nad)
  const routeOptions: RouteOption[] = [
    { label: 'IM', value: 'im' },
    { label: 'SQ', value: 'sq' },
  ];

  // Get available dosages for selected medicine/route from backend
  const availableDosagesForMedicine = selectedMedicine
    ? selectedRoute
      ? getDosagesForMedicine(selectedMedicine.value, selectedRoute.value)
      : getDosagesForMedicine(selectedMedicine.value)
    : [];

  // Dosage handlers
  const handleMedicineSelect = (option: unknown) => {
    const selectedOption = option as MedicineOption | null;
    setSelectedMedicine(selectedOption);
    setSelectedRoute(null); // Reset route when medicine changes
    setDosageInput(''); // Reset dosage input when medicine changes
  };

  const handleRouteSelect = (option: unknown) => {
    const selectedOption = option as RouteOption | null;
    setSelectedRoute(selectedOption);
    setDosageInput(''); // Reset dosage input when route changes
  };

  const handleAddDosage = () => {
    if (!selectedMedicine || !dosageInput.trim()) return;
    
    // For medicines with routes (like nad), require route selection
    if (hasRoutes(selectedMedicine.value) && !selectedRoute) {
      return;
    }

    const medicine = selectedMedicine.value;
    const dosage = parseFloat(dosageInput);

    if (isNaN(dosage)) {
      return;
    }

    // Create a deep copy of current backend dosage
    const updatedDosage: DosageStructure = JSON.parse(JSON.stringify(currentBackendDosage));

    if (hasRoutes(medicine) && selectedRoute) {
      // Handle route-based medicine (like nad)
      if (!updatedDosage[medicine] || typeof updatedDosage[medicine] !== 'object' || Array.isArray(updatedDosage[medicine])) {
        updatedDosage[medicine] = { im: [], sq: [] };
      }
      
      const routeData = updatedDosage[medicine] as { im?: number[]; sq?: number[] };
      const routeArray = routeData[selectedRoute.value] || [];
      
      // Add dosage if it doesn't exist
      if (!routeArray.includes(dosage)) {
        routeArray.push(dosage);
        routeData[selectedRoute.value] = routeArray;
        updatedDosage[medicine] = routeData;
      }
    } else {
      // Handle simple array-based medicine (like semaglutide, tirzepatide)
      const currentArray = Array.isArray(updatedDosage[medicine]) 
        ? (updatedDosage[medicine] as number[])
        : [];
      
      if (!currentArray.includes(dosage)) {
        updatedDosage[medicine] = [...currentArray, dosage];
      }
    }

    // Update states and form data
    setCurrentBackendDosage(updatedDosage);
    onChange('dosage', updatedDosage);
    setDosageInput('');
  };

  // Tag handlers
  const handleAddTag = (field: string, value: string, setValue: (val: string) => void) => {
    if (!value.trim()) return;

    const currentArray = formData[field as keyof typeof formData] || [];
    if (field === 'supplyDays') {
      const numValue = parseInt(value);
      if (isNaN(numValue)) return;
      onChange(field, [...(currentArray as number[]), numValue]);
    } else if (field === 'quantity') {
      const normalizedValues = [...(currentArray as Array<string | number>), value.trim()].map((item) =>
        item.toString()
      );
      onChange(field, normalizedValues);
    } else {
      onChange(field, [...(currentArray as string[]), value.trim()]);
    }
    setValue('');
  };

  const handleRemoveTag = (field: TagField, index: number) => {
    switch (field) {
      case 'quantity': {
        const current = formData.quantity ?? [];
        const updated = current.filter((_, i) => i !== index).map((item) => item.toString());
        onChange(field, updated);
        break;
      }
      case 'medicineCategories': {
        const current = formData.medicineCategories ?? [];
        const updated = current.filter((_, i) => i !== index);
        onChange(field, updated);
        break;
      }
      case 'supplyDays': {
        const current = formData.supplyDays ?? [];
        const updated = current.filter((_, i) => i !== index);
        onChange(field, updated);
        break;
      }
      default:
        break;
    }
  };

  // Product handlers
  const handleProductChange = (index: number, field: keyof PharmacyProduct, value: string | number | null) => {
    const updated = [...(formData.products || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange('products', updated);

    // Clear error when user types
    const errorKey = `product-${field}-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Simple validation function - call this before API
  const validateProducts = () => {
    const newErrors: Record<string, string> = {};

    formData.products?.forEach((product, index) => {
      // Required fields validation - handle both string and number types
      if (!product.form || (typeof product.form === 'string' && !product.form.trim())) {
        newErrors[`product-form-${index}`] = 'Form is required';
      }
      if (!product.prodId || (typeof product.prodId === 'string' && !product.prodId.trim())) {
        newErrors[`product-prodId-${index}`] = 'Product ID is required';
      }
      if (!product.prodName || (typeof product.prodName === 'string' && !product.prodName.trim())) {
        newErrors[`product-prodName-${index}`] = 'Product Name is required';
      }
      if (!product.strength || (typeof product.strength === 'string' && !product.strength.trim())) {
        newErrors[`product-strength-${index}`] = 'Strength is required';
      }
      if (!product.dispenseSize || (typeof product.dispenseSize === 'string' && !product.dispenseSize.trim())) {
        newErrors[`product-dispenseSize-${index}`] = 'Dispense Size is required';
      }
      if (!product.scheduleCode || (typeof product.scheduleCode === 'string' && !product.scheduleCode.trim())) {
        newErrors[`product-scheduleCode-${index}`] = 'Schedule Code is required';
      }
      if (!product.concentration || (typeof product.concentration === 'string' && !product.concentration.trim())) {
        newErrors[`product-concentration-${index}`] = 'Concentration is required';
      }
      if (!product.quantityUnits || (typeof product.quantityUnits === 'string' && !product.quantityUnits.trim())) {
        newErrors[`product-quantityUnits-${index}`] = 'Quantity Units is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation to parent
  React.useImperativeHandle(ref, () => ({
    validate: validateProducts,
  }));

  const handleAddProduct = () => {
    const newProduct: PharmacyProduct = {
      form: '',
      prodId: '',
      strength: '',
      prodName: '',
      controlled: null,
      clinicName: null,
      finalPrice: null,
      availability: null,
      dispenseSize: '',
      scheduleCode: '',
      concentration: '',
      quantityUnits: '',
      controlledStates: null,
      identifier: null,
    };
    onChange('products', [...(formData.products || []), newProduct]);
  };

  const handleRemoveProduct = (index: number) => {
    onChange(
      'products',
      (formData.products || []).filter((_, i) => i !== index)
    );
  };

  return (
    <div className='space-y-4'>
      {/* Quantity Tags */}
      <div>
        <div className='row g-3 tw-mb-4'>
          <div className='col-12'>
            <p className='text-lg mb-0'>Vial Size (mL)</p>
          </div>
        </div>

        <div className='row g-3 tw-mb-2'>
          <div className='col-12'>
            <div className='d-flex gap-2'>
              <input
                type='text'
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('quantity', quantityInput, setQuantityInput);
                  }
                }}
                className='form-control dark-input border-black rounded-1'
                placeholder='Add quantity and press Enter'
              />
              <button
                type='button'
                onClick={() => handleAddTag('quantity', quantityInput, setQuantityInput)}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
                style={{ whiteSpace: 'nowrap' }}
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>
        </div>

        <div className='tw-flex tw-flex-wrap tw-gap-2'>
          {(formData.quantity || []).map((item, index) => (
            <button
              key={index}
              type='button'
              onClick={() => handleRemoveTag('quantity', index)}
              className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-full tw-cursor-pointer tw-transition-all tw-font-medium tw-text-sm tw-bg-blue-100 tw-text-blue-700 hover:tw-bg-blue-200 tw-border tw-border-blue-300'
            >
              {item}
              <FiX className='w-3 h-3' />
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Categories Tags */}
      <div>
        <div className='row g-3 tw-mb-4'>
          <div className='col-12'>
            <p className='text-lg mb-0 mt-4'>Medicine Categories</p>
          </div>
        </div>

        <div className='row g-3 tw-mb-2'>
          <div className='col-12'>
            <div className='d-flex gap-2'>
              <input
                type='text'
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('medicineCategories', categoryInput, setCategoryInput);
                  }
                }}
                className='form-control dark-input border-black rounded-1'
                placeholder='Add category and press Enter'
              />
              <button
                type='button'
                onClick={() => handleAddTag('medicineCategories', categoryInput, setCategoryInput)}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
                style={{ whiteSpace: 'nowrap' }}
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>
        </div>

        <div className='tw-flex tw-flex-wrap tw-gap-2'>
          {(formData.medicineCategories || []).map((item, index) => (
            <button
              key={index}
              type='button'
              onClick={() => handleRemoveTag('medicineCategories', index)}
              className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-full tw-cursor-pointer tw-transition-all tw-font-medium tw-text-sm tw-bg-blue-100 tw-text-blue-700 hover:tw-bg-blue-200 tw-border tw-border-blue-300'
            >
              {item}
              <FiX className='w-3 h-3' />
            </button>
          ))}
        </div>
      </div>

      {/* Supply Days Tags */}
      <div>
        <div className='row g-3 tw-mb-4'>
          <div className='col-12'>
            <p className='text-lg mb-0 mt-4'>Supply Days</p>
          </div>
        </div>

        <div className='row g-3 tw-mb-2'>
          <div className='col-12'>
            <div className='d-flex gap-2'>
              <input
                type='number'
                value={supplyDayInput}
                onChange={(e) => setSupplyDayInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag('supplyDays', supplyDayInput, setSupplyDayInput);
                  }
                }}
                className='form-control dark-input border-black rounded-1'
                placeholder='Add supply days and press Enter'
              />
              <button
                type='button'
                onClick={() => handleAddTag('supplyDays', supplyDayInput, setSupplyDayInput)}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
                style={{ whiteSpace: 'nowrap' }}
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>
        </div>

        <div className='tw-flex tw-flex-wrap tw-gap-2'>
          {(formData.supplyDays || []).map((item, index) => (
            <button
              key={index}
              type='button'
              onClick={() => handleRemoveTag('supplyDays', index)}
              className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-full tw-cursor-pointer tw-transition-all tw-font-medium tw-text-sm tw-bg-blue-100 tw-text-blue-700 hover:tw-bg-blue-200 tw-border tw-border-blue-300'
            >
              {item}
              <FiX className='w-3 h-3' />
            </button>
          ))}
        </div>
      </div>

      {/* Dosage Tags */}
      <div>
        <div className='row g-3 tw-mb-4'>
          <div className='col-12'>
            <p className='text-lg mb-0 mt-4'>Dosage</p>
          </div>
        </div>

        <div className='row g-3 tw-mb-2'>
          <div className={hasRoutes(selectedMedicine?.value || '') ? 'col-md-4' : 'col-md-5'}>
            <ReactSelect
              value={selectedMedicine}
              onChange={handleMedicineSelect}
              options={medicineOptions}
              placeholder='Select Medicine'
              isSearchable={false}
              className='tw-text-left'
            />
          </div>
          
          {/* Route selector - only show for medicines with routes (like nad) */}
          {selectedMedicine && hasRoutes(selectedMedicine.value) && (
            <div className='col-md-4'>
              <ReactSelect
                value={selectedRoute}
                onChange={handleRouteSelect}
                options={routeOptions}
                placeholder='Select Route'
                isSearchable={false}
                className='tw-text-left'
              />
            </div>
          )}
          
          <div className={hasRoutes(selectedMedicine?.value || '') ? 'col-md-3' : 'col-md-5'}>
            <input
              type='number'
              value={dosageInput}
              onChange={(e) => setDosageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDosage();
                }
              }}
              className='form-control dark-input border-black rounded-1'
              placeholder='Enter dosage'
              disabled={!selectedMedicine || (hasRoutes(selectedMedicine.value) && !selectedRoute)}
            />
          </div>
          <div className='col-md-1'>
            <button
              type='button'
              onClick={handleAddDosage}
              className='btn btn-outline-secondary d-flex align-items-center gap-2'
              style={{ whiteSpace: 'nowrap' }}
              disabled={
                !selectedMedicine ||
                !dosageInput.trim() ||
                (hasRoutes(selectedMedicine.value) && !selectedRoute)
              }
            >
              <FiPlus /> Add
            </button>
          </div>
        </div>

        {/* Show available dosages for selected medicine/route */}
        {selectedMedicine && availableDosagesForMedicine.length > 0 && (
          <div className='tw-mb-3'>
            <p className='tw-text-sm tw-text-gray-600 tw-mb-2'>
              Available dosages for {selectedMedicine.label}
              {selectedRoute ? ` (${selectedRoute.label})` : ''}:
            </p>
            <div className='tw-flex tw-flex-wrap tw-gap-2'>
              {availableDosagesForMedicine.map((dosage, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => {
                    const medicine = selectedMedicine.value;
                    const updatedDosage: DosageStructure = JSON.parse(JSON.stringify(currentBackendDosage));

                    if (hasRoutes(medicine) && selectedRoute) {
                      // Handle route-based removal
                      const routeData = updatedDosage[medicine] as { im?: number[]; sq?: number[] };
                      if (routeData && routeData[selectedRoute.value]) {
                        routeData[selectedRoute.value] = routeData[selectedRoute.value]!.filter((d) => d !== dosage);
                        updatedDosage[medicine] = routeData;
                      }
                    } else {
                      // Handle simple array-based removal
                      const currentArray = Array.isArray(updatedDosage[medicine])
                        ? (updatedDosage[medicine] as number[])
                        : [];
                      updatedDosage[medicine] = currentArray.filter((d) => d !== dosage);
                    }

                    setCurrentBackendDosage(updatedDosage);
                    onChange('dosage', updatedDosage);
                  }}
                  className='tw-flex tw-items-center tw-justify-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-full tw-cursor-pointer tw-transition-all tw-font-medium tw-text-sm tw-bg-blue-100 tw-text-blue-700 hover:tw-bg-blue-200 tw-border tw-border-blue-300'
                >
                  {dosage}
                  <FiX className='w-3 h-3' />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div>
        <div className='mb-4 mt-4'>
          <h5 className='mb-0 fw-semibold'>Products</h5>
        </div>

        {formData.products && formData.products.length > 0 ? (
          <>
            <div className='row g-3'>
              {formData.products.map((product, index) => (
                <div key={index} className='col-12'>
                  <div className='card pt-2'>
                    <div className='card-body position-relative'>
                      {/* Delete Button */}
                      <div className='tw-absolute tw-top-0 tw-right-2'>
                        <button
                          type='button'
                          onClick={() => handleRemoveProduct(index)}
                          className='btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center !tw-p-2 rounded-circle'
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      <h6 className='fw-semibold mb-3'>Product {index + 1}</h6>

                      <div className='row g-3'>
                        {/* Form */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`form-${index}`}>
                            Form
                          </label>
                          <input
                            id={`form-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter form'
                            value={product.form || ''}
                            onChange={(e) => handleProductChange(index, 'form', e.target.value)}
                          />
                          {errors[`product-form-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-form-${index}`]}</div>
                          )}
                        </div>

                        {/* Product ID */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`prodId-${index}`}>
                            Product ID
                          </label>
                          <input
                            id={`prodId-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter product ID'
                            value={product.prodId}
                            onChange={(e) => handleProductChange(index, 'prodId', e.target.value)}
                          />
                          {errors[`product-prodId-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-prodId-${index}`]}</div>
                          )}
                        </div>

                        {/* Identifier */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`identifier-${index}`}>
                            Identifier
                          </label>
                          <input
                            id={`identifier-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter identifier'
                            value={product.identifier || ''}
                            onChange={(e) => handleProductChange(index, 'identifier', e.target.value)}
                          />
                        </div>

                        {/* Product Name */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`prodName-${index}`}>
                            Product Name
                          </label>
                          <input
                            id={`prodName-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter product name'
                            value={product.prodName}
                            onChange={(e) => handleProductChange(index, 'prodName', e.target.value)}
                          />
                          {errors[`product-prodName-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-prodName-${index}`]}</div>
                          )}
                        </div>

                        {/* Strength */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`strength-${index}`}>
                            Strength
                          </label>
                          <input
                            id={`strength-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter strength'
                            value={product.strength || ''}
                            onChange={(e) => handleProductChange(index, 'strength', e.target.value)}
                          />
                          {errors[`product-strength-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-strength-${index}`]}</div>
                          )}
                        </div>

                        {/* Clinic Name */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`clinicName-${index}`}>
                            Clinic Name
                          </label>
                          <input
                            id={`clinicName-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter clinic name'
                            value={product.clinicName || ''}
                            onChange={(e) => handleProductChange(index, 'clinicName', e.target.value)}
                          />
                        </div>

                        {/* Controlled */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`controlled-${index}`}>
                            Controlled
                          </label>
                          <input
                            id={`controlled-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter controlled'
                            value={product.controlled || ''}
                            onChange={(e) => handleProductChange(index, 'controlled', e.target.value)}
                          />
                        </div>

                        {/* Final Price */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`finalPrice-${index}`}>
                            Final Price
                          </label>
                          <input
                            id={`finalPrice-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter final price'
                            value={product.finalPrice || ''}
                            onChange={(e) => handleProductChange(index, 'finalPrice', e.target.value)}
                          />
                        </div>

                        {/* Availability */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`availability-${index}`}>
                            Availability
                          </label>
                          <input
                            id={`availability-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter availability'
                            value={product.availability || ''}
                            onChange={(e) => handleProductChange(index, 'availability', e.target.value)}
                          />
                        </div>

                        {/* Dispense Size */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`dispenseSize-${index}`}>
                            Dispense Size
                          </label>
                          <input
                            id={`dispenseSize-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter dispense size'
                            value={product.dispenseSize || ''}
                            onChange={(e) => handleProductChange(index, 'dispenseSize', e.target.value)}
                          />
                          {errors[`product-dispenseSize-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-dispenseSize-${index}`]}</div>
                          )}
                        </div>

                        {/* Schedule Code */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`scheduleCode-${index}`}>
                            Schedule Code
                          </label>
                          <input
                            id={`scheduleCode-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter schedule code'
                            value={product.scheduleCode || ''}
                            onChange={(e) => handleProductChange(index, 'scheduleCode', e.target.value)}
                          />
                          {errors[`product-scheduleCode-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-scheduleCode-${index}`]}</div>
                          )}
                        </div>

                        {/* Concentration */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`concentration-${index}`}>
                            Concentration
                          </label>
                          <input
                            id={`concentration-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter concentration'
                            value={product.concentration || ''}
                            onChange={(e) => handleProductChange(index, 'concentration', e.target.value)}
                          />
                          {errors[`product-concentration-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-concentration-${index}`]}</div>
                          )}
                        </div>

                        {/* Quantity Units */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`quantityUnits-${index}`}>
                            Quantity Units
                          </label>
                          <input
                            id={`quantityUnits-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter quantity units'
                            value={product.quantityUnits || ''}
                            onChange={(e) => handleProductChange(index, 'quantityUnits', e.target.value)}
                          />
                          {errors[`product-quantityUnits-${index}`] && (
                            <div className='text-danger small mt-1'>{errors[`product-quantityUnits-${index}`]}</div>
                          )}
                        </div>

                        {/* Controlled States */}
                        <div className='col-md-6 col-lg-4'>
                          <label className='form-label fw-semibold' htmlFor={`controlledStates-${index}`}>
                            Controlled States
                          </label>
                          <input
                            id={`controlledStates-${index}`}
                            type='text'
                            className='form-control dark-input border-black rounded-1'
                            placeholder='Enter controlled states'
                            value={product.controlledStates || ''}
                            onChange={(e) => handleProductChange(index, 'controlledStates', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Product Button at Bottom */}
            <div className='text-center mt-4'>
              <button
                type='button'
                onClick={handleAddProduct}
                className='btn btn-outline-secondary d-flex align-items-center gap-2'
              >
                <FiPlus /> Add Product
              </button>
            </div>
          </>
        ) : (
          <div className='text-center py-5'>
            <p className='text-muted mb-3'>No products added yet.</p>
            <button
              type='button'
              onClick={handleAddProduct}
              className='btn btn-outline-secondary d-flex align-items-center gap-2 mx-auto'
            >
              <FiPlus /> Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
