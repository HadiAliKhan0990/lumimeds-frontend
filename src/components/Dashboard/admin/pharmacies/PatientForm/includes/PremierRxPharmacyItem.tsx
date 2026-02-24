'use client';
import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { DosageMapping, EnumRxType, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { formatDateForInput } from '@/lib/helper';
import { usePharmacyFieldsLogic } from '@/hooks/usePharmacyFieldsLogic';
import { DrugCategoryNotesSelection } from './DrugCategoryNotesSelection';
import { NotesFetchingSpinner } from './NotesFetchingSpinner';
import { ClinicalDifferenceLabel } from './ClinicalDifferenceLabel';
import { RX_TYPE_OPTIONS } from '@/constants/pharmacy';
import { ReactDatePicker } from '@/components/elements';

export interface PremierRxPharmacyItemProps {
  products?: PharmacyProduct[];
  drugForms: OptionsOrGroups<unknown, GroupBase<unknown>>;
  shippingServices: Array<{ id: number; name: string }>;
  quantitites: string[];
  dosageData?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  dosageMapping?: DosageMapping | null;
  supplyDays?: number[] | null;
}

const VIALS_OPTIONS: OptionsOrGroups<unknown, GroupBase<unknown>> = Array.from({ length: 100 }, (_, index) => {
  const label = `${index + 1}`;
  return { label, value: label };
});

/**
 * Calculates total mg for Premier Rx based on the formula:
 * concentration * [Vial Size (1st) * No of Vials (1st) + Vial Size (2nd) * No of Vials (2nd)]
 *
 * @param concentration - Product concentration
 * @param quantity - Vial Size (1st)
 * @param vials - No of Vials (1st), defaults to 1 if not provided
 * @param quantity2 - Vial Size (2nd), optional
 * @param vials2 - No of Vials (2nd), optional
 * @returns Formatted total mg string (e.g., "100.00 mg") or empty string if invalid
 */
export const calculatePremierRxTotalMg = (
  concentration: number | string | null | undefined,
  quantity: number | string | undefined,
  vials?: number | string | null,
  quantity2?: number | string | null,
  vials2?: number | string | null
): string => {
  if (!quantity || !concentration) return '';

  const concentrationValue = parseFloat(String(concentration)) || 0;

  // First set: Vial Size (1st) * No of Vials (1st)
  const vialSize1st = parseFloat(String(quantity)) || 0;
  const vials1stValue = vials ? String(vials) : '';
  const noOfVials1st = vials1stValue && vials1stValue !== '' ? parseFloat(vials1stValue) : 1;
  const firstSetTotal = vialSize1st * noOfVials1st;

  // Second set: Vial Size (2nd) * No of Vials (2nd) (if available)
  let secondSetTotal = 0;
  if (quantity2) {
    const vialSize2nd = parseFloat(String(quantity2)) || 0;
    const vials2ndValue = vials2 ? String(vials2) : '';
    const noOfVials2nd = vials2ndValue && vials2ndValue !== '' ? parseFloat(vials2ndValue) : 1;
    secondSetTotal = vialSize2nd * noOfVials2nd;
  }

  return `${(concentrationValue * (firstSetTotal + secondSetTotal)).toFixed(2)} mg`;
};

/**
 * Calculates total ml for Premier Rx based on the formula:
 * Vial Size (1st) * No of Vials (1st) + Vial Size (2nd) * No of Vials (2nd)
 *
 * @param quantity - Vial Size (1st)
 * @param vials - No of Vials (1st), defaults to 1 if not provided
 * @param quantity2 - Vial Size (2nd), optional
 * @param vials2 - No of Vials (2nd), defaults to 1 if quantity2 is selected but vials2 is not
 * @returns Total ml as a number, or 0 if invalid
 */
export const calculatePremierRxTotalMl = (
  quantity: number | string | undefined,
  vials?: number | string | null,
  quantity2?: number | string | null,
  vials2?: number | string | null
): number => {
  if (!quantity) return 0;

  // First set: Vial Size (1st) * No of Vials (1st)
  const vialSize1st = parseFloat(String(quantity)) || 0;
  const vials1stValue = vials ? String(vials) : '';
  const noOfVials1st = vials1stValue && vials1stValue !== '' ? parseFloat(vials1stValue) : 1;
  const firstSetTotal = vialSize1st * noOfVials1st;

  // Second set: Vial Size (2nd) * No of Vials (2nd) (if available)
  let secondSetTotal = 0;
  if (quantity2) {
    const vialSize2nd = parseFloat(String(quantity2)) || 0;
    const vials2ndValue = vials2 ? String(vials2) : '';
    const noOfVials2nd = vials2ndValue && vials2ndValue !== '' ? parseFloat(vials2ndValue) : 1;
    secondSetTotal = vialSize2nd * noOfVials2nd;
  }

  return firstSetTotal + secondSetTotal;
};

export const PremierRxPharmacyItem = ({
                                        products = [],
                                        drugForms,
                                        shippingServices,
                                        quantitites,
                                        dosageData,
                                        dosageMapping,
                                        supplyDays,
                                      }: PremierRxPharmacyItemProps) => {
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
    choosenCategories,
    setChoosenCategories,
    selectedCategories,
    isFetchingPharmacyNotes,
    notesAutoAppendHandler,
    setFetchPharmacyNotesCount
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
    }
  });

  const { setFieldValue, values, handleBlur } = useFormikContext<PatientFormValues>();

  const quantitySizes = quantitites.map((quantity) => ({ label: quantity, value: parseFloat(quantity) }));

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

  // useEffect(() => {
  //   if (values.quantity) setFieldValue('vials', parseInt(values.quantity as string) / 2);
  // }, [values.quantity]);

  useEffect(() => {
    const timeout = setTimeout(defaultConfigs, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPharmacyName]);

  useEffect(() => {
    if (selectedProduct && strength && daysSupply && doctorGroup) {
      setFetchPharmacyNotesCount((prev) => prev + 1);
    }
  }, [selectedProduct, strength, daysSupply, doctorGroup]);

  // Calculate and set totalMg whenever product or quantity changes
  useEffect(() => {
    if (selectedProduct && values.quantity && selectedProduct.concentration) {
      const totalMg = calculatePremierRxTotalMg(
        selectedProduct.concentration,
        values.quantity,
        values.vials,
        values.quantity2,
        values.vials2
      );
      setFieldValue('totalMg', totalMg);
    } else {
      setFieldValue('totalMg', '');
    }
  }, [selectedProduct, values.quantity, values.vials, values.quantity2, values.vials2]);


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
      <div className="row g-4">
        <div className="col-lg-6">
          <label className="form-label">RX Type</label>
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
              indicatorSeparator: () => 'd-none'
            }}
            name="rxType"
            isSearchable
            placeholder={'Select Rx Type'}
          />
          <ErrorMessage name="rxType" className="invalid-feedback d-block" component={'div'} />
        </div>

        {values.rxType === EnumRxType.REFILL && (
          <div className="col-lg-6">
            <label className="form-label">Rx Number</label>
            <Field
              value={values.rxNumber}
              id="rxNumber"
              name="rxNumber"
              type="text"
              className="form-control shadow-none"
            />
            <ErrorMessage name="rxNumber" className="invalid-feedback d-block" component={'div'} />
          </div>
        )}

        <div className="col-lg-6">
          <label className="form-label">Drug Name</label>
          {/*<pre className="tw-text-xs tw-overflow-auto">{JSON.stringify(dosageMapping, null, 2)}</pre>*/}
          {/*<pre className="tw-text-xs tw-overflow-auto">{JSON.stringify(products, null, 2)}</pre>*/}
          <ReactSelect
            options={PRODUCTS_OPTIONS}
            value={selectedProduct ? { label: selectedProduct.prodName, value: selectedProduct.externalProdId } : null}
            onChange={(option) => handleChangeDrug({ option, fieldName: 'drugName' })}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
            name="drugName"
            isSearchable
            placeholder={'Select Drug Name'}
          />
          <ErrorMessage name="drugName" className="invalid-feedback d-block" component={'div'} />
        </div>
        <div className="col-lg-6">
          <label className="form-label">Strength</label>
          <ReactSelect
            options={dosages as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={values.drugStrength ? { label: `${values.drugStrength} mg`, value: values.drugStrength } : null}
            name="drugStrength"
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('drugStrength', value);
            }}
            isSearchable={false}
            placeholder="Select Dosage"
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
          />
          <ErrorMessage name="drugStrength" className="invalid-feedback d-block" component={'div'} />
        </div>
        <div className="col-lg-6">
          <label className="form-label">Vial Size (1st)</label>
          <ReactSelect
            options={values?.drugName ? (quantitySizes as OptionsOrGroups<unknown, GroupBase<unknown>>) : []}
            value={
              values.quantity
                ? {
                  label: `${values.quantity} ${values?.quantityUnits ? values?.quantityUnits : ''}`,
                  value: values.quantity
                }
                : null
            }
            name="quantity"
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('quantity', value);
            }}
            isSearchable={false}
            placeholder="Select Vial Size"
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
          />
          <ErrorMessage name="quantity" className="invalid-feedback d-block" component={'div'} />
        </div>

        <div className="col-lg-6">
          <label className="form-label">No of Vials (1st)</label>
          <ReactSelect
            options={[{ label: 'None', value: '' }, ...VIALS_OPTIONS] as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={values?.vials ? { label: `${values.vials}`, value: values.vials } : null}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('vials', value);
            }}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
            name="vials"
            isSearchable={false}
            placeholder={'Select Vials (1-100)'}
          />
          <ErrorMessage name="vials" className="invalid-feedback d-block" component={'div'} />
        </div>

        <div className="col-lg-6">
          <label className="form-label">Vial Size (2nd)</label>
          <ReactSelect
            options={values?.drugName ? (quantitySizes as OptionsOrGroups<unknown, GroupBase<unknown>>) : []}
            value={
              values.quantity2
                ? {
                  label: `${values.quantity2} ${values?.quantityUnits ? values?.quantityUnits : ''}`,
                  value: values.quantity2
                }
                : null
            }
            name="quantity2"
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('quantity2', value);
            }}
            isSearchable={false}
            placeholder="Select Vial Size (2nd)"
            noOptionsMessage={() =>
              values.drugName ? 'No dosage options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
          />
          <ErrorMessage name="quantity2" className="invalid-feedback d-block" component={'div'} />
        </div>

        <div className="col-lg-6">
          <label className="form-label">No of Vials (2nd)</label>
          <ReactSelect
            options={[{ label: 'None', value: '' }, ...VIALS_OPTIONS] as OptionsOrGroups<unknown, GroupBase<unknown>>}
            value={values?.vials2 ? { label: `${values.vials2}`, value: values.vials2 } : null}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('vials2', value);
            }}
            onBlur={handleBlur}
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
            name="vials2"
            isSearchable={false}
            placeholder={'Select Vials (2nd, 1-100)'}
          />
          <ErrorMessage name="vials2" className="invalid-feedback d-block" component={'div'} />
        </div>

        <div className="col-lg-6">
          <label className="form-label">Drug Form</label>
          <ReactSelect
            options={drugForms}
            value={values.drugForm ? { label: `${values.drugForm}`, value: values.drugForm } : null}
            name="drugForm"
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('drugForm', value);
            }}
            isSearchable={false}
            placeholder="Select Drug Form"
            noOptionsMessage={() =>
              values.drugName ? 'No drug form options available for this drug' : 'Please select a drug first'
            }
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
          />
          <ErrorMessage name="drugForm" className="invalid-feedback d-block" component={'div'} />
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

        <div className="col-lg-6">
          <label className="form-label">Total mg</label>
          <div className="input-group">
            <Field
              value={
                selectedProduct && values.quantity && selectedProduct.concentration
                  ? calculatePremierRxTotalMg(
                    selectedProduct.concentration,
                    values.quantity,
                    values.vials,
                    values.quantity2,
                    values.vials2
                  )
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
          <label className="form-label">Quantity / Total ml</label>
          <div className="input-group">
            <Field
              value={
                values.quantity
                  ? `${parseFloat(calculatePremierRxTotalMl(values.quantity, values.vials, values.quantity2, values.vials2).toFixed(2)).toString()} ml`
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

        <div className={values?.rxType === EnumRxType.REFILL ? 'col-lg-12' : 'col-lg-6'}>
          <label className="form-label">Days Supply</label>
          <ReactSelect
            options={daysSupplyOptions}
            value={values.daysSupply ? { label: `${values.daysSupply}`, value: values.daysSupply } : null}
            name="daysSupply"
            onBlur={handleBlur}
            onChange={(option) => {
              const { value } = option as OptionValue;
              setFieldValue('daysSupply', value);

              // autoNotesAppending()
            }}
            isSearchable={false}
            placeholder="Select Days Supply"
            classNames={{
              control: () => 'w-100 rounded',
              indicatorSeparator: () => 'd-none'
            }}
          />
          <ErrorMessage name="daysSupply" className="invalid-feedback d-block" component={'div'} />
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
