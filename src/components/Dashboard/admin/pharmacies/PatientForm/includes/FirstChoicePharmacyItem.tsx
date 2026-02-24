'use client';

import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { EnumRxType, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { ReactDatePicker } from '@/components/elements';
import { formatDateForInput } from '@/lib/helper';
import CreatableSelect from 'react-select/creatable';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';
import {
  RX_TYPE_OPTIONS,
} from '@/constants/pharmacy';

export interface FirstChoicePharmacyItemProps {
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

export const FirstChoicePharmacyItem = ({
  products = [],
  drugForms,
  shippingServices,
  quantitites,
  dosageData,
  supplyDays,
}: FirstChoicePharmacyItemProps) => {
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

  // const isTirzepitide = selectedProduct?.prodName?.toLowerCase().includes('tirzepatide');

  const strength = values.drugStrength;

  const daysSupply = values.daysSupply;

  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement, notes } = notesAutoAppendHandler();

    setFieldValue('directions', notes);
    setFieldValue('instructions', clinicalDifferenceStatement);
  };

  useEffect(() => {
    if (!values.shippingService) {
      const fedexOption = SHIPPING_OPTIONS.find((option) =>
        option.label.toLowerCase().includes('fedex standard overnight')
      );

      if (fedexOption) {
        const foundService = shippingServices.find((service) => service.id === Number(fedexOption.value));
        setFieldValue('shippingService', {
          id: fedexOption.value,
          name: foundService?.name ?? fedexOption.label,
        });
      }
    }
  }, []);

  useEffect(() => {
    configsOnDrugChange('directions');

    setFieldValue('quantity', undefined);
  }, [values.drugName]);

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
            defaultValue={SHIPPING_OPTIONS.find((option) =>
              option.label.toLowerCase().includes('fedex standard overnight')
            )}
            value={
              values.shippingService ? { label: values.shippingService?.name, value: values.shippingService?.id } : null
            }
            name='shippingService'
            onBlur={handleBlur}
            isSearchable
            placeholder='Select Shipping Method'
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            onChange={(option) => {
              const { value } = option as OptionValue;
              const foundService = shippingServices.find(
                (service) => service.id === Number(value) || service.id === value
              );
              setFieldValue('shippingService', {
                id: value,
                name: foundService?.name ?? '',
              });
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
          <CreatableSelect
            options={daysSupplyOptions}
            defaultValue={{ label: '90', value: 90 }}
            value={values.daysSupply ? { label: `${values.daysSupply}`, value: values.daysSupply } : null}
            name='daysSupply'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('daysSupply', value);
            }}
            isSearchable={true}
            placeholder='Select or type Days Supply'
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
            formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
            createOptionPosition='first'
            onCreateOption={(inputValue) => {
              const numValue = parseInt(inputValue, 10);
              if (!isNaN(numValue)) {
                setFieldValue('daysSupply', numValue);
              }
            }}
            onMenuOpen={() => {
              // Set default value of 90 if no value is selected
              if (!values.daysSupply) {
                setFieldValue('daysSupply', 90);
              }
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
