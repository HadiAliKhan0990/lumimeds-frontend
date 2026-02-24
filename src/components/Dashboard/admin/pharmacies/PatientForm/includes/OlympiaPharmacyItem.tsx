'use client';

import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { useMinDate } from '@/hooks/useMinDate';
import { ReactDatePicker } from '@/components/elements';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';

interface Props {
  products?: PharmacyProduct[];
  shippingServices?: Array<{ id: number; name: string }>;
  dosageData?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  supplyDays?: number[] | null;
  quantitites?: string[] | null;
}

export const OlympiaPharmacyItem = ({
  products = [],
  shippingServices = [],
  dosageData,
  supplyDays,
  quantitites,
}: Props) => {
  const { values, setFieldValue, handleBlur } = useFormikContext<PatientFormValues>();

  const {
    selectedProduct,
    PRODUCTS_OPTIONS,
    SHIPPING_OPTIONS,
    dosages,
    handleChangeDrug,
    configsOnDrugChange,
    defaultConfigs,
    selectedPharmacyName,
    isFetchingPharmacyNotes,
    setFetchPharmacyNotesCount,
  } = usePharmacyFieldsLogic({
    products,
    shippingServices,
    dosageData,
    supplyDays,

    onFetchPharmacyNotesSuccess: ({ generalNotes }) => {
      const notes = generalNotes.map((note) => `• ${note}`).join('\n');

      setFieldValue('notes', notes);
    },
  });

  const minDate = useMinDate(100);

  const strength = values.dosage;

  const quantityOptions = (quantitites || []).map((q) => ({ label: q, value: q }));
  const parseQty = (raw: string) => {
    const m = raw.match(/\d+(?:\.\d+)?/);
    return m ? Math.round(parseFloat(m[0])) : 0;
  };

  useEffect(() => {
    if (selectedProduct && strength) setFetchPharmacyNotesCount((prev) => prev + 1);
  }, [selectedProduct, strength]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    setFieldValue('instructions', 'Use as directed');
    const saturdayService = shippingServices?.find((service) => service?.name?.toLowerCase() === 'saturday');

    if (saturdayService) {
      timeout = setTimeout(() => {
        setFieldValue('shippingService', { id: saturdayService?.name, name: saturdayService?.name });
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    configsOnDrugChange();
  }, [values.drugName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    if (selectedProduct && strength) setFetchPharmacyNotesCount((prev) => prev + 1);
  }, [selectedProduct, strength]);

  useEffect(() => {
    setFieldValue('instructions', 'Use as directed');
  }, []);

  return (
    <div className='row g-4'>
      <div className='col-lg-12'>
        <label className='form-label'>Drug Name</label>
        <ReactSelect
          options={PRODUCTS_OPTIONS}
          value={selectedProduct ? { label: selectedProduct.prodName, value: selectedProduct.prodId } : null}
          onChange={(option) => handleChangeDrug({ option, fieldName: 'drugName' })}
          classNames={{
            control: () => 'w-100 rounded',
            indicatorSeparator: () => 'd-none',
          }}
          name='drugName'
          onBlur={handleBlur}
          isSearchable
          placeholder={'Select Drug Name'}
        />
        <ErrorMessage name='drugName' className='invalid-feedback d-block' component={'div'} />
      </div>
      <div className='col-lg-6'>
        <label className='form-label'>Dosage</label>
        <ReactSelect
          options={dosages}
          value={values.dosage ? { label: `${values.dosage} mg`, value: values.dosage } : null}
          name='dosage'
          onBlur={handleBlur}
          onChange={(option) => {
            const { value } = option as OptionValue;
            setFieldValue('dosage', value);
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
        <ErrorMessage name='drugName' className='invalid-feedback d-block' component={'div'} />
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
            setFieldValue('shippingService', {
              id: value,
              name: SHIPPING_OPTIONS.find((service) => service.value === value)?.label,
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
      <div className='col-md-4'>
        <label className='form-label'>Qty</label>
        <ReactSelect
          options={quantityOptions as OptionsOrGroups<unknown, GroupBase<unknown>>}
          value={values.qty ? { label: `${values.qty}`, value: values.qty } : null}
          name='qty'
          onBlur={handleBlur}
          onChange={(option) => {
            const { value } = option as OptionValue;
            setFieldValue('qty', parseQty(value as string));
          }}
          isSearchable={false}
          placeholder='Select Qty'
          classNames={{
            control: () => 'w-100 rounded',
            indicatorSeparator: () => 'd-none',
          }}
        />
        <ErrorMessage name='qty' className='invalid-feedback d-block' component={'div'} />
      </div>
      <div className='col-md-4'>
        <label className='form-label'>Refills</label>
        <Field id='refills' name='refills' type='number' className='form-control shadow-none' />
        <ErrorMessage name='refills' className='invalid-feedback d-block' component={'div'} />
      </div>
      <div className='col-md-4'>
        <div className='d-flex flex-column align-items-start'>
          <label className='form-label'>Last Visit</label>

          <ReactDatePicker
            name='lastVisit'
            maxDate={new Date()}
            selected={values.lastVisit}
            onChange={(date) => setFieldValue('lastVisit', date)}
            minDate={minDate}
            dateFormat='MM/dd/yyyy'
            wrapperClassName='w-100'
          />
        </div>

        <ErrorMessage name='lastVisit' className='invalid-feedback d-block' component={'div'} />
      </div>
      <div className='col-lg-6'>
        <label className='form-label'>Notes</label>
        <div className='position-relative'>
          <Field as='textarea' rows={3} name='notes' className='form-control shadow-none tw-resize-none' />
          <NotesFetchingSpinner isFetchingPharmacyNotes={isFetchingPharmacyNotes} />
        </div>
        <ErrorMessage name='notes' className='invalid-feedback d-block' component={'div'} />
      </div>
      <div className='col-lg-6'>
        <label className='form-labe'>Instructions</label>
        <Field
          as='textarea'
          rows={3}
          id='instructions'
          name='instructions'
          className='form-control shadow-none tw-resize-none'
        />
        <ErrorMessage name='instructions' className='invalid-feedback d-block' component={'div'} />
      </div>
    </div>
  );
};
