'use client';

import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { ReactDatePicker } from '@/components/elements';
import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue, SingleOrder } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect, useCallback, useRef } from 'react';
import { EnumRxType, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { PharmacyClinicalNotes, useLazyGetValiantPharmacyNotesQuery } from '@/store/slices/pharmaciesApiSlice';
import { formatDateForInput } from '@/lib/helper';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';
import { RX_TYPE_OPTIONS } from '@/constants/pharmacy';

// Type for order with metaData (capital D) from backend
// Uses the order type from SingleOrder which matches the backend response
type OrderWithMetaData = SingleOrder['order'];

export interface ValliantPharmacyItemProps {
  products?: PharmacyProduct[];
  drugForms: OptionsOrGroups<unknown, GroupBase<unknown>>;
  shippingServices: Array<{ id: number; name: string }>;
  quantitites?: string[] | null;
  dosageData?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  supplyDays?: number[] | null;
  order?: OrderWithMetaData;
  isOrderReady?: boolean;
}

export const ValliantPharmacyItem = ({
  products = [],
  drugForms,
  shippingServices,
  quantitites,
  dosageData,
  supplyDays,
  order,
}: ValliantPharmacyItemProps) => {
  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();
  const populatedOrderIdRef = useRef<string | null>(null);
  const isInitialPopulationDoneRef = useRef<boolean>(false);
  const lastDrugNameRef = useRef<string | null>(null);
  const prescriptionDirectionsSetForRef = useRef<{ productId: string; route: string; dosage: string } | null>(null);
  const isProductChangingRef = useRef<boolean>(false);

  const [getValiantPharmacyNotes] = useLazyGetValiantPharmacyNotesQuery();

  // Helper: Check if order is longevity type
  const isLongevityOrder = order?.metaData?.medicineType?.toLowerCase() === 'longevity';

  // Helper: Get prescription instruction data
  const prescriptionInstruction = order?.prescriptionInstructions?.[0];

  // Helper: Find NAD product based on subscription duration
  const findNadProduct = useCallback(() => {
    if (!products.length) return null;

    const durationText = (order?.metaData as Record<string, unknown>)?.durationText as string | undefined;
    const vialType = durationText?.toLowerCase().includes('monthly') ? '1 vial' : '3 vial';

    // Try to find product matching vial type
    let nadProduct = products.find((p) => {
      const name = p.prodName?.toLowerCase() || '';
      return name.includes('nad') && name.includes(vialType);
    });

    // Fallback to any NAD product
    if (!nadProduct) {
      nadProduct = products.find((p) => p.prodName?.toLowerCase().includes('nad'));
    }

    return nadProduct;
  }, [products, order?.metaData]);

  // Helper function to set directions from order for NAD products
  const setDirectionsFromOrderIfNAD = useCallback((product: PharmacyProduct | null | undefined, fallbackDirections?: string) => {
    const isNADProduct = product?.prodName?.toLowerCase().includes('nad');
    if (!isNADProduct) {
      if (fallbackDirections) setFieldValue('directions', fallbackDirections);
      return false;
    }

    const expectedNadProduct = findNadProduct();
    const isMatchingProduct = expectedNadProduct && product?.prodId === expectedNadProduct.prodId;

    if (isMatchingProduct && prescriptionInstruction?.directions) {
      const instrRoute = String(prescriptionInstruction.route || '').toLowerCase();
      const instrDosage = String(prescriptionInstruction.dosage || '');
      const currentRoute = String(values.route || '').toLowerCase();
      const currentDosage = String(values.drugStrength || '');

      if (instrRoute === currentRoute && instrDosage === currentDosage) {
        setFieldValue('directions', prescriptionInstruction.directions);
        return true;
      }
    }

    if (fallbackDirections) {
      setFieldValue('directions', fallbackDirections);
    }
    return false;
  }, [prescriptionInstruction, setFieldValue, findNadProduct, values.route, values.drugStrength]);

  // Callback for notes API success
  const handleNotesSuccess = useCallback(({ clinicalNotes, generalNotes }: { clinicalNotes: PharmacyClinicalNotes[]; generalNotes: string[] }) => {
    const notes = generalNotes.map((note) => `• ${note}`).join('\n');
    const clinicalDifferenceStatement = clinicalNotes.map((note) => `• ${note.note}`).join('\n');

    setFieldValue('instructions', clinicalDifferenceStatement);

    // For NAD products, use prescriptionInstructions directions if available
    const currentProduct = products.find((p) => p.prodId === values.drugName);
    if (currentProduct?.prodName?.toLowerCase().includes('nad')) {
      setDirectionsFromOrderIfNAD(currentProduct, notes);
    } else {
      setFieldValue('directions', notes);
    }
  }, [products, values.drugName, setFieldValue, setDirectionsFromOrderIfNAD]);

  const {
    PRODUCTS_OPTIONS,
    SHIPPING_OPTIONS,
    dosages,
    daysSupplyOptions,
    selectedPharmacyName,
    handleChangeDrug,
    defaultConfigs,
    configsOnDrugChange,
    selectedProduct,
    setSelectedProduct,
    showClinicalDifferenceStatement,
    setShowClinicalDifferenceStatement,
    selectedCategories,
    choosenCategories,
    setChoosenCategories,
    notesAutoAppendHandler,
    setFetchPharmacyNotesCount,
    isFetchingPharmacyNotes,
  } = usePharmacyFieldsLogic({
    products,
    shippingServices,
    dosageData,
    supplyDays,
    onFetchPharmacyNotesSuccess: handleNotesSuccess,
  });

  const strength = values.drugStrength;

  const daysSupply = values.daysSupply;


  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement } = notesAutoAppendHandler();

    // Only set clinical difference statement in the Notes field
    if (clinicalDifferenceStatement) {
      setFieldValue('instructions', clinicalDifferenceStatement);
    }
  };

  // Handle drug name changes - skip configsOnDrugChange for longevity orders
  useEffect(() => {
    if (lastDrugNameRef.current === values.drugName) return;
    lastDrugNameRef.current = values.drugName;

    if (!isLongevityOrder) {
      configsOnDrugChange('instructions');
    }
  }, [values.drugName, isLongevityOrder, configsOnDrugChange]);


  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  // Trigger pharmacy notes fetch to get clinical notes
  useEffect(() => {
    if (selectedProduct && strength && daysSupply) setFetchPharmacyNotesCount((prev) => prev + 1);
  }, [selectedProduct, strength, daysSupply]);

  // Auto-populate for longevity orders - set drug name only
  useEffect(() => {
    if (!isLongevityOrder || !products.length) return;

    const nadProduct = findNadProduct();
    if (!nadProduct) return;

    // Set the product
    setSelectedProduct(nadProduct);
    setFieldValue('drugName', nadProduct.prodId);
    setFieldValue('lfProductId', nadProduct.prodId);
    setFieldValue('drugForm', nadProduct.form || '');
    setFieldValue('rxType', EnumRxType.NEW);
  }, [isLongevityOrder, products, findNadProduct, setSelectedProduct, setFieldValue]);

  useEffect(() => {
    if (!isLongevityOrder || !order?.id) return;
    const timeoutId = setTimeout(() => {
      if (populatedOrderIdRef.current === order?.id) return;

      const instruction = order?.prescriptionInstructions?.[0];
      const route = instruction?.route ? String(instruction.route).toLowerCase() : 'sq';
      const daysSupplyVal = instruction?.daysSupply ? Number(instruction.daysSupply) : 30;
      const dosageVal = instruction?.dosage ? String(instruction.dosage) : '25';
      const directionsVal = instruction?.directions || '';

      const nadProduct = findNadProduct();
      if (nadProduct) {
        setSelectedProduct(nadProduct);
        setFieldValue('drugName', nadProduct.prodId);
        setFieldValue('lfProductId', nadProduct.prodId);
      }

      setFieldValue('route', route);
      setFieldValue('daysSupply', daysSupplyVal);
      setFieldValue('drugStrength', dosageVal);

      if (drugForms?.length) {
        const firstForm = (drugForms[0] as { value: string })?.value;
        if (firstForm) {
          setFieldValue('drugForm', firstForm);
        }
      }

      if (directionsVal) {
        setFieldValue('directions', directionsVal);
        prescriptionDirectionsSetForRef.current = { productId: nadProduct?.prodId || '', route, dosage: dosageVal };
      } else {
        getValiantPharmacyNotes({
          productName: 'nad',
          category: 'longevity',
          daysSupply: daysSupplyVal,
          route: route,
          dosage: dosageVal,
        })
          .unwrap()
          .then((data) => {
            const notes = data?.[0]?.notes;
            if (notes?.length) {
              setFieldValue('directions', notes.join('\n'));
            }
          })
          .catch(console.error);
      }

      // Mark as populated
      populatedOrderIdRef.current = order?.id || null;
      // Delay setting this flag to let React process state changes first
      // This prevents the route/dosage change effect from running during initial population
      setTimeout(() => {
        isInitialPopulationDoneRef.current = true;
      }, 100);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isLongevityOrder, order?.id, drugForms, findNadProduct, setSelectedProduct, setFieldValue, getValiantPharmacyNotes]);

  useEffect(() => {
    if (!isLongevityOrder || !selectedProduct) return;

    setFieldValue('selectedProduct', selectedProduct);

    if (values.drugStrength) {
      setFieldValue('startingDose', Number(values.drugStrength));
    }

    if (!values.quantityUnits) {
      setFieldValue('quantityUnits', selectedProduct.quantityUnits || 'mL');
    }
    if (!values.quantity) {
      setFieldValue('quantity', 1);
    }
  }, [isLongevityOrder, selectedProduct, values.drugStrength, values.quantityUnits, values.quantity, setFieldValue]);

  // Helper to check if selected product matches the order's expected NAD product
  const isMatchingOrderProduct = useCallback(() => {
    if (!isLongevityOrder) return false;
    const expectedNadProduct = findNadProduct();
    return expectedNadProduct && selectedProduct?.prodId === expectedNadProduct.prodId;
  }, [isLongevityOrder, findNadProduct, selectedProduct]);

  const shouldUsePrescriptionDirections = useCallback((route: string, dosage: string) => {
    if (!prescriptionInstruction?.directions) return false;

    if (!isMatchingOrderProduct()) return false;

    const instrRoute = String(prescriptionInstruction.route || '').toLowerCase();
    const instrDosage = String(prescriptionInstruction.dosage || '');
    return instrRoute === route.toLowerCase() && instrDosage === dosage;
  }, [prescriptionInstruction, isMatchingOrderProduct]);

  // Update directions when route or dosage changes for matching longevity product
  useEffect(() => {
    // Only for longevity orders with matching product
    if (!isLongevityOrder || !isMatchingOrderProduct()) return;
    if (!values.route || !values.drugStrength) return;

    // Skip until initial population is complete
    if (!isInitialPopulationDoneRef.current) return;
    if (populatedOrderIdRef.current !== order?.id) return;

    if (isProductChangingRef.current) return;

    const currentRoute = values.route.toLowerCase();
    const currentDosage = values.drugStrength;
    const currentProductId = selectedProduct?.prodId || '';

    const setFor = prescriptionDirectionsSetForRef.current;
    if (setFor && setFor.productId === currentProductId && setFor.route === currentRoute && setFor.dosage === currentDosage) {
      // Already have correct directions from prescriptionInstructions, don't overwrite
      return;
    }

    // Check if prescriptionInstructions has directions for this exact product/route/dosage
    if (shouldUsePrescriptionDirections(currentRoute, currentDosage)) {
      setFieldValue('directions', prescriptionInstruction!.directions);
      prescriptionDirectionsSetForRef.current = { productId: currentProductId, route: currentRoute, dosage: currentDosage };
      return;
    }

    // Route or dosage changed to different values - fetch new directions from API
    // Clear the ref since we're fetching new directions
    prescriptionDirectionsSetForRef.current = null;

    getValiantPharmacyNotes({
      productName: 'nad',
      category: 'longevity',
      daysSupply: Number(values.daysSupply) || 30,
      route: currentRoute,
      dosage: currentDosage,
    })
      .unwrap()
      .then((data) => {
        const notes = data?.[0]?.notes;
        if (notes?.length) {
          setFieldValue('directions', notes.join('\n'));
        }
      })
      .catch(console.error);
  }, [values.route, values.drugStrength, values.daysSupply, isLongevityOrder, isMatchingOrderProduct, shouldUsePrescriptionDirections, prescriptionInstruction, order?.id, setFieldValue, getValiantPharmacyNotes, selectedProduct]);

  // Track the last product ID we processed for manual drug changes
  const lastProcessedProductRef = useRef<string | null>(null);

  // Handle MANUAL drug selection changes (when user changes from dropdown)
  useEffect(() => {
    if (!selectedProduct) return;

    // Skip if same product
    if (lastProcessedProductRef.current === selectedProduct.prodId) return;

    if (lastProcessedProductRef.current === null && isLongevityOrder) {
      lastProcessedProductRef.current = selectedProduct.prodId;
      return;
    }

    isProductChangingRef.current = true;
    lastProcessedProductRef.current = selectedProduct.prodId;

    const isNADProduct = selectedProduct.prodName?.toLowerCase().includes('nad');

    if (isNADProduct) {
      // NAD product selected
      if (isMatchingOrderProduct() && prescriptionInstruction) {
        // MATCHING PRODUCT: Use prescriptionInstructions data
        const route = prescriptionInstruction.route
          ? String(prescriptionInstruction.route).toLowerCase()
          : 'sq';
        const daysSupplyValue = prescriptionInstruction.daysSupply
          ? Number(prescriptionInstruction.daysSupply)
          : 30;
        const dosageValue = prescriptionInstruction.dosage
          ? String(prescriptionInstruction.dosage)
          : '25';
        const directions = prescriptionInstruction.directions || '';

        setFieldValue('route', route);
        setFieldValue('daysSupply', daysSupplyValue);
        setFieldValue('drugStrength', dosageValue);

        if (directions) {
          setFieldValue('directions', directions);
          // Track that we set directions for this product/route/dosage
          prescriptionDirectionsSetForRef.current = { productId: selectedProduct.prodId, route, dosage: dosageValue };
        } else {
          prescriptionDirectionsSetForRef.current = null;
          getValiantPharmacyNotes({
            productName: 'nad',
            category: 'longevity',
            daysSupply: daysSupplyValue,
            route: route,
            dosage: dosageValue,
          })
            .unwrap()
            .then((data) => {
              const notes = data?.[0]?.notes;
              if (notes?.length) {
                setFieldValue('directions', notes.join('\n'));
              }
            })
            .catch(console.error);
        }
      } else {
        // NON-MATCHING NAD PRODUCT: Use defaults
        const defaultRoute = 'sq';
        const defaultDaysSupply = 30;
        const firstDosage = dosageData?.nad?.[defaultRoute]?.[0] || 25;
        const firstDosageStr = String(firstDosage);

        setFieldValue('route', defaultRoute);
        setFieldValue('daysSupply', defaultDaysSupply);
        setFieldValue('drugStrength', firstDosageStr);

        if (shouldUsePrescriptionDirections(defaultRoute, firstDosageStr)) {
          setFieldValue('directions', prescriptionInstruction!.directions);
          prescriptionDirectionsSetForRef.current = { productId: selectedProduct.prodId, route: defaultRoute, dosage: firstDosageStr };
        } else {
          setFieldValue('directions', '');
          prescriptionDirectionsSetForRef.current = null;
          // Fetch directions from API
          setTimeout(() => {
            getValiantPharmacyNotes({
              productName: 'nad',
              category: 'longevity',
              daysSupply: defaultDaysSupply,
              route: defaultRoute,
              dosage: firstDosageStr,
            })
              .unwrap()
              .then((data) => {
                const notes = data?.[0]?.notes;
                if (notes?.length) {
                  setFieldValue('directions', notes.join('\n'));
                }
              })
              .catch(console.error);
          }, 100);
        }
      }
    } else {
      // NON-NAD product: select first available dosage
      if (dosages && dosages.length > 0) {
        const firstDosage = (dosages[0] as { value: number })?.value;
        if (firstDosage !== undefined) {
          setFieldValue('drugStrength', String(firstDosage));
        }
      }
    }

    setTimeout(() => {
      isProductChangingRef.current = false;
    }, 200);
  }, [selectedProduct, isMatchingOrderProduct, prescriptionInstruction, dosageData, dosages, setFieldValue, getValiantPharmacyNotes, order?.id, isLongevityOrder, shouldUsePrescriptionDirections]);

  return (
    <>
      <div className='row g-4'>
        <div className='col-lg-6'>
          <label className='form-label'>RX Type</label>
          <ReactSelect
            options={RX_TYPE_OPTIONS}
            value={
              values?.rxType
                ? { label: values.rxType === EnumRxType.NEW ? 'New' : 'Refill', value: values.rxType }
                : null
            }
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('rxType', value);

              setFieldValue('rxNumber', 0);
            }}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            name='rxType'
            isSearchable
            placeholder={'Select Rx Type'}
          />
          <ErrorMessage name='rxType' className='invalid-feedback d-block' component={'div'} />
        </div>

        {values.rxType === EnumRxType.REFILL && (
          <div className='col-lg-6'>
            <label className='form-label'>Rx Number</label>
            <Field
              value={values.rxNumber}
              id='rxNumber'
              name='rxNumber'
              type='number'
              className='form-control shadow-none'
            />
            <ErrorMessage name='rxNumber' className='invalid-feedback d-block' component={'div'} />
          </div>
        )}

        <div className='col-lg-6'>
          <label className='form-label'>Drug Name</label>
          <ReactSelect
            options={PRODUCTS_OPTIONS}
            value={selectedProduct ? { label: selectedProduct.prodName, value: selectedProduct.prodId } : null}
            onChange={(option) => handleChangeDrug({ option, fieldName: 'drugName' })}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            name='drugName'
            isSearchable
            placeholder={'Select Drug Name'}
          />
          <ErrorMessage name='drugName' className='invalid-feedback d-block' component={'div'} />
        </div>
        {selectedProduct?.prodName?.toLowerCase().includes('nad') && (
          <div className='col-lg-6'>
            <label className='form-label'>Route</label>
            <ReactSelect
              options={[
                { label: 'IM (Intramuscular)', value: 'im' },
                { label: 'SQ (Subcutaneous)', value: 'sq' },
              ]}
              isOptionDisabled={(option) => option.value === 'im'}
              value={
                values.route
                  ? {
                    label: values.route.toLowerCase() === 'im' ? 'IM (Intramuscular)' : 'SQ (Subcutaneous)',
                    value: values.route.toLowerCase(),
                  }
                  : null
              }
              onChange={(option) => {
                const { value } = option as OptionValue;
                setFieldValue('route', value);

                // Check if drug and route match the order
                const expectedNadProduct = findNadProduct();
                const isMatchingDrug = expectedNadProduct && selectedProduct?.prodId === expectedNadProduct.prodId;
                const instructionRoute = prescriptionInstruction?.route ? String(prescriptionInstruction.route).toLowerCase() : '';

                if (isMatchingDrug && value === instructionRoute && prescriptionInstruction?.dosage) {
                  // Matching drug + route: use prescriptionInstructions dosage
                  setFieldValue('drugStrength', String(prescriptionInstruction.dosage));
                } else {
                  // Different route: set first available dosage
                  const routeKey = value as 'im' | 'sq';
                  const firstDosage = dosageData?.nad?.[routeKey]?.[0];
                  if (firstDosage) {
                    setFieldValue('drugStrength', String(firstDosage));
                  } else {
                    setFieldValue('drugStrength', '');
                  }
                }
              }}
              onBlur={handleBlur}
              classNames={{
                control: () => 'w-100 rounded',
                indicatorSeparator: () => 'd-none',
              }}
              name='route'
              isSearchable={false}
              placeholder='Select Route'
            />
            <ErrorMessage name='route' className='invalid-feedback d-block' component={'div'} />
          </div>
        )}
        <div className='col-lg-6'>
          <label className='form-label'>
            {selectedProduct?.prodName?.toLowerCase().includes('nad') ? 'Starting Dose' : 'Strength'}
          </label>
          <ReactSelect
            options={dosages as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={
              values.drugStrength
                ? (() => {
                  const mg = Number(values.drugStrength);
                  const concentration = selectedProduct?.concentration;
                  const concentrationValue = parseFloat(String(concentration)) || 0;

                  if (concentrationValue > 0) {
                    const mlValue = (mg / concentrationValue).toFixed(2);
                    return { label: `${mg} mg (${mlValue} mL / ${mg} units)`, value: mg };
                  }
                  return { label: `${mg} mg`, value: mg };
                })()
                : null
            }
            name='drugStrength'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;

              setFieldValue('drugStrength', `${value}`);
            }}
            isSearchable={false}
            placeholder='Select Dosage'
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
          />
          <ErrorMessage name='drugStrength' className='invalid-feedback d-block' component={'div'} />
        </div>

        <div className='col-lg-6'>
          <label className='form-label'>Shipping Method</label>
          <ReactSelect
            options={SHIPPING_OPTIONS as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={
              values.shippingService
                ? {
                  label: values.shippingService.name,
                  value: values.shippingService.id?.toString?.() ?? '',
                }
                : null
            }
            onChange={(option) => {
              const { value } = option as OptionValue;
              const selectedId = value?.toString?.() ?? '';

              const foundService = shippingServices.find((service) => service.id?.toString?.() === selectedId);

              setFieldValue(
                'shippingService',
                foundService ? { id: selectedId, name: foundService.name } : { id: selectedId, name: '' }
              );
            }}
            name='shippingService'
            onBlur={handleBlur}
            isSearchable
            placeholder='Select Shipping Method'
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            styles={{
              menu: (baseStyles) => ({
                ...baseStyles,
                textTransform: 'capitalize',
              }),
              container: (baseStyles) => ({
                ...baseStyles,
                textTransform: 'capitalize',
              }),
            }}
          />
          <ErrorMessage name='shippingService' className='invalid-feedback d-block' component={'div'} />
        </div>

        <div className='col-lg-6'>
          <label className='form-label'>Drug Form</label>
          <ReactSelect
            options={drugForms}
            value={values.drugForm ? { label: `${values.drugForm}`, value: values.drugForm } : null}
            name='drugForm'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('drugForm', value);

              // const notes = generateDispensingInstructions(Number(value), selectedProduct?.concentration ?? '');
              // setFieldValue('instructions', notes);
            }}
            isSearchable={false}
            placeholder='Select Drug Form'
            noOptionsMessage={() =>
              values.drugName ? 'No drug form options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
          />
          <ErrorMessage name='drugForm' className='invalid-feedback d-block' component={'div'} />
        </div>
        {!selectedProduct?.prodName?.toLowerCase().includes('nad') && (
          <div className='col-lg-6'>
            <label className='form-label'>Quantity</label>
            <ReactSelect
              options={(quantitites || []).map((q) => ({ label: q, value: q }))}
              value={values.quantity ? { label: `${values.quantity}`, value: values.quantity } : null}
              name='quantity'
              onBlur={handleBlur}
              onChange={(option) => {
                const { value } = option as OptionValue;
                setFieldValue('quantity', value);
              }}
              isSearchable={false}
              placeholder='Select Quantity'
              classNames={{
                control: () => 'w-100 rounded',
                indicatorSeparator: () => 'd-none',
              }}
            />
            <ErrorMessage name='quantity' className='invalid-feedback d-block' component={'div'} />
          </div>
        )}
        <div className='col-lg-6'>
          <label className='form-label'>Refills</label>
          <Field value={values.refills} id='refills' name='refills' type='text' className='form-control shadow-none' />
          <ErrorMessage name='refills' className='invalid-feedback d-block' component={'div'} />
        </div>
        <div className='col-lg-6 d-flex flex-column'>
          <label className='form-label'>Date Written</label>
          <ReactDatePicker
            name='dateWritten'
            onBlur={handleBlur}
            maxDate={new Date()}
            selected={values.dateWritten ? new Date(values.dateWritten) : null}
            onChange={(date) => {
              const convertedDate = formatDateForInput(date);
              setFieldValue('dateWritten', convertedDate || null);
            }}
            dateFormat='MM/dd/yyyy'
          />
          <ErrorMessage name='dateWritten' className='invalid-feedback d-block' component={'div'} />
        </div>

        <div className='col-lg-6'>
          <label className='form-label'>Days Supply</label>
          <ReactSelect
            options={daysSupplyOptions}
            value={values.daysSupply ? { label: `${values.daysSupply}`, value: values.daysSupply } : null}
            name='daysSupply'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('daysSupply', value);
            }}
            isSearchable={false}
            placeholder='Select Days Supply'
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
          />
          <ErrorMessage name='daysSupply' className='invalid-feedback d-block' component={'div'} />
        </div>
        <div className='col-lg-6'>
          <label className='form-label d-flex justify-content-between'>
            <span>Directions</span>
          </label>

          <div className='position-relative'>
            <Field
              value={values.directions}
              as='textarea'
              rows={3}
              name='directions'
              className='form-control shadow-none tw-resize-none'
            />
            <NotesFetchingSpinner isFetchingPharmacyNotes={isFetchingPharmacyNotes} />
          </div>
          <ErrorMessage name='directions' className='invalid-feedback d-block' component={'div'} />
        </div>
        <div className='col-lg-6'>
          <ClinicalDifferenceLabel
            label='Notes'
            onClickClinicalDifferenceStatement={setShowClinicalDifferenceStatement}
            isProductSelected={!!selectedProduct}
          />

          <div className='position-relative'>
            <Field
              value={values.instructions}
              as='textarea'
              rows={3}
              name='instructions'
              className='form-control shadow-none tw-resize-none'
            />
            <NotesFetchingSpinner isFetchingPharmacyNotes={isFetchingPharmacyNotes} />
          </div>
          <ErrorMessage name='instructions' className='invalid-feedback d-block' component={'div'} />
        </div>
      </div>
      <DrugCategoryNotesSelection
        onAddClinicalDifferenceStatement={notesAutoAppendWrapper}
        onChoosenCategories={setChoosenCategories}
        choosenCategories={choosenCategories}
        show={showClinicalDifferenceStatement}
        setShow={setShowClinicalDifferenceStatement}
        categories={selectedCategories}
        selectedDrugName={selectedProduct?.prodName}
      />
    </>
  );
};
