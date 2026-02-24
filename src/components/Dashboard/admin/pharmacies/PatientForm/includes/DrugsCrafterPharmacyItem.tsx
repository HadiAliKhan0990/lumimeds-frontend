import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { EnumRxType } from '@/store/slices/adminPharmaciesSlice';
import { ReactDatePicker } from '@/components/elements';
import { formatDateForInput } from '@/lib/helper';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';
import { RX_TYPE_OPTIONS } from '@/constants/pharmacy';
import {
  DrugsCrafterPharmacyItemProps
} from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/Interface/PharmacyInterface';
import { calculateTotalMg, calculateTotalMl } from '@/helpers/pharmacyHelpers';

export const DrugsCrafterPharmacyItem = ({
                                           products = [],
                                           drugForms,
                                           shippingServices,
                                           quantitites,
                                           dosageData,
                                           dosageMapping,
                                           supplyDays
                                         }: DrugsCrafterPharmacyItemProps) => {
  const {
    PRODUCTS_OPTIONS,
    dosages,
    daysSupplyOptions,
    selectedPharmacyName,
    handleChangeDrug,
    defaultConfigs,
    configsOnDrugChange,
    selectedProduct,
    // quantitySizesDrugCrafters,
    showClinicalDifferenceStatement,
    setShowClinicalDifferenceStatement,
    choosenCategories,
    setChoosenCategories,
    selectedCategories,
    isFetchingPharmacyNotes,
    notesAutoAppendHandler,
    setFetchPharmacyNotesCount,
  } = usePharmacyFieldsLogic({
    products,
    shippingServices,
    prodValOptKey: 'prodName',
    dosageData,
    dosageMapping,
    supplyDays,
    onFetchPharmacyNotesSuccess: ({ clinicalNotes, generalNotes }) => {
      const notes = generalNotes.map((note) => `• ${note}`).join('\n');

      const clinicalDifferenceStatement = clinicalNotes.map((note) => `• ${note.note}`).join('\n');

      setFieldValue('directions', notes);

      setFieldValue('instructions', clinicalDifferenceStatement);
    },
  });

  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();

  const strength = values?.drugStrength;

  const daysSupply = values?.daysSupply;

  const doctorGroup = values?.doctorGroup;

  const notesAutoAppendWrapper = () => {
    const { clinicalDifferenceStatement, notes } = notesAutoAppendHandler();

    setFieldValue('directions', notes);

    setFieldValue('instructions', clinicalDifferenceStatement);
  };

  useEffect(() => {
    configsOnDrugChange('instructions');
  }, [values.drugName]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    if (selectedProduct && strength && daysSupply && doctorGroup) {
      setFetchPharmacyNotesCount((prev) => prev + 1);
    }
  }, [selectedProduct, strength, daysSupply, doctorGroup]);
  // Calculate and update total mg when vial fields change
  useEffect(() => {
    const updateTotalValues = () => {
      if (selectedProduct?.concentration && values.quantity) {
        setFieldValue('totalMg', calculateTotalMg(selectedProduct.concentration, values.quantity, values.vials));
      } else {
        setFieldValue('totalMg', '');
      }

      if (values.vials && values.quantity) {
        const totalMl = calculateTotalMl(values.quantity, values.vials).toFixed(2);
        setFieldValue('totalMl', totalMl.toString());
      } else {
        setFieldValue('totalMl', '');
      }
    };

    updateTotalValues();
  }, [selectedProduct, values.quantity, values.vials, setFieldValue]);
  useEffect(() => {
    if (!dosageMapping || !products || products.length === 0) return;

    const mapped = dosageMapping.products?.[0];
    if (!mapped) return;

    const mappedProductId = String(mapped.id ?? '').trim();
    if (!mappedProductId) return;

    const matchedProduct = products.find((p) => String(p.externalProdId).trim() === mappedProductId);
    if (matchedProduct) {
      setFieldValue('drugName', matchedProduct?.prodName);
    }
  }, [JSON.stringify(dosageMapping), products]);
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
            value={selectedProduct ? { label: selectedProduct.prodName, value: selectedProduct.externalProdId } : null}
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
            value={values.drugStrength ? { label: `${values.drugStrength} mg`, value: values.drugStrength } : null}
            name='drugStrength'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('drugStrength', value);
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
        <div className="col-lg-6">
          <label className="form-label">Vial Size (mL)</label>
          <ReactSelect
            options={(quantitites || []).map((q) => ({ label: q, value: q }))}
            value={
              values.quantity
                ? {
                    label: `${values.quantity}`,
                    value: values.quantity,
                  }
                : null
            }
            name='quantity'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;

              setFieldValue('quantity', value);
            }}
            isSearchable={false}
            placeholder='Select Quantity'
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none',
            }}
          />

          <ErrorMessage name='quantity' className='invalid-feedback d-block' component={'div'} />
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
          <label className='form-label'>Vials Count</label>
          <div className='input-group'>
            <Field value={values.vials} id='vials' name='vials' type='text' className='form-control shadow-none' />
          </div>
          <ErrorMessage name='vials' className='invalid-feedback d-block' component={'div'} />
        </div>
        <div className="col-lg-6">
          <label className="form-label">Total mg</label>
          <div className="input-group">
            <Field
              value={
                selectedProduct
                  ? `${values.totalMg} mg`
                  : ''
              }
              readOnly
              id="totalMg"
              name="totalMg"
              type="text"
              className="form-control shadow-none"
            />
          </div>
        </div>
        <div className="col-lg-6">
          <label className="form-label">Quantity / Total mL</label>
          <div className="input-group">
            <Field
              value={
                values.totalMl
                  ? `${values.totalMl} mL`
                  : ''
              }
              readOnly
              id="totalMl"
              name="totalMl"
              type="text"
              className="form-control shadow-none"
            />
          </div>
        </div>
        <div className="col-lg-6">
          <label className="form-label">Refills</label>
          <Field
            value={values.refills}
            id="refills"
            name="refills"
            type="number"
            className="form-control shadow-none"
          />
          <ErrorMessage name="refills" className="invalid-feedback d-block" component={'div'} />
        </div>
        <div className={values?.rxType === EnumRxType.REFILL ? 'col-lg-12' : 'col-lg-6'}>
          <label className="form-label">Days Supply</label>
          <ReactSelect
            options={daysSupplyOptions}
            value={values.daysSupply ? { label: `${values.daysSupply}`, value: values.daysSupply } : null}
            name='daysSupply'
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('daysSupply', value);

              // autoNotesAppending()
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
        <div className="col-lg-6 d-flex flex-column">
          <label className="form-label">Date Written</label>
          <ReactDatePicker
            name="dateWritten"
            onBlur={handleBlur}
            maxDate={new Date()}
            selected={values.dateWritten ? new Date(values.dateWritten) : null}
            onChange={(date) => {
              const convertedDate = formatDateForInput(date);
              setFieldValue('dateWritten', convertedDate || null);
            }}
            dateFormat="MM/dd/yyyy"
          />
          <ErrorMessage name="dateWritten" className="invalid-feedback d-block" component={'div'} />
        </div>
        <div className="col-lg-6">
          <label className="form-label d-flex justify-content-between">
            <span>Directions</span>
          </label>

          <div className="position-relative">
            <Field
              value={values.directions}
              as="textarea"
              rows={3}
              name="directions"
              className="form-control shadow-none tw-resize-none"
            />
            <NotesFetchingSpinner isFetchingPharmacyNotes={isFetchingPharmacyNotes} />
          </div>
          <ErrorMessage name="directions" className="invalid-feedback d-block" component={'div'} />
        </div>
        <div className="col-lg-6">
          <ClinicalDifferenceLabel
            label="Notes"
            onClickClinicalDifferenceStatement={setShowClinicalDifferenceStatement}
            isProductSelected={!!selectedProduct}
          />

          <div className="position-relative">
            <Field
              value={values.instructions}
              as="textarea"
              rows={3}
              name="instructions"
              className="form-control shadow-none tw-resize-none"
            />
            <NotesFetchingSpinner isFetchingPharmacyNotes={isFetchingPharmacyNotes} />
          </div>
          <ErrorMessage name="instructions" className="invalid-feedback d-block" component={'div'} />
        </div>
      </div>
      <DrugCategoryNotesSelection
        onAddClinicalDifferenceStatement={notesAutoAppendWrapper}
        onChoosenCategories={setChoosenCategories}
        show={showClinicalDifferenceStatement}
        setShow={setShowClinicalDifferenceStatement}
        choosenCategories={choosenCategories}
        categories={selectedCategories}
        selectedDrugName={selectedProduct?.prodName}
      />
    </>
  );
};
