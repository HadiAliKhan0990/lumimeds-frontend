'use client';

import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';

export interface BoothwynPharmacyItemProps {
  products?: PharmacyProduct[];
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
}

const QUANTITY_UNITS = [
  { label: 'Vial', value: `vial` },
  { label: 'Each', value: `each` },
  { label: 'Tablet', value: `Tablet` },
  { label: 'Tablets', value: `tablets` },
];

const ORDER_TYPE_OPTIONS = [
  { label: 'Dropship', value: `1` },
  { label: 'Clinic Administration', value: `2` },
];

export const BoothwynPharmacyItem = ({
  products = [],
  shippingServices,
  quantitites,
  dosageData,
  supplyDays,
}: BoothwynPharmacyItemProps) => {
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
    onFetchPharmacyNotesSuccess: ({ clinicalNotes, generalNotes }) => {
      const notes = generalNotes.map((note) => `• ${note}`).join('\n');

      const clinicalDifferenceStatement = clinicalNotes.map((note) => `• ${note.note}`).join('\n');

      setFieldValue('directions', notes);

      setFieldValue('instructions', clinicalDifferenceStatement);
    },
  });

  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();

  const strength = values.drugStrength;
  const daysSupply = values.daysSupply;

  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement, notes } = notesAutoAppendHandler();
    setFieldValue('directions', notes);

    setFieldValue('instructions', clinicalDifferenceStatement);
  };

  useEffect(() => {
    if (selectedProduct && strength && daysSupply) setFetchPharmacyNotesCount((prev) => prev + 1);
  }, [selectedProduct, strength, daysSupply]);

  useEffect(() => {
    configsOnDrugChange('instructions');
  }, [values.drugName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);
    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  return (
    <>
      <div className='row g-4'>
        <div className='col-lg-6'>
          <label className='form-label'>Order Type</label>
          <ReactSelect
            options={ORDER_TYPE_OPTIONS as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={values.orderType ? { label: `${values.orderType.name}`, value: values.orderType.id } : null}
            name='orderType'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('orderType', {
                id: value,
                name: ORDER_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? '',
              });
            }}
            isSearchable={false}
            placeholder='Select Order Type'
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
          />
          <ErrorMessage name='orderType' className='invalid-feedback d-block' component={'div'} />
        </div>
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

        <div className='col-lg-6'>
          <label className='form-label'>Strength</label>
          <ReactSelect
            options={dosages as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={
              values.drugStrength ? { label: `${values.drugStrength} mg`, value: Number(values.drugStrength) } : null
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
              values.shippingService ? { label: values.shippingService?.name, value: values.shippingService?.id } : null
            }
            onChange={(option) => {
              const { value } = option as OptionValue;
              const foundService = shippingServices.find((service) => service.id === value);
              setFieldValue('shippingService', { id: value, name: foundService?.name ?? '' });
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

        <div className='col-lg-6'>
          <label className='form-label'>Quantity Units</label>
          <ReactSelect
            options={QUANTITY_UNITS}
            value={values.quantityUnits ? { label: `${values.quantityUnits}`, value: values.quantityUnits } : null}
            name='quantityUnits'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('quantityUnits', value);
            }}
            isSearchable={false}
            placeholder='Select Quantity Units'
            classNames={{
              control: () => 'w-100 rounded text-capitalize',
              indicatorSeparator: () => 'd-none',
            }}
          />
          <ErrorMessage name='quantityUnits' className='invalid-feedback d-block' component={'div'} />
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
