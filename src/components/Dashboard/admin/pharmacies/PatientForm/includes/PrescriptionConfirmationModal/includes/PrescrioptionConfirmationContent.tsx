import { useStates } from '@/hooks/useStates';
import { formatUSPhoneWithoutPlusOne, removePlusSign } from '@/lib/helper';
import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { formatInTimeZone, format } from 'date-fns-tz';
import { PROVIDER_DEFAULT_CITY } from '@/constants';
import { formatUSDate } from '@/helpers/dateFormatter';
import { EnumRxType } from '@/store/slices/adminPharmaciesSlice';
import { InfoItem } from './InforItem';
import { ScriptInfoItem } from './ScriptInfoItem';
import { ConformationFooterPrescriberDetailsRowItem } from './ConformationFooterPrescriberDetailsRowItem';
import { DetailsInfoSectionColumn } from './DetailsInfoSectionColumn';
import { DetailsInfoSectionContainer } from './DetailsInfoSectionContainer';
import { DetailsInfoSection } from './DetailsInfoSection';
import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { calculatePremierRxTotalMg, calculatePremierRxTotalMl } from '../../PremierRxPharmacyItem';
import {
  calculateCre8TotalMgWithDosageRules,
  calculateCre8TotalMl
} from '../../Cre8PharmacyItem';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import { formatCre8Vials, generateCre8PrescriptionId } from '../../cre8Utils';
import { PHARMACY_NAMES } from '@/lib/pharmacyConstants';

export const PrescrioptionConfirmationContent = () => {
  const { values, setFieldValue } = useFormikContext<PatientFormValues>();
  const { nameToCode } = useStates();

  const providerAddress = values.doctorAddress.split(',');

  // Generate transmission ID for OptioRx only (prescriber's UUID)
  const transmissionId = useMemo(() => {
    return values.prescriber || 'N/A';
  }, [values.prescriber]);

  // Generate prescription ID for Cre8 pharmacy (date-based number for uniqueness)
  const prescriptionId = useMemo(() => {
    if (values.selectedPharmacyName === 'cre8' && !values.prescriptionId) {
      const generatedId = generateCre8PrescriptionId();
      // Set it in form values so it's available when submitting
      setFieldValue('prescriptionId', generatedId);
      return generatedId;
    }
    return values.prescriptionId;
  }, [values.selectedPharmacyName, values.prescriptionId, setFieldValue]);

  return (
    <>
      <div id='electronic-prescription-content' className='d-flex flex-column gap-2'>
        <div className='d-flex flex-column gap-2 rounded-1 px-4 py-4'>
          {/* Logo at the top */}
          <div className='d-flex justify-content-center align-items-center py-3 mb-3'>
            <Image src={Logo} alt='Logo' width={200} height={60} className='object-contain' />
          </div>

          <div className='tw-break-inside-avoid'>
            <DetailsInfoSection title='Prescriber Details'>
              <DetailsInfoSectionContainer>
                <DetailsInfoSectionColumn>
                  <InfoItem
                    title='Prescriber'
                    value={`${values?.doctorFirstName ?? ''} ${values?.doctorLastName ?? ''}`}
                  />
                  <InfoItem title='Address Line 1' value={`${providerAddress?.[0] ?? 'N/A'}`} />
                  <InfoItem title='Address Line 2' value={`${providerAddress?.[1] ?? 'N/A'}`} />

                  <InfoItem
                    className='text-capitalize'
                    title='City'
                    value={`${PROVIDER_DEFAULT_CITY.split('_').join(' ').toLowerCase()}`}
                  />
                  <InfoItem title='State' value={`${values.doctorState}`} />
                  <InfoItem title='Zip' value={String(values.doctorZipCode) ?? 'N/A'} />
                </DetailsInfoSectionColumn>
                <DetailsInfoSectionColumn>
                  <InfoItem
                    title='Phone'
                    // value={formatUSPhoneWithoutPlusOne(removePlusSign(values.doctorPhone))}
                    value='(415) 968-0890'
                  />
                  <InfoItem title='NPI' value={`${values.doctorNpi ?? 'N/A'}`} />
                  <InfoItem title='DEA' value={`${values.doctorDea ?? 'N/A'}`} />
                  <InfoItem title='SPI' value={`${values.doctorSpi ?? 'N/A'}`} />
                  <InfoItem title='State License' value={`${values.doctorStateLicense ?? 'N/A'}`} />
                  {values?.selectedPharmacyName === 'optiorx' && (
                    <InfoItem title='Transmission ID' value={transmissionId} />
                  )}
                </DetailsInfoSectionColumn>
              </DetailsInfoSectionContainer>
            </DetailsInfoSection>
          </div>

          <div className='tw-break-inside-avoid'>
            <DetailsInfoSection title='Patient Details'>
              <DetailsInfoSectionContainer>
                <DetailsInfoSectionColumn>
                  <InfoItem title='Name' value={`${values?.firstName} ${values?.lastName}`} />
                  <InfoItem
                    title='Date Of Birth'
                    value={
                      values?.dob
                        ? formatUSDate(
                            values.dob instanceof Date
                              ? `${values.dob.getFullYear()}-${String(values.dob.getMonth() + 1).padStart(
                                  2,
                                  '0'
                                )}-${String(values.dob.getDate()).padStart(2, '0')}`
                              : String(values.dob)
                          )
                        : 'N/A'
                    }
                  />
                  <InfoItem title='Phone' value={formatUSPhoneWithoutPlusOne(removePlusSign(values.patientPhone))} />
                  <InfoItem title='Allergies' value={values?.allergies ?? 'N/A'} />
                  <InfoItem title='Medications' value={values?.medications ?? 'N/A'} />
                </DetailsInfoSectionColumn>
                <DetailsInfoSectionColumn>
                  <InfoItem title='Address Line 1' value={`${values?.patientShippingStreet || 'N/A'}`} />
                  {values.patientShippingStreet2 && (
                    <InfoItem title='Address Line 2' value={`${values?.patientShippingStreet2 || 'N/A'}`} />
                  )}
                  <InfoItem title='City' value={values?.patientShippingCity ?? 'N/A'} />
                  <InfoItem
                    title='State'
                    value={`${nameToCode[values.patientShippingState] ?? values.patientShippingState ?? 'N/A'}`}
                  />
                  <InfoItem title='Zip' value={values?.patientShippingZip ?? 'N/A'} />
                </DetailsInfoSectionColumn>
              </DetailsInfoSectionContainer>
            </DetailsInfoSection>
          </div>

          <div title='Script' className='tw-break-inside-avoid tw-break-before-auto'>
            <p className='fw-semibold mb-2'>Script</p>
            <div className='p-3 d-flex flex-column gap-1 border rounded-2 tw-break-inside-avoid'>
              {values?.selectedPharmacyName === 'cre8' && prescriptionId ? (
                <ScriptInfoItem title='Prescription ID' value={prescriptionId} />
              ) : null}
              <ScriptInfoItem
                title='Drug'
                className='text-normal'
                value={`${values?.selectedProduct?.prodName ?? ''}`}
              />
              {values?.rxType ? (
                <ScriptInfoItem title='Rx Type' value={`${values?.rxType?.toLowerCase() ?? ''}`} />
              ) : null}
              {values?.rxType === EnumRxType.REFILL && values?.rxNumber ? (
                <ScriptInfoItem className='text-capitalize' title='Rx Number' value={`${values?.rxNumber || 0}`} />
              ) : null}
              {values?.selectedPharmacyName === 'script rx' && values?.diagnosis ? (
                <ScriptInfoItem title='Diagnosis' value={values.diagnosis} />
              ) : null}
              {values?.selectedPharmacyName !== 'boothwyn' && (
                <ScriptInfoItem title='Refills Quantity' value={`${values?.refills}`} />
              )}
              {/* Route field for Valiant pharmacy */}
              {values?.selectedPharmacyName === 'valiant' && values.route ? (
                <ScriptInfoItem
                  title='Route'
                  value={values.route === 'im' ? 'IM (Intramuscular)' : 'SQ (Subcutaneous)'}
                />
              ) : null}
              {/* Starting Dose field for Valiant pharmacy */}
              {values?.selectedPharmacyName === 'valiant' && values.startingDose ? (
                <ScriptInfoItem
                  title='Starting Dose'
                  value={(() => {
                    const startingDose = values.startingDose;
                    const concentration = values?.selectedProduct?.concentration;
                    const concentrationValue = parseFloat(String(concentration)) || 0;
                    const mlValue = startingDose / concentrationValue;
                    return `${startingDose} mg (${mlValue} mL / ${startingDose} units)`;
                  })()}
                />
              ) : null}
              {!(values?.selectedPharmacyName === 'valiant' && values?.selectedProduct?.prodName?.toLowerCase().includes('nad')) && (values.quantity || values.qty) ? (
                <ScriptInfoItem
                  title={values?.selectedPharmacyName === 'premier rx' ? 'Vial Size (1st)' : 'Qty. Prescribed'}
                  className='text-normal'
                  value={
                    values?.selectedPharmacyName === 'cre8' && values.quantity
                      ? `${calculateCre8TotalMl(values.quantity, values.vials, values.quantity2, values.vials2, values.quantity3, values.vials3).toFixed(2)} ${values?.quantityUnits || 'ML'}`
                      : (values?.selectedPharmacyName === PHARMACY_NAMES.DRUG_CRAFTERS ? `${values.totalMl} ${values?.quantityUnits}` : `${values?.quantity || values?.qty} ${values?.quantityUnits}`)
                  }
                />
              ) : null}
              {values?.vials || (values?.selectedPharmacyName === 'cre8' && values.quantity) ? (
                <ScriptInfoItem
                  title={values?.selectedPharmacyName === 'premier rx' ? 'No of Vials (1st)' : 'Vials'}
                  value={
                    values?.selectedPharmacyName === 'cre8' && values.quantity
                      ? formatCre8Vials(
                          values.quantity,
                          values.vials,
                          values.quantity2,
                          values.vials2,
                          values.quantity3,
                          values.vials3,
                          values?.quantityUnits
                        )
                      : values?.vials
                      ? `${parseInt(values?.vials as string)}`
                      : ''
                  }
                />
              ) : null}
              {values?.vialSize ? <ScriptInfoItem title='Vial Size' value={`${values?.vialSize}`} /> : null}
              {values?.selectedPharmacyName === 'premier rx' && values?.quantity2 ? (
                <ScriptInfoItem
                  title='Vial Size (2nd)'
                  className='text-normal'
                  value={`${values?.quantity2} ${values?.quantityUnits}`}
                />
              ) : null}
              {values?.selectedPharmacyName === 'premier rx' && values?.vials2 ? (
                <ScriptInfoItem title='No of Vials (2nd)' value={`${parseInt(values?.vials2 as string)}`} />
              ) : null}
              {values?.selectedPharmacyName === 'drug crafters' ||
              ((values?.selectedPharmacyName === 'premier rx' || values?.selectedPharmacyName === 'cre8') &&
                values.quantity) ? (
                <ScriptInfoItem
                  title='Total mg'
                  className='text-normal'
                  value={
                    values?.selectedPharmacyName === 'premier rx' && values?.selectedProduct?.concentration
                      ? calculatePremierRxTotalMg(
                          values.selectedProduct.concentration,
                          values.quantity,
                          values.vials,
                          values.quantity2,
                          values.vials2
                        )
                      : values?.selectedPharmacyName === 'cre8' && values?.selectedProduct?.concentration
                      ? calculateCre8TotalMgWithDosageRules(
                          values.selectedProduct.concentration,
                          values.quantity,
                          values.vials,
                          values.quantity2,
                          values.vials2,
                          values.quantity3,
                          values.vials3,
                          values.drugStrength,
                          values.daysSupply,
                        )
                        : values?.selectedPharmacyName === PHARMACY_NAMES.DRUG_CRAFTERS && values?.totalMg
                      ? `${values.totalMg} mg`
                        : `${(
                          parseFloat(values?.selectedProduct?.concentration as string) *
                          parseFloat((values?.quantity as string) || '0')
                        ).toFixed(2)} mg`
                  }
                />
              ) : null}
              {values?.selectedPharmacyName === 'premier rx' && values?.quantity ? (
                <ScriptInfoItem
                  title='Quantity / Total ml'
                  className='text-normal'
                  value={`${parseFloat(
                    calculatePremierRxTotalMl(values.quantity, values.vials, values.quantity2, values.vials2).toFixed(2)
                  ).toString()} ml`}
                />
              ) : null}
              {values?.orderType ? (
                <ScriptInfoItem title='Order Type' value={`${values?.orderType?.name ?? ''}`} />
              ) : null}
              {values?.lastVisit ? (
                <ScriptInfoItem title='Last Visit' value={format(new Date(values?.lastVisit || ''), 'MMM d, yyyy')} />
              ) : null}
              {values?.shippingService ? (
                <ScriptInfoItem
                  title='Shipping Method'
                  className='text-capitalize'
                  value={`${values?.shippingService?.name}`}
                />
              ) : null}
              {values?.dateWritten ? (
                <ScriptInfoItem
                  title='Date Written'
                  value={format(new Date(values?.dateWritten || ''), 'MMM d, yyyy')}
                />
              ) : null}
              {values?.daysSupply ? <ScriptInfoItem title='Days Supply' value={`${values?.daysSupply}`} /> : null}
              {values?.directions ? (
                <ScriptInfoItem className='text-pre-line text-normal' title='Directions' value={values?.directions} />
              ) : null}
            </div>
          </div>

          {values?.notes || values?.instructions ? (
            <div className='d-flex gap-2 mb-3 tw-break-inside-avoid'>
              <span className='fw-semibold flex-shrink-0'>Notes</span>
              <span className='fs-6 text-pre-line'>{values?.notes || values?.instructions}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className='border-top tw-break-inside-avoid rounded-bottom-3 tw-flex tw-flex-col sm:tw-flex-row tw-gap-2'>
        <div className='bg-dark fw-semibold px-1 tw-text-base tw-rounded-bl-lg text-light tw-h-6'>
          <span className='tw-align-middle -tw-translate-y-2'>Electronic Signature</span>
        </div>
        <div className='tw-flex tw-flex-grow tw-justify-between tw-flex-wrap tw-px-1'>
          <ConformationFooterPrescriberDetailsRowItem
            title='Prescriber'
            value={`${values.doctorFirstName} ${values.doctorLastName}`}
          />
          <ConformationFooterPrescriberDetailsRowItem
            title='Sent'
            value={formatInTimeZone(new Date(), 'America/Chicago', 'MM/dd/yyyy hh:mm a')}
          />
        </div>
      </div>
    </>
  );
};
