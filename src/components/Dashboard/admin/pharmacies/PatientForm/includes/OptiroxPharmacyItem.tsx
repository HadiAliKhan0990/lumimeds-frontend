'use client';

import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { ReactDatePicker } from '@/components/elements';
import { formatDateForInput } from '@/lib/helper';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';

export interface OptiroxPharmacyItempROPS {
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

export const OptiroxPharmacyItem = ({
  products = [],
  shippingServices,
  quantitites,
  dosageData,
  supplyDays,
}: OptiroxPharmacyItempROPS) => {
  const {
    PRODUCTS_OPTIONS,
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
    isFetchingPharmacyNotes
  } = usePharmacyFieldsLogic({
    products,
    shippingServices,
    dosageData,
    supplyDays,
    prodValOptKey: 'prodName',
    onFetchPharmacyNotesSuccess: ({ clinicalNotes, generalNotes }) => {
      const notes = generalNotes.map((note) => `• ${note}`).join('\n');

      const clinicalDifferenceStatement = clinicalNotes.map((note) => `• ${note.note}`).join('\n');

      setFieldValue(
        'directions',
        `${notes}` + (clinicalDifferenceStatement ? ` \n ${clinicalDifferenceStatement}` : '')
      );
    },
  });

  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();

  const strength = values.drugStrength;
  const daysSupply = values.daysSupply;

  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement, notes } = notesAutoAppendHandler();

    setFieldValue('directions', `${notes}` + (clinicalDifferenceStatement ? ` \n ${clinicalDifferenceStatement}` : ''));
  };

  useEffect(() => {
    configsOnDrugChange();
  }, [values.drugName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    if (selectedProduct && strength && daysSupply) setFetchPharmacyNotesCount((prev) => prev + 1);
        
  }, [selectedProduct, strength, daysSupply]);

    return (
    <>
      <div className='row g-4'>
        <div className='col-lg-6'>
          <label className='form-label'>Drug Name</label>
          <ReactSelect
            options={PRODUCTS_OPTIONS}
            value={selectedProduct ? { label: selectedProduct.prodName, value: selectedProduct.prodName } : null}
            onChange={(option) => {
              handleChangeDrug({ option, fieldName: 'drugName' });
            }}
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
          <label className='form-label'>Refills</label>
          <Field
            value={values.refills}
            id='refills'
            name='refills'
            type='number'
            className='form-control shadow-none'
          />
          <ErrorMessage name='refills' className='invalid-feedback d-block' component={'div'} />
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
          <ClinicalDifferenceLabel
            label='Directions'
            onClickClinicalDifferenceStatement={setShowClinicalDifferenceStatement}
            isProductSelected={!!selectedProduct}
          />

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
