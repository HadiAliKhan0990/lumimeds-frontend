'use client';

import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect, useMemo } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { EnumRxType, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { ReactDatePicker } from '@/components/elements';
import { formatDateForInput } from '@/lib/helper';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';
import {
  RX_TYPE_OPTIONS,
  SCRIPT_RX_DIAGNOSIS_OPTIONS,
  SCRIPT_RX_DIAGNOSIS_DEFAULT,
} from '@/constants/pharmacy';

export interface ScriptRxPharmacyItemProps {
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
}

export const ScriptRxPharmacyItem = ({
  products = [],
  drugForms,
  shippingServices,
  quantitites,
  dosageData,
  supplyDays,
}: ScriptRxPharmacyItemProps) => {
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
      // ScriptRx doesn't use bullet points
      const notes = generalNotes.join('\n');

      const clinicalDifferenceStatement = clinicalNotes.map((note) => note.note).join('\n');

      setFieldValue('directions', notes);

      setFieldValue('instructions', clinicalDifferenceStatement);
    },
  });

  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();

  // Format dosages for ScriptRx: show "15 mg / 15.1 mg" for 15 dosage
  const formattedDosages = useMemo(() => {
    return (dosages as Array<{ label: string; value: number }>).map((dosage) => {
      if (dosage.value === 15) {
        return {
          ...dosage,
          label: '15 mg / 15.1 mg',
        };
      }
      return dosage;
    });
  }, [dosages]);

  const strength = values.drugStrength;

  const daysSupply = values.daysSupply;

  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement, notes } = notesAutoAppendHandler();

    // ScriptRx doesn't use bullet points - remove them if present
    const notesWithoutBullets = notes.replace(/^•\s/gm, '').trim();
    const clinicalWithoutBullets = clinicalDifferenceStatement.replace(/^•\s/gm, '').trim();

    setFieldValue('directions', notesWithoutBullets);

    setFieldValue('instructions', clinicalWithoutBullets);
  };

  useEffect(() => {
    configsOnDrugChange('instructions');
  }, [values.drugName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    if (selectedProduct && strength && daysSupply) setFetchPharmacyNotesCount((prev) => prev + 1);
  }, [selectedProduct, strength, daysSupply]);

  useEffect(() => {
    if (!values.diagnosis) {
      setFieldValue('diagnosis', SCRIPT_RX_DIAGNOSIS_DEFAULT);
    }
  }, [values.diagnosis, setFieldValue]);

  // Auto-select quantity based on drug name (e.g., "2.5 ML" -> quantity "2.5")
  useEffect(() => {
    if (selectedProduct?.prodName && quantitites && quantitites.length > 0) {
      const drugName = selectedProduct.prodName.trim();
      
      // Extract volume from drug name (look for pattern like "X.X ML" or "X ML" at the end)
      // Try to match patterns like "2.5 ML", "1.25 ML", "2 ML", "2.1 ML" at the end of the string
      const volumeMatch = drugName.match(/(\d+\.?\d*)\s*ML\s*$/i);
      
      if (volumeMatch && volumeMatch[1]) {
        const extractedVolume = volumeMatch[1];
        
        // Check if this volume exists in the quantities array
        const matchingQuantity = quantitites.find((q) => {
          // Compare as strings, removing any whitespace
          return q.trim() === extractedVolume.trim();
        });
        
        if (matchingQuantity) {
          setFieldValue('quantity', matchingQuantity);
        }
      }
    }
  }, [selectedProduct, quantitites, setFieldValue]);

  // Set default daysSupply to first available option if current value doesn't exist in options
  useEffect(() => {
    if (daysSupplyOptions.length > 0 && values.daysSupply !== undefined) {
      const currentValueExists = daysSupplyOptions.some(
        (option) => (option as OptionValue).value === values.daysSupply
      );
      
      if (!currentValueExists) {
        const firstOption = daysSupplyOptions[0] as OptionValue;
        setFieldValue('daysSupply', firstOption.value);
      }
    }
  }, [daysSupplyOptions, values.daysSupply]);

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

              setFieldValue('rxNumber', '');
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
              type='text'
              className='form-control shadow-none'
            />
            <ErrorMessage name='rxNumber' className='invalid-feedback d-block' component={'div'} />
          </div>
        )}

        <div className='col-lg-6'>
          <label className='form-label'>Diagnosis</label>
          <ReactSelect
            options={SCRIPT_RX_DIAGNOSIS_OPTIONS}
            value={
              values.diagnosis
                ? { label: values.diagnosis, value: values.diagnosis }
                : null
            }
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('diagnosis', value);
            }}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            name='diagnosis'
            isSearchable={false}
            placeholder='Select Diagnosis'
          />
          <ErrorMessage name='diagnosis' className='invalid-feedback d-block' component={'div'} />
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
            options={formattedDosages as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={
              values.drugStrength
                ? {
                    label: String(values.drugStrength) === '15' ? '15 mg / 15.1 mg' : `${values.drugStrength} mg`,
                    value: Number(values.drugStrength),
                  }
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
              values.shippingService ? { label: values.shippingService?.name, value: values.shippingService?.id } : null
            }
            onChange={(option) => {
              const { value } = option as OptionValue;

              const selectedId = `${value}`;
              const foundService = shippingServices.find((service) => `${service.id}` === selectedId);

              setFieldValue('shippingService', {
                id: foundService?.id ?? value,
                name: foundService?.name ?? '',
              });
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

        <div className={values?.rxType === EnumRxType.REFILL ? 'col-lg-6' : 'col-lg-12'}>
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

